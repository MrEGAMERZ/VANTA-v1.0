"""
SAMADHAN Backend — Database Configuration
Custom Mock ORM wrapping PyMongo to support SQLAlchemy-style syntax.
"""
import os
import uuid
import logging
from datetime import datetime
from pymongo import MongoClient
import urllib.parse
from dotenv import load_dotenv

# Load env variables
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("samadhan-db")

# Read database URL
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("MONGODB_URI")
# Fallback to local MongoDB if not set or if it is sqlite
if not DATABASE_URL or not (DATABASE_URL.startswith("mongodb://") or DATABASE_URL.startswith("mongodb+srv://")):
    DATABASE_URL = "mongodb://localhost:27017/h2k"

logger.info(f"Connecting to MongoDB at: {DATABASE_URL.split('@')[-1]}") # Redact credentials for logging

# Extract db name
try:
    parsed = urllib.parse.urlparse(DATABASE_URL)
    db_name = parsed.path.lstrip('/') or "h2k"
    if '?' in db_name:
        db_name = db_name.split('?')[0]
except Exception as e:
    logger.error(f"Failed to parse database URL: {e}")
    db_name = "h2k"

# Initialize Client
client = MongoClient(DATABASE_URL)
db = client[db_name]

# Dummy Engine & MetaData
class DummyEngine:
    pass

class MetaData:
    def create_all(self, bind=None):
        logger.info("Mocking create_all: MongoDB collections initialized on demand.")

engine = DummyEngine()

# Dummy Types and Functions
class String: pass
class Integer: pass
class Float: pass
class Boolean: pass
class DateTime: pass
class Text: pass
class JSON: pass

def ForeignKey(*args, **kwargs):
    return None

def relationship(*args, **kwargs):
    return None

class Func:
    def now(self):
        return datetime.utcnow

func = Func()

# Model Query building blocks
class SortExpression:
    def __init__(self, field_name, direction):
        self.field_name = field_name
        self.direction = direction

class FieldExpression:
    def __init__(self, field_name, op, value):
        self.field_name = field_name
        self.op = op
        self.value = value

class ModelField:
    def __init__(self, name):
        self.name = name

    def __eq__(self, other):
        return FieldExpression(self.name, "eq", other)

    def __ne__(self, other):
        return FieldExpression(self.name, "ne", other)

    def __lt__(self, other):
        return FieldExpression(self.name, "lt", other)

    def __gt__(self, other):
        return FieldExpression(self.name, "gt", other)

    def __le__(self, other):
        return FieldExpression(self.name, "le", other)

    def __ge__(self, other):
        return FieldExpression(self.name, "ge", other)

    def like(self, other):
        return FieldExpression(self.name, "like", other)

    def notin_(self, other):
        return FieldExpression(self.name, "notin", other)

    def in_(self, other):
        return FieldExpression(self.name, "in", other)

    def desc(self):
        return SortExpression(self.name, -1)

    def asc(self):
        return SortExpression(self.name, 1)

class Column:
    def __init__(self, type_class=None, *args, **kwargs):
        self.type_class = type_class
        self.default = kwargs.get("default", None)
        self.primary_key = kwargs.get("primary_key", False)
        self.nullable = kwargs.get("nullable", True)
        self.unique = kwargs.get("unique", False)
        self.name = None

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return ModelField(self.name)
        return instance.__dict__.get(self.name, self.get_default())

    def __set__(self, instance, value):
        instance.__dict__[self.name] = value

    def get_default(self):
        if callable(self.default):
            return self.default()
        elif isinstance(self.default, (list, dict)):
            return type(self.default)(self.default)
        return self.default

class Base:
    metadata = MetaData()
    __tablename__ = None

    def __init__(self, **kwargs):
        fields = self._get_fields()
        for name, col in fields.items():
            if name in kwargs:
                setattr(self, name, kwargs[name])
            else:
                setattr(self, name, col.get_default())
        # Set extra fields (like relationships or custom parameters)
        for k, v in kwargs.items():
            if k not in fields:
                setattr(self, k, v)

    @classmethod
    def _get_fields(cls):
        fields = {}
        for base in cls.__mro__:
            for k, v in base.__dict__.items():
                if isinstance(v, Column):
                    if k not in fields:
                        v.name = k
                        fields[k] = v
        return fields

    def to_dict(self):
        doc = {}
        for name in self._get_fields():
            val = getattr(self, name, None)
            if name == "id" and val:
                doc["_id"] = val
            doc[name] = val
        return doc

