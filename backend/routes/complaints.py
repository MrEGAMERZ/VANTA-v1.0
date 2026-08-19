"""
Complaints Router Module
========================
Handles the core civic grievance reporting pipeline.
- `POST /`: Submits a complaint, triggers AI categorization, and initiates the 5-Citizen Verification loop.
- `POST /{id}/upvote`: Allows citizens to upvote/verify issues. Upon reaching 5 upvotes, the grievance is auto-routed to the correct official's queue.
"""

import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from database import Session
from datetime import datetime, timedelta
from database import get_db
from routes.auth import get_current_user
from models.models import Complaint, Citizen, Official, Upvote
from schemas.schemas import ComplaintCreate, ComplaintResponse, UpvoteRequest
from services.ai_engine import analyze_complaint_ai, calculate_stars_rating, detect_duplicate
from services.routing import route_complaint_to_official

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

@router.post("", response_model=ComplaintResponse)
async def create_complaint(req: ComplaintCreate, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. Run AI analysis (translation, category, sub_category, criticality score & level, vision)
    ai_data = analyze_complaint_ai(req.text_content, req.photo_urls)
    
    # Extract details
    category = ai_data.get("category", "Other")
    sub_category = ai_data.get("sub_category", "General")
    criticality_level = ai_data.get("criticality_level", "ROUTINE")
    criticality_score = ai_data.get("criticality_score", 30)
    risk_flags = ai_data.get("risk_flags", [])
    vision_verified = ai_data.get("vision_verified", False)
    
    # If photos were provided but AI says they don't match the text, flag as potentially fake
    is_fake_flagged = False
    if req.photo_urls and not vision_verified:
        is_fake_flagged = True
        
    # 1.5 Duplicate detection
    recent_complaints = db.query(Complaint).filter(
        Complaint.ward == (req.ward or "Ward 7"),
        Complaint.filed_at >= datetime.utcnow() - timedelta(days=7)
    ).all()
    recent_dicts = [{"id": c.id, "text": c.text_content} for c in recent_complaints]
    duplicate_of_id = detect_duplicate(req.text_content, recent_dicts)
    
    # 2. Calculate star priority rating
    star_rating = calculate_stars_rating(criticality_score)
    
    # 3. Create Complaint Model
    # Enforce authoritative citizen_id from the authenticated user if it's a CITIZEN
    authoritative_citizen_id = current_user.id if getattr(current_user, 'role', 'CITIZEN') == 'CITIZEN' else req.citizen_id

    new_complaint = Complaint(
        citizen_id=authoritative_citizen_id,
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
        is_overdue=False,
        ai_photo_analysis={"vision_verified": vision_verified, "risk_flags": risk_flags},
        is_fake_flagged=is_fake_flagged,
        is_duplicate_of=duplicate_of_id
    )
    
    official_id = None
    # 4. 5-Citizen Verification Logic
    # Complaint stays in PENDING_COMMUNITY until 5 upvotes are reached,
    # unless it is an extreme emergency (CATASTROPHIC).
    if criticality_level == "CATASTROPHIC":
        official_id, tier = route_complaint_to_official(new_complaint, db)
        new_complaint.assigned_to = official_id
        new_complaint.assigned_tier = tier
        new_complaint.assigned_at = datetime.utcnow()
        new_complaint.status = "ASSIGNED"
        new_complaint.deadline_at = datetime.utcnow() + timedelta(days=0.04) # 1 hour
    else:
        new_complaint.status = "PENDING_COMMUNITY"

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
        await request.app.state.notify_clients("NEW_COMPLAINT", new_complaint.to_safe_dict())
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
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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
        
    results = query.all()
    
    # Redact PII for other citizens
    is_official = getattr(current_user, 'role', 'CITIZEN') != 'CITIZEN'
    for c in results:
        if not is_official and c.citizen_id != current_user.id:
            c.citizen_id = None
            c.voice_file_url = None
            c.location_address = "Redacted for privacy"
            # Round coordinates to ~1.1km precision for public viewing
            if c.location_lat: c.location_lat = round(c.location_lat, 2)
            if c.location_lng: c.location_lng = round(c.location_lng, 2)
            
    return results

@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    is_official = getattr(current_user, 'role', 'CITIZEN') != 'CITIZEN'
    if not is_official and complaint.citizen_id != current_user.id:
        complaint.citizen_id = None
        complaint.voice_file_url = None
        complaint.location_address = "Redacted for privacy"
        if complaint.location_lat: complaint.location_lat = round(complaint.location_lat, 2)
        if complaint.location_lng: complaint.location_lng = round(complaint.location_lng, 2)
        
    return complaint

@router.put("/{id}/status", response_model=ComplaintResponse)
async def update_complaint_status(id: str, status_val: str, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Only Officials can update status manually, or specific transitions
    if getattr(current_user, 'role', 'CITIZEN') == 'CITIZEN':
        raise HTTPException(status_code=403, detail="Citizens cannot manually change status")

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
        await request.app.state.notify_clients("STATUS_CHANGE", complaint.to_safe_dict())
    except Exception as e:
        print(f"WebSocket notification error: {e}")
        
    return complaint

@router.post("/{id}/upvote", response_model=ComplaintResponse)
async def upvote_complaint(id: str, req: UpvoteRequest, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Enforce citizen id
    authoritative_citizen_id = current_user.id if getattr(current_user, 'role', 'CITIZEN') == 'CITIZEN' else req.citizen_id

    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Check if already upvoted
    existing_upvote = db.query(Upvote).filter(
        Upvote.complaint_id == id,
        Upvote.citizen_id == authoritative_citizen_id
    ).first()
    
    if not existing_upvote:
        upvote = Upvote(complaint_id=id, citizen_id=authoritative_citizen_id)
        db.add(upvote)
        complaint.upvote_count += 1
        # Recalculate stars with new upvote counts
        complaint.star_rating = calculate_stars_rating(complaint.criticality_score, complaint.upvote_count)
        
        # 5-Citizen Verification threshold trigger
        if complaint.status == "PENDING_COMMUNITY" and complaint.upvote_count >= 5:
            official_id, tier = route_complaint_to_official(complaint, db)
            complaint.assigned_to = official_id
            complaint.assigned_tier = tier
            complaint.assigned_at = datetime.utcnow()
            complaint.status = "ASSIGNED"
            
            days_to_add = 30
            if complaint.criticality_level == "CRITICAL": days_to_add = 0.08
            elif complaint.criticality_level == "HIGH": days_to_add = 2
            elif complaint.criticality_level == "ELEVATED": days_to_add = 7
            elif complaint.criticality_level == "MODERATE": days_to_add = 15
            
            complaint.deadline_at = datetime.utcnow() + timedelta(days=days_to_add)
            
            if official_id:
                official = db.query(Official).filter(Official.id == official_id).first()
                if official:
                    official.complaints_assigned += 1

        db.commit()
        db.refresh(complaint)
        
        # Broadcast upvote change
        try:
            await request.app.state.notify_clients("STATUS_CHANGE", complaint.to_safe_dict())
        except Exception as e:
            print(f"WebSocket notification error: {e}")
        
    return complaint
