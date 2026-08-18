from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

VALID_STATUSES = [
    "FILED", "ASSIGNED", "VIEWED", "IN_PROGRESS",
    "ESCALATED", "PENDING_VERIFICATION", "RESOLVED", "ARCHIVED",
]

VALID_CRITICALITY = [
    "ROUTINE", "MODERATE", "ELEVATED", "HIGH", "CRITICAL", "CATASTROPHIC",
]


class CitizenBase(BaseModel):
    phone: str
    name: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class CitizenCreate(CitizenBase):
    pass


class CitizenResponse(CitizenBase):
    id: str
    reward_points: int
    created_at: datetime

    class Config:
        from_attributes = True


class OfficialBase(BaseModel):
    name: str
    role: str
    jurisdiction: Optional[str] = None
    phone: Optional[str] = None
    email: str


class OfficialCreate(OfficialBase):
    password: str


class OfficialResponse(OfficialBase):
    id: str
    avg_response_time: float
    resolution_rate: float
    complaints_assigned: int
    complaints_resolved: int
    accountability_score: int

    class Config:
        from_attributes = True


class ComplaintCreate(BaseModel):
    text_content: str = Field(..., min_length=1, max_length=5000)
    text_original: Optional[str] = None
    language_detected: Optional[str] = "en"
    voice_file_url: Optional[str] = None
    photo_urls: Optional[List[str]] = []
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    location_address: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    citizen_id: Optional[str] = None


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


class ResolutionSubmit(BaseModel):
    resolution_note: str = Field(..., min_length=1, max_length=5000)
    resolution_photos: Optional[List[str]] = []
    resolution_action: str = Field(..., pattern=r"^(REPAIRED|REPLACED|NEW|TEMP_FIX)$")
    fund_used: Optional[str] = "Municipal Fund"
    amount_spent: float = Field(..., ge=0)


class UpvoteRequest(BaseModel):
    citizen_id: str


class VerificationVote(BaseModel):
    citizen_id: str
    vote: bool


class CitizenLoginRequest(BaseModel):
    phone: str


class CitizenVerifyRequest(BaseModel):
    phone: str
    otp: str


class OfficialLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    id: str


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