# Query Execution Class
class MongoQuery:
    def __init__(self, model_class, collection, session=None):
        self.model_class = model_class
        self.collection = collection
        self.session = session
        self.filters = {}
        self.sorts = []

    def filter(self, *criterion):
        for crit in criterion:
            if isinstance(crit, FieldExpression):
                name, op, val = crit.field_name, crit.op, crit.value
                if op == "eq":
                    # If comparing with id, route to _id in MongoDB
                    if name == "id":
                        self.filters["_id"] = val
                    else:
                        self.filters[name] = val
                elif op == "ne":
                    target = "_id" if name == "id" else name
                    self.filters[target] = {"$ne": val}
                elif op == "lt":
                    self.filters[name] = {"$lt": val}
                elif op == "gt":
                    self.filters[name] = {"$gt": val}
                elif op == "le":
                    self.filters[name] = {"$lte": val}
                elif op == "ge":
                    self.filters[name] = {"$gte": val}
                elif op == "like":
                    regex_val = val.replace("%", ".*")
                    self.filters[name] = {"$regex": regex_val, "$options": "i"}
                elif op == "notin":
                    target = "_id" if name == "id" else name
                    self.filters[target] = {"$nin": list(val)}
                elif op == "in":
                    target = "_id" if name == "id" else name
                    self.filters[target] = {"$in": list(val)}
        return self

    def order_by(self, *criterion):
        for crit in criterion:
            if isinstance(crit, SortExpression):
                self.sorts.append((crit.field_name, crit.direction))
            elif isinstance(crit, ModelField):
                self.sorts.append((crit.name, 1))
        return self

    def first(self):
        cursor = self.collection.find(self.filters)
        if self.sorts:
            cursor = cursor.sort(self.sorts)
        doc = next(cursor, None)
        if doc:
            if "_id" in doc and "id" not in doc:
                doc["id"] = doc["_id"]
            instance = self.model_class(**doc)
            if self.session:
                self.session.add(instance)
            return instance
        return None

    def all(self):
        cursor = self.collection.find(self.filters)
        if self.sorts:
            cursor = cursor.sort(self.sorts)
        results = []
        for doc in cursor:
            if "_id" in doc and "id" not in doc:
                doc["id"] = doc["_id"]
            instance = self.model_class(**doc)
            if self.session:
                self.session.add(instance)
            results.append(instance)
        return results

# Session Class
class MongoSession:
    def __init__(self):
        self.to_save = []
        self.to_delete = []

    def query(self, model_class):
        collection_name = model_class.__tablename__
        return MongoQuery(model_class, db[collection_name], self)

    def add(self, instance):
        if instance not in self.to_save:
            self.to_save.append(instance)

    def commit(self):
        # Insert or update
        for instance in self.to_save:
            collection_name = instance.__tablename__
            doc = instance.to_dict()
            if not doc.get("_id"):
                doc["_id"] = str(uuid.uuid4())
                instance.id = doc["_id"]
                doc["id"] = instance.id
            db[collection_name].replace_one({"_id": instance.id}, doc, upsert=True)
        self.to_save.clear()

        # Delete
        for instance in self.to_delete:
            collection_name = instance.__tablename__
            if getattr(instance, "id", None):
                db[collection_name].delete_one({"_id": instance.id})
        self.to_delete.clear()

    def refresh(self, instance):
        # Read back from DB
        collection_name = instance.__tablename__
        if not getattr(instance, "id", None):
            return
        doc = db[collection_name].find_one({"_id": instance.id})
        if doc:
            fields = instance._get_fields()
            for k, v in doc.items():
                if k == "_id":
                    k = "id"
                if k in fields:
                    setattr(instance, k, v)

    def close(self):
        pass

# Factory
SessionLocal = MongoSession
Session = MongoSession

def get_db():
    db_session = MongoSession()
    try:
        yield db_session
    finally:
        db_session.close()
