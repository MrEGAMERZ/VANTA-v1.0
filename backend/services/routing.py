from database import Session
from models.models import Official, Complaint

TIER_KEYWORDS = {
    4: {"highway", "dam", "bridge", "constituency", "state", "disaster", "catastrophic"},
    3: {"district", "multi-ward", "constituency", "mp", "parliament"},
    2: {"collector", "district", "hospital", "zone"},
}

TIER_CRITICALITY_THRESHOLD = {
    4: "CATASTROPHIC",
    3: "CRITICAL",
    2: "HIGH",
}


def route_complaint_to_official(complaint: Complaint, db: Session) -> tuple[str | None, int]:
    text_lower = (complaint.text_content or "").lower()

    for tier in (4, 3, 2):
        if complaint.criticality_level == TIER_CRITICALITY_THRESHOLD.get(tier) or \
           TIER_KEYWORDS[tier] & set(text_lower.split()):
            official = _select_best_official(db, tier)
            if official:
                return official.id, tier

    return _assign_ward_mla(db, complaint)


def _assign_ward_mla(db: Session, complaint: Complaint) -> tuple[str | None, int]:
    ward_str = complaint.ward or ""
    if ward_str:
        mla = db.query(Official).filter(
            Official.role == "MLA",
            Official.jurisdiction.like(f"%{ward_str}%"),
        ).first()
        if mla:
            return mla.id, 1

    mla = _select_best_official(db, 1, role="MLA")
    if mla:
        return mla.id, 1

    fallback = db.query(Official).first()
    return (fallback.id if fallback else None), 1


def _select_best_official(
    db: Session, tier: int, role: str | None = None
) -> Official | None:
    if role is None:
        role_map = {1: "MLA", 2: "COLLECTOR", 3: "MP", 4: "MINISTRY"}
        role = role_map.get(tier)

    if not role:
        return None

    officials = db.query(Official).filter(Official.role == role).all()
    if not officials:
        return None

    return min(
        officials,
        key=lambda o: (
            o.complaints_assigned - o.complaints_resolved,
            -o.accountability_score,
        ),
    )
