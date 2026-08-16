1. THE MOST IMPORTANT RULE

Put this at the top of every single agent prompt:

STRICT SCOPE CONTROL

You are working inside an existing SAMADHAN repository.

You are assigned ONLY the task explicitly described in this prompt.

Do not modify, refactor, rename, delete, move, or rewrite files outside your assigned scope.

Do not "clean up" unrelated code.

Do not improve unrelated architecture.

Do not change database schemas unless this task explicitly requires it.

Do not change APIs owned by another agent unless explicitly instructed.

Do not modify frontend components outside your assigned ownership.

Do not install dependencies unless required for your assigned task.

Do not change configuration files unless explicitly required.

Do not alter working functionality outside your scope.

If you discover a problem outside your scope:

DO NOT FIX IT.

Record it in OUT_OF_SCOPE.md or your final report and continue.

Your success is measured by completing your assigned task without causing regressions elsewhere.

Minimal changes are preferred over broad refactors.


PROJECT: SAMADHAN

SAMADHAN is an accountability operating system for civic governance.

It is NOT simply a complaint-management application.

Core problem:

Citizen reports problem
        ↓
Government receives complaint
        ↓
Official changes status
        ↓
Complaint becomes "resolved"
        ↓
Problem may still exist

SAMADHAN changes this into:

Citizen reports problem
        ↓
Evidence + AI analysis
        ↓
Authenticity / verification
        ↓
Community verification where appropriate
        ↓
Smart routing
        ↓
Official assignment
        ↓
SLA tracking
        ↓
Automatic escalation
        ↓
Official submits resolution evidence
        ↓
Citizen/community verifies
        ↓
RESOLVED only after verification

Core principles:

1. Accountability over simple ticket management.
2. Evidence over claims.
3. Citizen verification of resolution.
4. Automatic escalation.
5. AI-assisted decision support.
6. Government workflow integration.
7. Public transparency.
8. Immutable/auditable history.
9. Modular engines.
10. Production-minded architecture.

Core engines:

1. AI Analysis Engine
2. Authenticity Engine
3. Duplicate / Incident Clustering Engine
4. Community Verification Engine
5. Smart Routing Engine
6. SLA / Auto-Escalation Engine
7. Resolution Verification Engine
8. Accountability Engine
9. Transparency Engine
10. Public Audit Ledger
11. Real-Time Event Engine
12. Civic Intelligence / DPR Engine

Golden demo:

Citizen
→ reports pothole
→ uploads photo
→ location captured
→ AI classifies it
→ authenticity/evidence checked
→ duplicate detection
→ community verification
→ smart routing
→ official receives assignment
→ SLA starts
→ official submits resolution evidence
→ citizen rejects false resolution
→ complaint reopens
→ escalation occurs
→ accountability impact recorded
→ actual resolution
→ citizen verifies
→ complaint becomes resolved
→ complete audit timeline remains visible.

SIH principle:

Do not build dozens of superficial features.

Build a small number of deep, working mechanisms that can be demonstrated live.

If a feature is claimed to exist, the judge should be able to see it working.

The research document is the product/architecture reference, but not every research feature must be implemented in the SIH prototype.
