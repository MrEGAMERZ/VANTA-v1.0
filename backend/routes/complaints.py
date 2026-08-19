from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from database import Session
from datetime import datetime, timedelta
from database import get_db
from models.models import Complaint, Citizen, Official, Upvote
from schemas.schemas import ComplaintCreate, ComplaintResponse, UpvoteRequest
from services.ai_engine import analyze_complaint_ai, calculate_stars_rating
from services.routing import route_complaint_to_official
from services.escalation import VALID_TRANSITIONS

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

CRITICALITY_DEADLINES = {
    "CATASTROPHIC": 0.04,
    "CRITICAL": 0.08,
    "HIGH": 2,
    "ELEVATED": 7,
    "MODERATE": 15,
    "ROUTINE": 30,
}


@router.post("", response_model=ComplaintResponse)
async def create_complaint(
    req: ComplaintCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    ai_data = analyze_complaint_ai(req.text_content)

    category = ai_data.get("category", "Roads")
    sub_category = ai_data.get("sub_category", "Potholes")
    criticality_level = ai_data.get("level", "ROUTINE")
    criticality_score = ai_data.get("score", 30)
    star_rating = calculate_stars_rating(criticality_score)

    new_complaint = Complaint(
        citizen_id=req.citizen_id,
        text_content=ai_data.get("translated_text", req.text_content),
        text_original=req.text_content,
        language_detected=ai_data.get("language", req.language_detected),
        voice_file_url=req.voice_file_url,
        photo_urls=req.photo_urls or [],
        location_lat=req.location_lat or 12.9716,
        location_lng=req.location_lng or 77.5946,
        location_address=req.location_address or "Auto-detected Location",
        ward=req.ward or "Ward 7",
        district=req.district or "Bengaluru South",
        category=category,
        sub_category=sub_category,
        criticality_level=criticality_level,
        criticality_score=criticality_score,
        star_rating=star_rating,
        status="FILED",
        is_overdue=False,
    )

    official_id, tier = route_complaint_to_official(new_complaint, db)
    new_complaint.assigned_to = official_id
    new_complaint.assigned_tier = tier
    new_complaint.assigned_at = datetime.utcnow()
    new_complaint.status = "ASSIGNED"

    days_to_add = CRITICALITY_DEADLINES.get(criticality_level, 30)
    new_complaint.deadline_at = datetime.utcnow() + timedelta(days=days_to_add)

    db.add(new_complaint)

    if official_id:
        official = db.query(Official).filter(Official.id == official_id).first()
        if official:
            official.complaints_assigned += 1

    if req.citizen_id:
        citizen = db.query(Citizen).filter(Citizen.id == req.citizen_id).first()
        if citizen:
            citizen.reward_points += 10

    db.commit()
    db.refresh(new_complaint)

    try:
        await request.app.state.notify_clients(
            "NEW_COMPLAINT", new_complaint.to_dict()
        )
    except Exception:
        pass

    return new_complaint


@router.get("", response_model=list[ComplaintResponse])
def get_complaints(
    ward: Optional[str] = None,
    criticality: Optional[str] = None,
    complaint_status: Optional[str] = None,
    category: Optional[str] = None,
    citizen_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)

    if ward:
        query = query.filter(Complaint.ward == ward)
    if criticality:
        query = query.filter(Complaint.criticality_level == criticality)
    if complaint_status:
        query = query.filter(Complaint.status == complaint_status)
    if category:
        query = query.filter(Complaint.category == category)
    if citizen_id:
        query = query.filter(Complaint.citizen_id == citizen_id)

    return query.all()


@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.put("/{id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    id: str,
    status_val: str,
    request: Request,
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    allowed = VALID_TRANSITIONS.get(complaint.status, set())
    if status_val not in allowed:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid transition from '{complaint.status}' to '{status_val}'. "
                f"Allowed: {sorted(allowed) if allowed else 'none'}"
            ),
        )

    complaint.status = status_val
    now = datetime.utcnow()

    if status_val == "VIEWED" and not complaint.first_viewed_at:
        complaint.first_viewed_at = now
    elif status_val == "IN_PROGRESS" and not complaint.first_response_at:
        complaint.first_response_at = now

    db.commit()
    db.refresh(complaint)

    try:
        await request.app.state.notify_clients(
            "STATUS_CHANGE", complaint.to_dict()
        )
    except Exception:
        pass

    return complaint


@router.post("/{id}/upvote", response_model=ComplaintResponse)
async def upvote_complaint(
    id: str,
    req: UpvoteRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    existing_upvote = db.query(Upvote).filter(
        Upvote.complaint_id == id,
        Upvote.citizen_id == req.citizen_id,
    ).first()

    if existing_upvote:
        return complaint

    upvote = Upvote(complaint_id=id, citizen_id=req.citizen_id)
    db.add(upvote)
    complaint.upvote_count += 1
    complaint.star_rating = calculate_stars_rating(
        complaint.criticality_score, complaint.upvote_count
    )

    citizen = db.query(Citizen).filter(Citizen.id == req.citizen_id).first()
    if citizen:
        citizen.reward_points += 2

    db.commit()
    db.refresh(complaint)

    try:
        await request.app.state.notify_clients(
            "UPVOTE_CHANGE", complaint.to_dict()
        )
    except Exception:
        pass

    return complaint
