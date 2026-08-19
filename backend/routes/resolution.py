"""
Resolution & Verification Router Module
=======================================
Handles the official resolution submission and the citizen-triggered verification loop.
- `POST /{id}/resolve`: Officials mark an issue as fixed (Moves to `PENDING_VERIFICATION`).
- `POST /{id}/verify`: Citizens vote YES or NO.
    - YES sets status to `RESOLVED`, awards official score, and boosts citizen reputation points.
    - NO sets status to `ASSIGNED` (False Closure), penalizes the official, and re-opens the ticket.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from database import Session
from datetime import datetime
from database import get_db
from routes.auth import get_current_user
from models.models import Complaint, Official, VerificationLog, Citizen
from schemas.schemas import ResolutionSubmit, VerificationVote, ComplaintResponse

router = APIRouter(prefix="/api/complaints", tags=["resolution"])

@router.post("/{id}/resolve", response_model=ComplaintResponse)
async def resolve_complaint(id: str, req: ResolutionSubmit, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if getattr(current_user, 'role', 'CITIZEN') == 'CITIZEN':
        raise HTTPException(status_code=403, detail="Citizens cannot resolve complaints")

    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if complaint.assigned_to and complaint.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to resolve this complaint")
        
    complaint.status = "PENDING_VERIFICATION"
    complaint.resolution_status = "PENDING"
    complaint.resolution_note = req.resolution_note
    complaint.resolution_photos = req.resolution_photos
    complaint.resolution_action = req.resolution_action
    complaint.fund_used = req.fund_used
    complaint.amount_spent = req.amount_spent
    complaint.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(complaint)
    
    # Broadcast resolution submission
    try:
        await request.app.state.notify_clients("STATUS_CHANGE", complaint.to_safe_dict())
    except Exception as e:
        print(f"WebSocket notification error: {e}")
        
    return complaint

@router.post("/{id}/verify", response_model=ComplaintResponse)
async def verify_complaint_resolution(id: str, req: VerificationVote, request: Request, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    authoritative_citizen_id = current_user.id if getattr(current_user, 'role', 'CITIZEN') == 'CITIZEN' else req.citizen_id
        
    # Check if already voted by this citizen
    existing_vote = db.query(VerificationLog).filter(
        VerificationLog.complaint_id == id,
        VerificationLog.citizen_id == authoritative_citizen_id
    ).first()
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="Citizen has already verified this resolution")
        
    log = VerificationLog(
        complaint_id=id,
        citizen_id=authoritative_citizen_id,
        vote=req.vote
    )
    db.add(log)
    
    # Citizen Reputation Engine: Award points for participating in governance
    citizen = db.query(Citizen).filter(Citizen.id == authoritative_citizen_id).first()
    if citizen:
        citizen.reward_points += 5
    
    if req.vote:
        complaint.verification_yes += 1
    else:
        complaint.verification_no += 1
        
    # Check resolution logic:
    # Let's say if YES >= 1, we set resolved instantly for simple demo verification,
    # OR if NO >= 1, we false closure instantly.
    # To make it interactive:
    total_votes = complaint.verification_yes + complaint.verification_no
    
    if req.vote and complaint.verification_yes >= 1:
        complaint.status = "RESOLVED"
        complaint.resolution_status = "VERIFIED"
        complaint.verified_at = datetime.utcnow()
        
        # Reward official
        if complaint.assigned_to:
            official = db.query(Official).filter(Official.id == complaint.assigned_to).first()
            if official:
                official.complaints_resolved += 1
                official.accountability_score = min(100, official.accountability_score + 10)
    elif not req.vote and complaint.verification_no >= 1:
        # FALSE CLOSURE
        complaint.status = "ASSIGNED"  # Reopened
        complaint.resolution_status = "FALSE_CLOSURE"
        complaint.verification_yes = 0
        complaint.verification_no = 0
        
        # Penalize official
        if complaint.assigned_to:
            official = db.query(Official).filter(Official.id == complaint.assigned_to).first()
            if official:
                official.accountability_score = max(0, official.accountability_score - 15)
                
    db.commit()
    db.refresh(complaint)
    
    # Broadcast update
    try:
        await request.app.state.notify_clients("STATUS_CHANGE", complaint.to_safe_dict())
    except Exception as e:
        print(f"WebSocket notification error: {e}")
        
    return complaint
