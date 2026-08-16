import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from database import Session
from datetime import datetime, timedelta
from database import get_db
from models.models import Complaint, Citizen, Official, Upvote
from schemas.schemas import ComplaintCreate, ComplaintResponse, UpvoteRequest
from services.ai_engine import analyze_complaint_ai, calculate_stars_rating
from services.routing import route_complaint_to_official

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

@router.post("", response_model=ComplaintResponse)
async def create_complaint(req: ComplaintCreate, request: Request, db: Session = Depends(get_db)):
    # 1. Run AI analysis (translation, category, sub_category, criticality score & level)
    ai_data = analyze_complaint_ai(req.text_content)
    
    # Extract details
    category = ai_data.get("category", "Roads")
    sub_category = ai_data.get("sub_category", "Potholes")
    criticality_level = ai_data.get("level", "ROUTINE")
    criticality_score = ai_data.get("score", 30)
    
    # 2. Calculate star priority rating
    star_rating = calculate_stars_rating(criticality_score)
    
    # 3. Create Complaint Model
    new_complaint = Complaint(
        citizen_id=req.citizen_id,
        text_content=ai_data.get("translated_text", req.text_content),
        text_original=req.text_content,
        language_detected=ai_data.get("language", req.language_detected),
        voice_file_url=req.voice_file_url,
        photo_urls=req.photo_urls,
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
        is_overdue=False
    )
    
    # 4. Route to official
    official_id, tier = route_complaint_to_official(new_complaint, db)
    new_complaint.assigned_to = official_id
    new_complaint.assigned_tier = tier
    new_complaint.assigned_at = datetime.utcnow()
    new_complaint.status = "ASSIGNED"
    
    # Set deadline based on criticality
    days_to_add = 30
    if criticality_level == "CATASTROPHIC":
        days_to_add = 0.04  # 1 hour response window
    elif criticality_level == "CRITICAL":
        days_to_add = 0.08  # 2 hours
    elif criticality_level == "HIGH":
        days_to_add = 2
    elif criticality_level == "ELEVATED":
        days_to_add = 7
    elif criticality_level == "MODERATE":
        days_to_add = 15
    elif criticality_level == "ROUTINE":
        days_to_add = 30
        
    new_complaint.deadline_at = datetime.utcnow() + timedelta(days=days_to_add)
    
    db.add(new_complaint)
    
    # Increment assigned count for official
    if official_id:
        official = db.query(Official).filter(Official.id == official_id).first()
        if official:
            official.complaints_assigned += 1
            
    db.commit()
    db.refresh(new_complaint)
    
    # Real-time WebSocket notify
    try:
        await request.app.state.notify_clients("NEW_COMPLAINT", new_complaint.to_dict())
    except Exception as e:
        print(f"WebSocket notification error: {e}")
    
    return new_complaint

@router.get("", response_model=list[ComplaintResponse])
def get_complaints(
    ward: Optional[str] = None,
    criticality: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    citizen_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    
    if ward:
        query = query.filter(Complaint.ward == ward)
    if criticality:
        query = query.filter(Complaint.criticality_level == criticality)
    if status:
        query = query.filter(Complaint.status == status)
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
async def update_complaint_status(id: str, status_val: str, request: Request, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint.status = status_val
    if status_val == "VIEWED" and not complaint.first_viewed_at:
        complaint.first_viewed_at = datetime.utcnow()
    elif status_val == "IN_PROGRESS" and not complaint.first_response_at:
        complaint.first_response_at = datetime.utcnow()
        
    db.commit()
    db.refresh(complaint)
    
    # Broadcast update
    try:
        await request.app.state.notify_clients("STATUS_CHANGE", complaint.to_dict())
    except Exception as e:
        print(f"WebSocket notification error: {e}")
        
    return complaint

@router.post("/{id}/upvote", response_model=ComplaintResponse)
async def upvote_complaint(id: str, req: UpvoteRequest, request: Request, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Check if already upvoted
    existing_upvote = db.query(Upvote).filter(
        Upvote.complaint_id == id,
        Upvote.citizen_id == req.citizen_id
    ).first()
    
    if not existing_upvote:
        upvote = Upvote(complaint_id=id, citizen_id=req.citizen_id)
        db.add(upvote)
        complaint.upvote_count += 1
        # Recalculate stars with new upvote counts
        complaint.star_rating = calculate_stars_rating(complaint.criticality_score, complaint.upvote_count)
        db.commit()
        db.refresh(complaint)
        
        # Broadcast upvote change
        try:
            await request.app.state.notify_clients("STATUS_CHANGE", complaint.to_dict())
        except Exception as e:
            print(f"WebSocket notification error: {e}")
        
    return complaint
