from database import Session
from datetime import datetime, timedelta
from models.models import Complaint, Official, EscalationLog

VALID_TRANSITIONS = {
    "FILED": {"ASSIGNED"},
    "ASSIGNED": {"VIEWED", "IN_PROGRESS", "ESCALATED"},
    "VIEWED": {"IN_PROGRESS", "ESCALATED"},
    "IN_PROGRESS": {"PENDING_VERIFICATION", "ESCALATED"},
    "ESCALATED": {"IN_PROGRESS", "PENDING_VERIFICATION"},
    "PENDING_VERIFICATION": {"RESOLVED", "ASSIGNED"},
    "RESOLVED": {"ARCHIVED"},
    "ARCHIVED": set(),
}


def check_and_escalate_overdue_complaints(db: Session) -> int:
    now = datetime.utcnow()

    overdue_complaints = db.query(Complaint).filter(
        Complaint.status.notin_(["RESOLVED", "ARCHIVED"]),
    ).all()

    overdue = [
        c for c in overdue_complaints
        if c.deadline_at is not None and c.deadline_at < now
    ]

    escalations_performed = 0

    for c in overdue:
        if not c.is_overdue:
            c.is_overdue = True
            c.star_rating = min(5, c.star_rating + 1)

        current_tier = c.assigned_tier
        if current_tier >= 4:
            continue

        next_tier = current_tier + 1
        next_official = _find_official_for_tier(db, next_tier)

        if not next_official:
            continue

        _perform_escalation(db, c, next_official, current_tier, next_tier, now)
        escalations_performed += 1

    db.commit()
    return escalations_performed


def _find_official_for_tier(db: Session, tier: int) -> Official | None:
    role_map = {
        2: "COLLECTOR",
        3: "MP",
        4: "MINISTRY",
    }
    role = role_map.get(tier)
    if not role:
        return None
    return db.query(Official).filter(Official.role == role).first()


def _perform_escalation(
    db: Session,
    complaint: Complaint,
    next_official: Official,
    from_tier: int,
    to_tier: int,
    now: datetime,
):
    log = EscalationLog(
        complaint_id=complaint.id,
        from_tier=from_tier,
        to_tier=to_tier,
        from_official_id=complaint.assigned_to,
        to_official_id=next_official.id,
        reason=(
            f"Deadline exceeded by {(now - complaint.deadline_at).days} day(s). "
            f"Auto-escalated from tier {from_tier} to tier {to_tier}."
        ),
    )
    db.add(log)

    if complaint.assigned_to:
        prev_official = db.query(Official).filter(
            Official.id == complaint.assigned_to
        ).first()
        if prev_official:
            prev_official.accountability_score = max(
                0, prev_official.accountability_score - 10
            )

    complaint.assigned_to = next_official.id
    complaint.assigned_tier = to_tier
    complaint.status = "ESCALATED"
    complaint.escalation_count += 1

    original_window = _compute_original_window(complaint)
    new_window = max(timedelta(hours=1), original_window / 2)
    complaint.deadline_at = now + new_window
    complaint.assigned_at = now


def _compute_original_window(complaint: Complaint) -> timedelta:
    if complaint.assigned_at and complaint.deadline_at:
        original = complaint.deadline_at - complaint.assigned_at
        if original.total_seconds() > 0:
            return original
    tier_defaults = {
        1: timedelta(days=30),
        2: timedelta(days=14),
        3: timedelta(days=7),
        4: timedelta(hours=2),
    }
    return tier_defaults.get(complaint.assigned_tier, timedelta(days=30))
