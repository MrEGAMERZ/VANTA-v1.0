from fastapi import APIRouter, Depends
from database import Session
from database import get_db
from services.escalation import check_and_escalate_overdue_complaints
from models.models import EscalationLog

router = APIRouter(prefix="/api/admin", tags=["escalation"])

@router.post("/run-escalation")
def run_escalation_sweep(db: Session = Depends(get_db)):
    count = check_and_escalate_overdue_complaints(db)
    return {"message": "Escalation sweep finished successfully.", "escalations_triggered": count}

@router.get("/escalations/{complaint_id}")
def get_complaint_escalation_logs(complaint_id: str, db: Session = Depends(get_db)):
    logs = db.query(EscalationLog).filter(EscalationLog.complaint_id == complaint_id).all()
    return logs
