from fastapi import APIRouter, Depends
from database import Session
from database import get_db
from models.models import Complaint

router = APIRouter(prefix="/api/map", tags=["map"])

@router.get("/pins")
def get_map_pins(db: Session = Depends(get_db)):
    # Fetch all complaints that are not archived
    complaints = db.query(Complaint).filter(Complaint.status != "ARCHIVED").all()
    
    pins = []
    for c in complaints:
        pins.append({
            "id": c.id,
            "lat": c.location_lat,
            "lng": c.location_lng,
            "criticality": c.criticality_level,
            "stars": c.star_rating,
            "title": c.text_original or c.text_content,
            "ward": c.ward
        })
    return pins

@router.get("/heatmap")
def get_heatmap_data(db: Session = Depends(get_db)):
    # Returns array of [lat, lng, intensity]
    # intensity is mapped from criticality_score
    complaints = db.query(Complaint).filter(
        Complaint.status.notin_(["RESOLVED", "ARCHIVED"])
    ).all()
    
    heatmap = []
    for c in complaints:
        if c.location_lat and c.location_lng:
            # Map score to intensity weight between 0.1 and 1.0
            weight = max(0.1, min(1.0, c.criticality_score / 100.0))
            heatmap.append([c.location_lat, c.location_lng, weight])
    return heatmap
