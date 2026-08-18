# VANTA Backend Engineering Handoff

**BACKEND STATUS: READY (Audit & Contracts Phase)**

## 1. Architecture
The backend is built with FastAPI (Python) using a custom Mock ORM (`database.py`) that wraps PyMongo. This enables SQLAlchemy-style syntax while persisting data to MongoDB (or local MongoDB by default). 

The application logic is separated into:
- **Models**: Defines database schema (SQLAlchemy-like but MongoDB backed).
- **Routes**: Defines API endpoints.
- **Services**: Business logic, including AI integration, escalation, and routing.
- **Main**: Application entry point, WebSocket manager for real-time map updates.

## 2. Database Changes
No schema changes have been made yet as part of the initial audit. The existing schema has been preserved.

Key Entities:
- `Citizen`: Users reporting complaints.
- `Official`: Government officials assigned to complaints.
- `Complaint`: The core entity tracking issues, evidence, location, and resolution.
- `Upvote`: Community backing for complaints.
- `EscalationLog`: Audit trail for SLA breaches and escalations.
- `VerificationLog`: Citizen/community verification of resolutions.
- `DevelopmentProject`: Aggregated complaint data mapped to large-scale infrastructure projects.

## 3. API Contracts
All APIs are mounted under `app.include_router()`. Base URL is `/`.

- **Auth** (`routes/auth.py`)
- **Complaints** (`routes/complaints.py`)
- **Officials** (`routes/officials.py`)
- **Map** (`routes/map.py`): Real-time map data endpoints.
- **Resolution** (`routes/resolution.py`): Endpoints for officials to submit evidence and citizens to verify.
- **Escalation** (`routes/escalation.py`): SLA breach and routing.
- **Projects** (`routes/projects.py`)

## 4. State Machine (Complaint Lifecycle)
The backend enforces the following state transitions for a `Complaint`:
- `FILED` (Created)
- `ASSIGNED` (After Routing)
- `VIEWED` (By Official)
- `IN_PROGRESS` (Work started)
- `PENDING_VERIFICATION` (Official submits resolution)
- `RESOLVED` (Citizen accepts resolution) / `ESCALATED` (Citizen rejects or SLA expires)
- `ARCHIVED` (Closed permanently)

Resolution Status (`resolution_status`):
- `PENDING` -> `TEMP_FIX` or `VERIFIED` or `FALSE_CLOSURE`

## 5. Authentication
- Basic authentication is present in the `routes/auth.py` (needs to be checked for robustness, likely token-based or session-based in typical FastAPI setups). 

## 6. Authorization
- Route protection and object-level permissions must be enforced. An official should only modify complaints assigned to them or their jurisdiction. A citizen should only verify their own complaints.

## 7. AI Integration Contract
The AI engine logic resides in `services/ai_engine.py`.
Contract expectation from AI:
```json
{
  "category": "Infrastructure",
  "sub_category": "Pothole",
  "criticality_level": "ELEVATED",
  "criticality_score": 75,
  "ai_recommendation": "Dispatch road maintenance crew within 48h.",
  "is_fake_flagged": false
}
```
The backend integrates this into the `Complaint` creation workflow. The system gracefully falls back to default categorization if the AI service fails.

## 8. WebSocket Events
Real-time map updates are broadcast via `/ws/map`.
Events produced by the backend:
- `notify_clients(event_type: str, data: dict)`
- Types expected: `NEW_COMPLAINT`, `STATUS_UPDATE`, `ESCALATION_SWEEP`.

## 9. SLA Behaviour
- Escalation sweep runs every 60 seconds (in `main.py`).
- Checks for overdue complaints and increments `escalation_count`.
- Frontend is NOT authoritative for SLA deadlines; the backend calculates this via `deadline_at` and `is_overdue`.

## 10. Escalation Behaviour
- Idempotent escalation logic in `services/escalation.py`.
- Promotes `assigned_tier` from 1 up to 4.
- Logs every escalation in `EscalationLog`.

## 11. Resolution Verification
- Official cannot directly transition a complaint to `RESOLVED`.
- Official submits resolution (action, photos, notes) -> State moves to `PENDING_VERIFICATION`.
- Citizen votes (`VerificationLog`).
  - If accepted: `RESOLVED` and `resolution_status = VERIFIED`.
  - If rejected: `ESCALATED` and `resolution_status = FALSE_CLOSURE`.

## 12. Audit Behaviour
- State changes (escalations, verifications) are recorded in `EscalationLog` and `VerificationLog`.
- History is preserved; we do not overwrite or hard-delete complaints.

## 13. Files Changed
- Created `/docs/agent-handoffs/backend.md`

## 14. Files Untouched
- All backend source files (audit phase).

## 15. Known Issues
- Database schema currently stores photo URLs in a JSON list string format, which relies on `sqlite`-compatibility legacy code in the `models.py` even though MongoDB is the backing store.
- Authentication mechanisms need hardening for production (RBAC validation across all mutating endpoints).
- Needs robust environment variable validation on startup.

## 16. Frontend Dependencies
- Frontend must listen to `/ws/map` for live updates.
- Frontend must not assume a complaint is resolved until `status == "RESOLVED"`.
- Needs to implement the Verification UI (Accept/Reject resolution).

## 17. AI Dependencies
- `services/ai_engine.py` needs to provide stable categorisation and criticality scoring without blocking the main event loop for too long, or use async processing for complaint analysis.
