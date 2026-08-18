"""
SAMADHAN Backend — Database Configuration
Custom Mock ORM wrapping PyMongo to support SQLAlchemy-style syntax.
"""
import os
import re
import uuid
import logging
from datetime import datetime
from pymongo import MongoClient
import urllib.parse
from dotenv import load_dotenv

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("samadhan-db")

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("MONGODB_URI")
if not DATABASE_URL or not (DATABASE_URL.startswith("mongodb://") or DATABASE_URL.startswith("mongodb+srv://")):
    DATABASE_URL = "mongodb://localhost:27017/h2k"

logger.info(f"Connecting to MongoDB at: {DATABASE_URL.split('@')[-1]}")

try:
    parsed = urllib.parse.urlparse(DATABASE_URL)
    db_name = parsed.path.lstrip('/') or "h2k"
    if '?' in db_name:
        db_name = db_name.split('?')[0]
except Exception as e:
    logger.error(f"Failed to parse database URL: {e}")
    db_name = "h2k"

client = MongoClient(DATABASE_URL)
db = client[db_name]


class DummyEngine:
    pass

class MetaData:
    def create_all(self, bind=None):
        logger.info("Mocking create_all: MongoDB collections initialized on demand.")

engine = DummyEngine()

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
    @staticmethod
    def now():
        return datetime.utcnow()

func = Func()


class SortExpression:
    __slots__ = ("field_name", "direction")

    def __init__(self, field_name, direction):
        self.field_name = field_name
        self.direction = direction


class FieldExpression:
    __slots__ = ("field_name", "op", "value")

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
        if self.default is None:
            return None
        if callable(self.default):
            return self.default()
        if isinstance(self.default, list):
            return []
        if isinstance(self.default, dict):
            return {}
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
            elif name != "_id":
                doc[name] = val
        return doc


def _escape_regex(value: str) -> str:
    return re.escape(value)


def _build_mongo_filter(name: str, op: str, val):
    target = "_id" if name == "id" else name
    if op == "eq":
        return {target: val}
    if op == "ne":
        return {target: {"$ne": val}}
    if op == "lt":
        return {target: {"$lt": val}}
    if op == "gt":
        return {target: {"$gt": val}}
    if op == "le":
        return {target: {"$lte": val}}
    if op == "ge":
        return {target: {"$gte": val}}
    if op == "like":
        regex_val = _escape_regex(val).replace(r"\%", ".*").replace(r"\_", ".")
        return {target: {"$regex": regex_val, "$options": "i"}}
    if op == "notin":
        return {target: {"$nin": list(val)}}
    if op == "in":
        return {target: {"$in": list(val)}}
    return {}


class MongoQuery:
    def __init__(self, model_class, collection, session=None):
        self.model_class = model_class
        self.collection = collection
        self.session = session
        self.filters = {}
        self.sorts = []
        self._limit_val = None
        self._skip_val = None

    def filter(self, *criterion):
        for crit in criterion:
            if isinstance(crit, FieldExpression):
                mongo_filter = _build_mongo_filter(crit.field_name, crit.op, crit.value)
                for key, val in mongo_filter.items():
                    if key in self.filters and isinstance(self.filters[key], dict) and isinstance(val, dict):
                        self.filters[key].update(val)
                    else:
                        self.filters[key] = val
        return self

    def order_by(self, *criterion):
        for crit in criterion:
            if isinstance(crit, SortExpression):
                self.sorts.append((crit.field_name, crit.direction))
            elif isinstance(crit, ModelField):
                self.sorts.append((crit.name, 1))
        return self

    def limit(self, n):
        self._limit_val = n
        return self

    def skip(self, n):
        self._skip_val = n
        return self

    def count(self):
        return self.collection.count_documents(self.filters)

    def _hydrate(self, doc):
        if doc is None:
            return None
        if "_id" in doc and "id" not in doc:
            doc["id"] = doc["_id"]
        instance = self.model_class(**doc)
        if self.session:
            self.session.add(instance)
        return instance

    def first(self):
        cursor = self.collection.find(self.filters)
        if self.sorts:
            cursor = cursor.sort(self.sorts)
        if self._skip_val:
            cursor = cursor.skip(self._skip_val)
        cursor = cursor.limit(1)
        doc = next(cursor, None)
        return self._hydrate(doc)

    def all(self):
        cursor = self.collection.find(self.filters)
        if self.sorts:
            cursor = cursor.sort(self.sorts)
        if self._skip_val:
            cursor = cursor.skip(self._skip_val)
        if self._limit_val:
            cursor = cursor.limit(self._limit_val)
        return [self._hydrate(doc) for doc in cursor]

    def update(self, **fields):
        if fields:
            self.collection.update_many(self.filters, {"$set": fields})

    def delete(self):
        self.collection.delete_many(self.filters)


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
        for instance in self.to_save:
            collection_name = instance.__tablename__
            doc = instance.to_dict()
            if not doc.get("_id"):
                doc["_id"] = str(uuid.uuid4())
                instance.id = doc["_id"]
            db[collection_name].replace_one({"_id": instance.id}, doc, upsert=True)
        self.to_save.clear()

        for instance in self.to_delete:
            collection_name = instance.__tablename__
            if getattr(instance, "id", None):
                db[collection_name].delete_one({"_id": instance.id})
        self.to_delete.clear()

    def refresh(self, instance):
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


SessionLocal = MongoSession
Session = MongoSession


def get_db():
    db_session = MongoSession()
    try:
        yield db_session
    finally:
        db_session.close()
