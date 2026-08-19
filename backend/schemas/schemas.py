from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

# Citizen Schemas
class CitizenBase(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: Optional[str] = Field(None, max_length=100)
    ward: Optional[str] = Field(None, max_length=50)
    district: Optional[str] = Field(None, max_length=100)
    location_lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    location_lng: Optional[float] = Field(None, ge=-180.0, le=180.0)

class CitizenCreate(CitizenBase):
    pass

class CitizenResponse(CitizenBase):
    id: str
    reward_points: int
    created_at: datetime

    class Config:
        from_attributes = True

# Official Schemas
class OfficialBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(..., max_length=20)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)
    email: str = Field(..., max_length=150)

class OfficialCreate(OfficialBase):
    password: str = Field(..., min_length=8, max_length=100)

class OfficialResponse(OfficialBase):
    id: str
    avg_response_time: float
    resolution_rate: float
    complaints_assigned: int
    complaints_resolved: int
    accountability_score: int

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    text_content: str = Field(..., min_length=10, max_length=5000)
    text_original: Optional[str] = Field(None, max_length=5000)
    language_detected: Optional[str] = Field("en", max_length=10)
    voice_file_url: Optional[str] = Field(None, max_length=500)
    photo_urls: Optional[List[str]] = Field([], max_items=5)
    location_lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    location_lng: Optional[float] = Field(None, ge=-180.0, le=180.0)
    location_address: Optional[str] = Field(None, max_length=255)
    ward: Optional[str] = Field(None, max_length=50)
    district: Optional[str] = Field(None, max_length=100)
    citizen_id: Optional[str] = Field(None, max_length=100)

class ComplaintTimelineItem(BaseModel):
    action: str
    time: str
    desc: str

class ComplaintResponse(BaseModel):
    id: str
    citizen_id: Optional[str] = None
    text_content: Optional[str] = None
    text_original: Optional[str] = None
    language_detected: Optional[str] = None
    voice_file_url: Optional[str] = None
    photo_urls: List[str]
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    location_address: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    criticality_level: str
    criticality_score: int
    star_rating: int
    upvote_count: int
    assigned_to: Optional[str] = None
    assigned_tier: int
    status: str
    is_duplicate_of: Optional[str] = None
    duplicate_count: int
    filed_at: datetime
    assigned_at: Optional[datetime] = None
    first_viewed_at: Optional[datetime] = None
    deadline_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    is_overdue: bool
    near_school: bool
    near_hospital: bool
    near_highway: bool
    ai_photo_analysis: Optional[Any] = None
    
    # Resolution details
    resolution_status: Optional[str] = None
    resolution_note: Optional[str] = None
    resolution_photos: Optional[List[str]] = []
    resolution_action: Optional[str] = None
    fund_used: Optional[str] = None
    amount_spent: float
    verification_yes: int
    verification_no: int
    is_temp_fix: bool

    class Config:
        from_attributes = True

# Resolution Submission
class ResolutionSubmit(BaseModel):
    resolution_note: str
    resolution_photos: Optional[List[str]] = []
    resolution_action: str  # REPAIRED/REPLACED/NEW/TEMP_FIX
    fund_used: Optional[str] = "Municipal Fund"
    amount_spent: float

# Upvote & Verification
class UpvoteRequest(BaseModel):
    citizen_id: str

class VerificationVote(BaseModel):
    citizen_id: str
    vote: bool  # True for YES, False for NO

# Auth request
class CitizenLoginRequest(BaseModel):
    phone: str

class CitizenVerifyRequest(BaseModel):
    phone: str
    otp: str

class OfficialLoginRequest(BaseModel):
    email: str
    password: str

# Token response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    id: str

# Project recommendation schema
class DevelopmentProjectResponse(BaseModel):
    id: str
    title: str
    category: str
    ward: str
    complaint_count: int
    population_affected: int
    star_avg: float
    criticality_max: str
    budget_estimate: float
    scheme_eligible: List[str]
    ai_recommendation: Optional[str] = None
    data_evidence: Optional[Any] = None
    rank: int
    approved: Optional[bool] = False

    class Config:
        from_attributes = True

# Profile Update Schemas
class CitizenUpdate(BaseModel):
    name: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

class OfficialUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
