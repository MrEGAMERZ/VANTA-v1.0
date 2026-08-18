import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from database import Session
from models.models import Complaint
from services.ai_provider import get_ai_provider

logger = logging.getLogger("vanta-civic-intelligence")
ai_provider = get_ai_provider()

def detect_systemic_clusters(db: Session, ward: str = None) -> List[Dict[str, Any]]:
    """
    Sweeps recent complaints (last 30 days) to find geographic/semantic clusters
    that indicate a systemic issue rather than isolated incidents.
    """
    # Fetch complaints from the last 30 days
    query = db.query(Complaint).filter(
        Complaint.filed_at >= datetime.utcnow() - timedelta(days=30),
        Complaint.status.in_(["FILED", "ASSIGNED", "IN_PROGRESS", "VIEWED", "PENDING_COMMUNITY", "ESCALATED"])
    )
    if ward:
        query = query.filter(Complaint.ward == ward)
        
    recent_complaints = query.all()
    if not recent_complaints or len(recent_complaints) < 3:
        return [] # Not enough data for meaningful clustering
        
    # Group by category first to simplify AI workload
    categorized = {}
    for c in recent_complaints:
        cat = c.category or "Other"
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append({
            "id": c.id,
            "sub_category": c.sub_category,
            "text": c.text_content,
            "lat": c.location_lat,
            "lng": c.location_lng,
            "score": c.criticality_score
        })
        
    clusters = []
    
    # Send categories with multiple complaints to AI for semantic grouping
    for cat, items in categorized.items():
        if len(items) < 3:
            continue
            
        prompt = f"""
        You are VANTA's Civic Intelligence Engine. 
        Analyze the following recent complaints in category '{cat}' to find SYSTEMIC clusters.
        A systemic cluster is a group of 3 or more complaints that likely point to the same underlying infrastructure failure (e.g., multiple people reporting water leaks on the same street, or persistent pothole reports).
        
        COMPLAINTS DATA:
        {items}
        
        Provide the analysis in strict JSON format containing a list of clusters:
        - "clusters": Array of objects, each containing:
          - "cluster_title": Short descriptive name.
          - "complaint_ids": List of string IDs belonging to this cluster.
          - "systemic_risk": Boolean (true if this represents a systemic infrastructure failure).
          - "reasoning": Brief explanation of why these are clustered.
          
        Only output clusters with 3 or more complaints. If none, return empty array for "clusters".
        Output only valid JSON.
        """
        try:
            data = ai_provider.generate_json(prompt)
            if data and "clusters" in data:
                for cluster in data["clusters"]:
                    if cluster.get("systemic_risk") and len(cluster.get("complaint_ids", [])) >= 3:
                        clusters.append({
                            "category": cat,
                            "title": cluster["cluster_title"],
                            "complaint_ids": cluster["complaint_ids"],
                            "reasoning": cluster["reasoning"]
                        })
        except Exception as e:
            logger.error(f"Cluster detection failed for category {cat}: {e}")
            
    return clusters
