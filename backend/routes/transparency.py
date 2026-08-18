from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import Session, get_db
from models.models import TransparencyLedger, DevelopmentProject

router = APIRouter(prefix="/api/transparency", tags=["transparency"])

@router.get("/ledgers", response_model=list)
def get_all_ledgers(db: Session = Depends(get_db)):
    """
    Public Transparency Engine endpoint.
    Retrieves all public ledgers for approved development projects, 
    allowing citizens to track contractor bids and phase-wise payments.
    """
    ledgers = db.query(TransparencyLedger).order_by(TransparencyLedger.last_updated.desc()).all()
    
    # Return with project details for transparency
    result = []
    for ledger in ledgers:
        project = db.query(DevelopmentProject).filter(DevelopmentProject.id == ledger.project_id).first()
        ledger_data = {
            "id": ledger.id,
            "project_title": project.title if project else "Unknown Project",
            "ward": project.ward if project else "Unknown",
            "contractor_name": ledger.contractor_name,
            "bid_amount": ledger.bid_amount,
            "funds_released": ledger.funds_released,
            "milestone_status": ledger.milestone_status,
            "phase_wise_payments": ledger.phase_wise_payments,
            "last_updated": ledger.last_updated
        }
        result.append(ledger_data)
        
    return result

@router.get("/project/{project_id}")
def get_project_ledger(project_id: str, db: Session = Depends(get_db)):
    """
    Public Transparency Engine endpoint for a specific project.
    """
    ledger = db.query(TransparencyLedger).filter(TransparencyLedger.project_id == project_id).first()
    if not ledger:
        raise HTTPException(status_code=404, detail="Transparency ledger not found for this project.")
    return ledger
