import logging
from typing import Dict, Any, List
from database import Session
from models.models import DevelopmentProject, Complaint
from services.ai_provider import get_ai_provider

logger = logging.getLogger("vanta-dpr-engine")
ai_provider = get_ai_provider()

def generate_dpr_from_cluster(db: Session, cluster: Dict[str, Any], ward: str) -> DevelopmentProject:
    """
    Takes a systemic cluster of complaints and generates a Development Project Report (DPR).
    """
    complaint_ids = cluster.get("complaint_ids", [])
    if not complaint_ids:
        return None
        
    complaints = db.query(Complaint).filter(Complaint.id.in_(complaint_ids)).all()
    
    # Aggregate data
    total_score = sum(c.criticality_score for c in complaints)
    star_avg = sum(c.star_rating for c in complaints) / len(complaints) if complaints else 0
    max_criticality = max((c.criticality_level for c in complaints), key=lambda x: {"ROUTINE":0, "MODERATE":1, "ELEVATED":2, "HIGH":3, "CRITICAL":4, "CATASTROPHIC":5}.get(x, 0))
    
    complaints_data = [{"id": c.id, "text": c.text_content, "score": c.criticality_score} for c in complaints]
    
    prompt = f"""
    You are VANTA's DPR (Development Project Report) Engine.
    Generate a formal infrastructure intervention proposal based on the following cluster of citizen complaints.
    
    CLUSTER DETAILS:
    Category: {cluster.get('category')}
    Title: {cluster.get('title')}
    Ward: {ward}
    Reasoning: {cluster.get('reasoning')}
    
    COMPLAINT EVIDENCE:
    {complaints_data}
    
    Provide the analysis in strict JSON format containing:
    - "population_affected": Integer estimate based on urban density (e.g., 500, 2000).
    - "budget_estimate": Float value in Indian Rupees (e.g., 1500000.0 for 15 Lakhs) based on standard public works costs.
    - "scheme_eligible": Array of string government schemes (e.g., ["AMRUT", "Smart Cities Mission", "SBM", "Local Ward Fund"]).
    - "ai_recommendation": A detailed paragraph recommending the engineering intervention required (e.g., "Complete relaying of 500m arterial road").
    
    Output only valid JSON.
    """
    
    ai_recommendation = "Manual intervention required. AI analysis pending."
    population_affected = 500
    budget_estimate = 500000.0
    scheme_eligible = ["Local MLA Fund"]
    
    try:
        data = ai_provider.generate_json(prompt)
        ai_recommendation = data.get("ai_recommendation", ai_recommendation)
        population_affected = data.get("population_affected", population_affected)
        budget_estimate = data.get("budget_estimate", budget_estimate)
        scheme_eligible = data.get("scheme_eligible", scheme_eligible)
    except Exception as e:
        logger.error(f"DPR Generation failed: {e}")
        
    project = DevelopmentProject(
        title=cluster.get("title", "Systemic Infrastructure Upgrade"),
        category=cluster.get("category", "General"),
        ward=ward,
        complaint_count=len(complaints),
        population_affected=population_affected,
        star_avg=star_avg,
        criticality_max=max_criticality,
        budget_estimate=budget_estimate,
        scheme_eligible=scheme_eligible,
        ai_recommendation=ai_recommendation,
        data_evidence={"complaint_ids": complaint_ids, "reasoning": cluster.get("reasoning")},
        rank=1 # Default, can be ranked later
    )
    
    return project
