from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import Session
from datetime import timedelta
from database import get_db
from models.models import Citizen, Official
from schemas.schemas import (
    CitizenLoginRequest, CitizenVerifyRequest,
    OfficialLoginRequest, TokenResponse,
    CitizenUpdate, OfficialUpdate, CitizenResponse, OfficialResponse,
    OfficialCreate,
)
from auth.jwt_handler import (
    create_access_token, verify_password, verify_token, get_password_hash,
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    role = payload.get("role")

    if role == "CITIZEN":
        user = db.query(Citizen).filter(Citizen.id == user_id).first()
    else:
        user = db.query(Official).filter(Official.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def get_current_official(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_current_user(credentials, db)
    if isinstance(user, Citizen):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Official access required",
        )
    return user


mock_otp_store: dict[str, str] = {}


@router.post("/citizen/request-otp")
def request_otp(req: CitizenLoginRequest, db: Session = Depends(get_db)):
    mock_otp_store[req.phone] = "123456"

    citizen = db.query(Citizen).filter(Citizen.phone == req.phone).first()
    if not citizen:
        citizen = Citizen(
            phone=req.phone,
            name="Citizen " + req.phone[-4:],
            ward="Ward 7",
            district="Bengaluru South",
            location_lat=12.9716,
            location_lng=77.5946,
        )
        db.add(citizen)
        db.commit()
        db.refresh(citizen)

    return {"message": "OTP sent successfully. Enter 123456 to log in.", "phone": req.phone}


@router.post("/citizen/verify-otp", response_model=TokenResponse)
def verify_otp(req: CitizenVerifyRequest, db: Session = Depends(get_db)):
    stored_otp = mock_otp_store.get(req.phone)
    if stored_otp is None or req.otp != stored_otp:
        if req.otp != "123456":
            raise HTTPException(status_code=400, detail="Invalid OTP")

    citizen = db.query(Citizen).filter(Citizen.phone == req.phone).first()
    if not citizen:
        citizen = Citizen(
            phone=req.phone,
            name="Citizen " + req.phone[-4:],
            ward="Ward 7",
            district="Bengaluru South",
            location_lat=12.9716,
            location_lng=77.5946,
        )
        db.add(citizen)
        db.commit()
        db.refresh(citizen)

    token_data = {"sub": citizen.id, "role": "CITIZEN"}
    access_token = create_access_token(token_data, expires_delta=timedelta(hours=24))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role="CITIZEN",
        name=citizen.name or "Citizen",
        id=citizen.id,
    )


@router.post("/official/login", response_model=TokenResponse)
def official_login(req: OfficialLoginRequest, db: Session = Depends(get_db)):
    official = db.query(Official).filter(Official.email == req.email).first()
    if not official or not verify_password(req.password, official.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token_data = {"sub": official.id, "role": official.role}
    access_token = create_access_token(token_data, expires_delta=timedelta(hours=8))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=official.role,
        name=official.name,
        id=official.id,
    )


@router.post("/official/register", response_model=TokenResponse)
def official_register(req: OfficialCreate, db: Session = Depends(get_db)):
    existing = db.query(Official).filter(Official.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = get_password_hash(req.password)
    official = Official(
        name=req.name,
        role=req.role,
        jurisdiction=req.jurisdiction,
        phone=req.phone,
        email=req.email,
        password_hash=hashed_pwd,
    )
    db.add(official)
    db.commit()
    db.refresh(official)

    token_data = {"sub": official.id, "role": official.role}
    access_token = create_access_token(token_data, expires_delta=timedelta(hours=8))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=official.role,
        name=official.name,
        id=official.id,
    )


@router.get("/citizen/{id}", response_model=CitizenResponse)
def get_citizen(id: str, db: Session = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.id == id).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return citizen


@router.put("/citizen/profile", response_model=CitizenResponse)
def update_citizen_profile(
    req: CitizenUpdate,
    current_user: Citizen = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    citizen = current_user
    if req.name is not None:
        citizen.name = req.name
    if req.ward is not None:
        citizen.ward = req.ward
    if req.district is not None:
        citizen.district = req.district
    if req.location_lat is not None:
        citizen.location_lat = req.location_lat
    if req.location_lng is not None:
        citizen.location_lng = req.location_lng

    db.commit()
    db.refresh(citizen)
    return citizen


@router.put("/official/profile", response_model=OfficialResponse)
def update_official_profile(
    req: OfficialUpdate,
    current_user: Official = Depends(get_current_official),
    db: Session = Depends(get_db),
):
    official = current_user
    if req.name is not None:
        official.name = req.name
    if req.phone is not None:
        official.phone = req.phone
    if req.email is not None:
        if req.email != official.email:
            existing = db.query(Official).filter(
                Official.email == req.email
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400, detail="Email already registered"
                )
        official.email = req.email

    db.commit()
    db.refresh(official)
    return official
