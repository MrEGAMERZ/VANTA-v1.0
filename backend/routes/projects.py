"""
Development Projects Router Module
==================================
Handles the AI-driven recommendation and authorization of infrastructure projects.
- Clusters raw citizen complaints into actionable `DevelopmentProject` proposals.
- Allows Members of Parliament (MPs) to authorize projects for the Detailed Project Report (DPR) phase.
"""

from fastapi import APIRouter, Depends, HTTPException
from database import get_db, Session
from models.models import DevelopmentProject
from schemas.schemas import DevelopmentProjectResponse
from typing import List

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[DevelopmentProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(DevelopmentProject).order_by(DevelopmentProject.rank.asc()).all()
    return projects

from services.civic_intelligence_engine import detect_systemic_clusters
from services.dpr_engine import generate_dpr_from_cluster

@router.post("/generate", response_model=List[DevelopmentProjectResponse])
def generate_projects(ward: str = None, db: Session = Depends(get_db)):
    # 1. Run the Incident Clustering Engine (Civic Intelligence)
    clusters = detect_systemic_clusters(db, ward=ward)
    
    # 2. Run the DPR Generation Engine for each cluster
    new_projects = []
    for cluster in clusters:
        # Prevent generating duplicate projects for the same cluster title/ward
        existing = db.query(DevelopmentProject).filter(
            DevelopmentProject.title == cluster["title"],
            DevelopmentProject.ward == (ward or "Citywide")
        ).first()
        
        if not existing:
            project = generate_dpr_from_cluster(db, cluster, ward or "Citywide")
            if project:
                db.add(project)
                new_projects.append(project)
    
    if new_projects:
        db.commit()
    
    # Return the fully updated list of projects
    projects = db.query(DevelopmentProject).order_by(DevelopmentProject.rank.asc()).all()
    return projects

@router.post("/{id}/approve", response_model=DevelopmentProjectResponse)
def approve_project(id: str, db: Session = Depends(get_db)):
    project = db.query(DevelopmentProject).filter(DevelopmentProject.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.approved = True
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
