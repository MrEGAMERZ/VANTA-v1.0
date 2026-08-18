from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from database import Session, get_db
from models.models import DevelopmentProject, Contractor, TenderInvitation, TenderBid, TransparencyLedger
from pydantic import BaseModel
import random
from datetime import datetime

router = APIRouter(prefix="/api/tenders", tags=["tenders"])

class InviteRequest(BaseModel):
    project_id: str
    official_id: str
    contractor_ids: List[str]

class BidSubmitRequest(BaseModel):
    invitation_id: str
    bid_amount: float
    estimated_days: int
    site_visit_completed: bool

class AwardRequest(BaseModel):
    bid_id: str

@router.get("/contractors")
def get_contractors(specialty: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Contractor).filter(Contractor.is_government_approved == True)
    if specialty:
        # Simple text matching for hackathon purposes
        query = query.filter(Contractor.specialty == specialty)
    return query.all()

@router.post("/invite")
def invite_contractors(req: InviteRequest, db: Session = Depends(get_db)):
    project = db.query(DevelopmentProject).filter(DevelopmentProject.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    invitations = []
    for c_id in req.contractor_ids:
        inv = TenderInvitation(
            project_id=req.project_id,
            invited_by_official_id=req.official_id,
            contractor_id=c_id
        )
        db.add(inv)
        invitations.append(inv)
        
    db.commit()
    return {"message": f"Successfully invited {len(invitations)} contractors."}

@router.post("/bids")
def submit_bid(req: BidSubmitRequest, db: Session = Depends(get_db)):
    invitation = db.query(TenderInvitation).filter(TenderInvitation.id == req.invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    project = db.query(DevelopmentProject).filter(DevelopmentProject.id == invitation.project_id).first()
    
    # Calculate simple AI Score logic for demo
    # Better if: bid_amount < budget, estimated_days is low, site_visit is true
    base_score = 70
    if project and req.bid_amount <= project.budget_estimate:
        base_score += 15
    elif project and req.bid_amount > project.budget_estimate:
        base_score -= 15
        
    if req.site_visit_completed:
        base_score += 10
        
    if req.estimated_days < 30:
        base_score += 5
    elif req.estimated_days > 60:
        base_score -= 10
        
    ai_score = min(99.0, max(10.0, float(base_score)))
    reasoning = "AI Evaluation: "
    if req.site_visit_completed: reasoning += "Site visit confirmed (+). "
    else: reasoning += "No site visit (-). "
    if project and req.bid_amount <= project.budget_estimate: reasoning += "Cost under budget (+)."
    else: reasoning += "Cost exceeds estimated budget (-)."
    
    bid = TenderBid(
        invitation_id=req.invitation_id,
        contractor_id=invitation.contractor_id,
        project_id=invitation.project_id,
        bid_amount=req.bid_amount,
        estimated_days=req.estimated_days,
        site_visit_completed=req.site_visit_completed,
        ai_score=ai_score,
        ai_reasoning=reasoning
    )
    
    invitation.status = "BID_SUBMITTED"
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid

@router.get("/project/{project_id}/bids")
def get_project_bids(project_id: str, db: Session = Depends(get_db)):
    # Return all bids for this project, sorted by AI Score
    bids = db.query(TenderBid).filter(TenderBid.project_id == project_id).order_by(TenderBid.ai_score.desc()).all()
    
    result = []
    for bid in bids:
        contractor = db.query(Contractor).filter(Contractor.id == bid.contractor_id).first()
        result.append({
            "id": bid.id,
            "bid_amount": bid.bid_amount,
            "estimated_days": bid.estimated_days,
            "site_visit_completed": bid.site_visit_completed,
            "ai_score": bid.ai_score,
            "ai_reasoning": bid.ai_reasoning,
            "is_awarded": bid.is_awarded,
            "contractor": contractor.to_dict() if contractor else None
        })
    return result

@router.post("/award")
def award_contract(req: AwardRequest, db: Session = Depends(get_db)):
    bid = db.query(TenderBid).filter(TenderBid.id == req.bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    project = db.query(DevelopmentProject).filter(DevelopmentProject.id == bid.project_id).first()
    contractor = db.query(Contractor).filter(Contractor.id == bid.contractor_id).first()
    
    if not project or not contractor:
        raise HTTPException(status_code=404, detail="Project or Contractor not found")

    # Mark bid as awarded
    bid.is_awarded = True
    
    # Optional: mark other bids as rejected
    other_bids = db.query(TenderBid).filter(TenderBid.project_id == bid.project_id, TenderBid.id != bid.id).all()
    for ob in other_bids:
        ob.is_awarded = False
        
    # Generate Transparency Ledger automatically
    ledger = TransparencyLedger(
        project_id=project.id,
        contractor_name=contractor.company_name,
        bid_amount=bid.bid_amount,
        funds_released=bid.bid_amount * 0.2, # Release 20% advance
        milestone_status="CONTRACT_AWARDED",
        phase_wise_payments=[
            {"phase": "Advance Payment (20%)", "amount": bid.bid_amount * 0.2, "date": datetime.utcnow().isoformat(), "status": "PAID"},
            {"phase": "Mid-Point Inspection (40%)", "amount": bid.bid_amount * 0.4, "date": None, "status": "PENDING"},
            {"phase": "Final Completion (40%)", "amount": bid.bid_amount * 0.4, "date": None, "status": "PENDING"}
        ]
    )
    
    db.add(ledger)
    db.commit()
    
    return {"message": "Contract Awarded! Transparency Ledger generated.", "ledger_id": ledger.id}
