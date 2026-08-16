from fastapi import APIRouter, Depends, HTTPException
from database import Session
from database import get_db
from models.models import Official
from schemas.schemas import OfficialResponse

router = APIRouter(prefix="/api/officials", tags=["officials"])

@router.get("", response_model=list[OfficialResponse])
def get_officials(db: Session = Depends(get_db)):
    return db.query(Official).all()

@router.get("/scoreboard", response_model=list[OfficialResponse])
def get_scoreboard(db: Session = Depends(get_db)):
    # We rank officials (especially MLAs) by their accountability score descending
    return db.query(Official).filter(Official.role == "MLA").order_by(Official.accountability_score.desc()).all()

@router.get("/{id}", response_model=OfficialResponse)
def get_official(id: str, db: Session = Depends(get_db)):
    official = db.query(Official).filter(Official.id == id).first()
    if not official:
        raise HTTPException(status_code=404, detail="Official not found")
    return official
