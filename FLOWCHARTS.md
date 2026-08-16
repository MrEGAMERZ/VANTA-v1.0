# VANTA — Complete System Flowcharts
### All Engines · All Workflows · Current State + Planned

> **Legend:**
> `✅ BUILT` — Code exists and works today
> `⚠️ PARTIAL` — Code exists but not fully wired
> `🔴 PLANNED` — Not built yet, designed for next phase
> Dashed boxes `- - -` represent planned/future additions

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Citizen Login Flow](#2-citizen-login-flow)
3. [Official Login Flow](#3-official-login-flow)
4. [Complaint Filing Flow](#4-complaint-filing-flow)
5. [AI Engine — How a Complaint Gets Analyzed](#5-ai-engine--how-a-complaint-gets-analyzed)
6. [Routing Engine — Who Gets the Complaint](#6-routing-engine--who-gets-the-complaint)
7. [Escalation Engine — What Happens When Officials Don't Act](#7-escalation-engine--what-happens-when-officials-dont-act)
8. [Resolution & Verification Loop](#8-resolution--verification-loop)
9. [Star Rating Engine](#9-star-rating-engine)
10. [WebSocket / Real-Time Engine](#10-websocket--real-time-engine)
11. [Accountability Score Engine](#11-accountability-score-engine)
12. [DPR Generation Engine (Planned)](#12-dpr-generation-engine-planned)
13. [Full Complaint Lifecycle — End to End](#13-full-complaint-lifecycle--end-to-end)
14. [Frontend Route Map](#14-frontend-route-map)
15. [Database Entity Relationships](#15-database-entity-relationships)

---

## 1. System Architecture Overview

```
╔══════════════════════════════════════════════════════════════════╗
║                     VANTA PLATFORM (v1.0)                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║   BROWSER / CLIENT                                               ║
║   ┌─────────────────────────────────────────────────────────┐   ║
║   │           React 19 + Vite (SPA)                         │   ║
║   │                                                         │   ║
║   │  /           → Portal (Landing)        ✅               │   ║
║   │  /login/*    → Auth Pages              ✅               │   ║
║   │  /citizen/*  → Citizen Portal          ⚠️ partial       │   ║
║   │  /official/* → Official Portal         ✅               │   ║
║   │  /mla/*      → MLA Portal              ✅               │   ║
║   │  /mp/*       → MP Portal               ✅               │   ║
║   └───────────────────────┬─────────────────────────────────┘   ║
║                           │                                      ║
║              HTTP REST + WebSocket (ws://)                       ║
║                           │                                      ║
║   ┌───────────────────────▼─────────────────────────────────┐   ║
║   │           FastAPI Backend (Python)                       │   ║
║   │                                                         │   ║
║   │  /api/auth         ✅   /api/complaints  ✅             │   ║
║   │  /api/officials    ✅   /api/resolution  ✅             │   ║
║   │  /api/escalation   ✅   /api/projects    ⚠️             │   ║
║   │  /api/map          ✅   /ws/map          ✅             │   ║
║   │                                                         │   ║
║   │  ┌──────────────────────────────────────────────────┐  │   ║
║   │  │ Background Services (run every 60s on startup)   │  │   ║
║   │  │   └── Escalation Sweep Engine          ✅        │  │   ║
║   │  └──────────────────────────────────────────────────┘  │   ║
║   └───────────────────────┬─────────────────────────────────┘   ║
║                           │                                      ║
║                           │ PyMongo / SQLite ORM                 ║
║                           │                                      ║
║   ┌───────────────────────▼─────────────────────────────────┐   ║
║   │           Database (MongoDB / SQLite)                    │   ║
║   │                                                         │   ║
║   │  citizens · officials · complaints · upvotes            │   ║
║   │  escalation_log · verification_log · dev_projects       │   ║
║   └─────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║   EXTERNAL                                                       ║
║   ┌──────────────────┐                                          ║
║   │  Google Gemini   │  ← AI classification + DPR writing       ║
║   │  API (Flash 2.0) │                                          ║
║   └──────────────────┘                                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 2. Citizen Login Flow

> **Status: ✅ FULLY BUILT** (`/api/auth/citizen/request-otp` + `/api/auth/citizen/verify-otp`)

```
┌─────────────────────────────────────────────────────────┐
│                  CITIZEN VISITS APP                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Goes to /login/citizen │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Enters Phone Number  │
              └──────────┬───────────┘
                         │
                         ▼
              POST /api/auth/citizen/request-otp
                         │
                         ▼
              ┌──────────────────────────────┐
              │  Does citizen exist in DB?   │
              └──────────┬───────────────────┘
                         │
            ┌────────────┴────────────┐
           YES                        NO
            │                         │
            ▼                         ▼
     Fetch existing          Create new Citizen record
     Citizen record          (name, ward, district seeded
                              from phone number)
            │                         │
            └────────────┬────────────┘
                         │
                         ▼
              Store OTP "123456" in memory
              (mock_otp_store[phone] = "123456")
                         │
                         ▼
              ┌──────────────────────┐
              │  Return: "OTP Sent"  │
              │  [Demo: always 123456] │
              └──────────┬───────────┘
                         │
                         ▼
              Citizen enters OTP in UI
                         │
                         ▼
              POST /api/auth/citizen/verify-otp
                         │
                         ▼
              ┌─────────────────────────┐
              │  OTP == "123456"?        │
              └──────────┬──────────────┘
                         │
            ┌────────────┴────────────┐
            NO                       YES
            │                         │
            ▼                         ▼
    ┌───────────────┐      Create JWT Token
    │  Error: 400   │      { sub: citizen_id,
    │  Invalid OTP  │        role: "CITIZEN",
    └───────────────┘        expires: 24h }
                              │
                              ▼
                   Store in localStorage:
                   user_token, user_role="CITIZEN"
                   user_name, user_id
                              │
                              ▼
                   Redirect → /citizen/home

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Real SMS OTP via MSG91 / Twilio
🔴 PLANNED: OTP expires after 5 minutes
🔴 PLANNED: Max 3 OTP attempts before lockout
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 3. Official Login Flow

> **Status: ✅ FULLY BUILT** (`/api/auth/official/login` + `/api/auth/official/register`)

```
┌──────────────────────────────────────────────────────────┐
│               OFFICIAL VISITS APP                         │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │  Goes to /login/official │
               └──────────┬───────────┘
                          │
                          ▼
               ┌──────────────────────────┐
               │  Enters Email + Password  │
               └──────────┬───────────────┘
                          │
                          ▼
               POST /api/auth/official/login
                          │
                          ▼
               ┌──────────────────────────────┐
               │  Query Official by email      │
               └──────────┬───────────────────┘
                          │
               ┌──────────┴───────────────┐
               NOT FOUND                 FOUND
               │                          │
               ▼                          ▼
    ┌────────────────────┐    bcrypt.verify(password,
    │ Error 401:         │    official.password_hash)
    │ User not found     │         │
    └────────────────────┘    ┌────┴────┐
                             PASS     FAIL
                              │         │
                              ▼         ▼
                    Create JWT Token  Error 401:
                    { sub: official_id  Wrong password
                      role: MLA/COLLECTOR
                             /MP/MINISTRY
                      expires: 8h }
                              │
                              ▼
                   role → redirect map:
                   ┌──────────────────────────────┐
                   │ MLA       → /mla/dashboard    │
                   │ COLLECTOR → /official/dashboard│
                   │ MP        → /mp/dashboard     │
                   │ MINISTRY  → /official/dashboard│
                   └──────────────────────────────┘

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: NIC SSO / .gov.in email verification
🔴 PLANNED: Admin approval required for new registrations
🔴 PLANNED: Role provisioning via admin super-user panel
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 4. Complaint Filing Flow

> **Status: ✅ MOSTLY BUILT** — Voice-to-text is mock animation, rest is real

```
CITIZEN is logged in → navigates to /citizen/file-report
                          │
                          ▼
              ┌──────────────────────────────────┐
              │        CitizenReport.jsx          │
              │                                  │
              │  [🎤 Voice Input]  ⚠️ fake anim  │
              │  [📝 Text Input ]  ✅ works       │
              │  [📍 Location   ]  ⚠️ hardcoded   │
              │  [📷 Photo      ]  🔴 not built   │
              └──────────────┬───────────────────┘
                             │
                             ▼
                 Citizen submits complaint text
                             │
                             ▼
               POST /api/complaints  { text_content,
                                       citizen_id,
                                       ward, district,
                                       location_lat/lng }
                             │
                             ▼
         ┌───────────────────────────────────────────────┐
         │              COMPLAINT CREATION PIPELINE      │
         │                                               │
         │  Step 1: AI ENGINE ──────────────────────►   │
         │          analyze_complaint_ai(text)           │
         │          (see Flow #5 for detail)             │
         │          Returns: category, sub_category,     │
         │                   score, level, language      │
         │                                               │
         │  Step 2: STAR RATING ────────────────────►   │
         │          calculate_stars_rating(score,        │
         │                               upvotes=0)      │
         │          Returns: 1–5 stars                   │
         │                                               │
         │  Step 3: COMPLAINT RECORD CREATED ────────►  │
         │          status = "FILED"                     │
         │          All AI fields stored                 │
         │                                               │
         │  Step 4: ROUTING ENGINE ─────────────────►   │
         │          route_complaint_to_official()        │
         │          (see Flow #6 for detail)             │
         │          Returns: official_id, tier (1–4)     │
         │                                               │
         │  Step 5: DEADLINE SET ───────────────────►   │
         │          CATASTROPHIC → 1 hour               │
         │          CRITICAL     → 2 hours              │
         │          HIGH         → 2 days               │
         │          ELEVATED     → 7 days               │
         │          MODERATE     → 15 days              │
         │          ROUTINE      → 30 days              │
         │                                               │
         │  Step 6: COMMIT TO DB ───────────────────►   │
         │          status updated to "ASSIGNED"         │
         │          official.complaints_assigned += 1    │
         │                                               │
         │  Step 7: WEBSOCKET BROADCAST ────────────►   │
         │          notify_clients("NEW_COMPLAINT", ...) │
         │          → All connected officials see pin    │
         │            appear on live map instantly       │
         └───────────────────────────────────────────────┘
                             │
                             ▼
               Citizen sees: "Complaint Filed! ✅"
               Complaint ID assigned, redirected to
               /citizen/issues

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Real Web Speech API (window.SpeechRecognition)
🔴 PLANNED: Hindi voice input (lang="hi-IN")
🔴 PLANNED: Browser Geolocation API for auto lat/lng
🔴 PLANNED: Photo upload via FormData → /api/upload
🔴 PLANNED: Duplicate detection (cluster similar complaints)
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 5. AI Engine — How a Complaint Gets Analyzed

> **Status: ✅ FULLY BUILT** (`backend/services/ai_engine.py`) — Gemini 2.0 Flash + local fallback

```
               analyze_complaint_ai(text)
                          │
                          ▼
               ┌──────────────────────────┐
               │  GEMINI_API_KEY exists?  │
               └──────────┬───────────────┘
                          │
            ┌─────────────┴──────────────┐
            NO (key missing)            YES
            │                            │
            ▼                            ▼
   ┌─────────────────┐       Call Gemini 2.0 Flash API
   │ LOCAL FALLBACK  │       with structured prompt:
   │ RULES ENGINE    │       "Analyze this complaint,
   │ (see below)     │        return JSON with category,
   └────────┬────────┘        sub_category, score 0-100,
            │                 level, reasoning, language"
            │                            │
            │                ┌───────────┴──────────┐
            │               API                   API
            │             SUCCESS               FAILS
            │                │                    │
            │                ▼                    ▼
            │         Parse JSON response   LOCAL FALLBACK
            │                │              RULES ENGINE
            │                └──────┬───────────┘
            │                       │
            ▼                       ▼
   ┌─────────────────────────────────────────────────────┐
   │           LOCAL FALLBACK RULES ENGINE               │
   │                                                     │
   │  KEYWORD MATCHING → CATEGORY:                       │
   │  ┌─────────────────────────────────────────────┐   │
   │  │ water/leak/pipe/sewage/drain → "Water"      │   │
   │  │ light/electricity/pole/power → "Electrical" │   │
   │  │ garbage/trash/waste/dump     → "Sanitation" │   │
   │  │ health/hospital/clinic       → "Health"     │   │
   │  │ school/education/classroom   → "Education"  │   │
   │  │ (default)                    → "Roads"      │   │
   │  └─────────────────────────────────────────────┘   │
   │                                                     │
   │  CRITICALITY SCORING:                               │
   │  ┌─────────────────────────────────────────────┐   │
   │  │ collapsed/fire/flood/gas leak/burst/fissure  │   │
   │  │      → score 85–95, level CRITICAL/CATASTRO │   │
   │  │ crack/broken/danger/contamination/blackout   │   │
   │  │      → score 65, level HIGH                 │   │
   │  │ overflow/pothole/blocked                     │   │
   │  │      → score 45, level ELEVATED             │   │
   │  │ garbage/trash/clean                          │   │
   │  │      → score 35, level MODERATE             │   │
   │  │ (default)                                    │   │
   │  │      → score 30, level ROUTINE              │   │
   │  └─────────────────────────────────────────────┘   │
   └─────────────────────────┬───────────────────────────┘
                             │
                             ▼
              FINAL OUTPUT: {
                  category:     "Water",
                  sub_category: "Water Line Burst",
                  score:        72,
                  level:        "HIGH",
                  reasoning:    "...",
                  language:     "en"
              }

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Location context scoring
           (near_school / near_hospital / flood_zone
            bump the score upward automatically)
🔴 PLANNED: Duplicate detection using semantic similarity
🔴 PLANNED: Photo analysis via Gemini Vision API
           (verify complaint with uploaded photo)
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 6. Routing Engine — Who Gets the Complaint

> **Status: ✅ BUILT** (`backend/services/routing.py`) — Criticality-based smart routing

```
     route_complaint_to_official(complaint, db)
                          │
                          ▼
         Read: complaint.criticality_level
               complaint.text_content
               complaint.ward
                          │
    ┌─────────────────────┼──────────────────────────┐
    │                     │                          │
    ▼                     ▼                          ▼
level ==           level == CRITICAL         level == HIGH/ELEVATED/
CATASTROPHIC       AND text contains:        MODERATE/ROUTINE
    │               highway/dam/bridge            │
    ▼               /constituency                 │
TIER 4              │                             │
Ministry            ▼                             ▼
official         TIER 3                     level == CRITICAL/HIGH
                 MP official                AND text contains:
                                            district/multi-ward
                                            /collector/hospital
                                                  │
                                                  ▼
                                             TIER 2
                                             Collector official
                                                  │
                                    (none of the above matched)
                                                  │
                                                  ▼
                                             TIER 1 (DEFAULT)
                                             Find MLA whose
                                             jurisdiction LIKE
                                             complaint.ward
                                                  │
                                        ┌─────────┴──────────┐
                                    FOUND                NOT FOUND
                                        │                    │
                                        ▼                    ▼
                                 Assign to that MLA    Assign to first
                                                       MLA in system
                                                       (demo fallback)
                          │
                          ▼
         Return: (official_id, tier_number)
         Set on complaint:
           assigned_to = official_id
           assigned_tier = tier
           assigned_at = now()
           status = "ASSIGNED"

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Ward Councillor as Tier 1 (before MLA)
🔴 PLANNED: Department-based routing
           (water complaint → Jal Board engineer,
            road complaint → PWD junior engineer)
🔴 PLANNED: Geography-based routing
           (GeoJSON ward boundaries, point-in-polygon)
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 7. Escalation Engine — What Happens When Officials Don't Act

> **Status: ✅ BUILT** (`backend/services/escalation.py`) — Runs every 60 seconds automatically

```
  SERVER STARTUP
       │
       ▼
  start_escalation_sweep()
  [FastAPI @on_event("startup")]
       │
       ▼
  asyncio.sleep(10)  ← wait 10s after boot
       │
       ▼
  ┌──────────────────────────────────────┐
  │         SWEEP LOOP (every 60s)       │◄──────────┐
  │                                      │           │
  │  Query ALL complaints where:         │           │
  │  status NOT IN [RESOLVED, ARCHIVED]  │           │
  │  AND deadline_at < NOW()             │           │
  │                                      │           │
  │  For each overdue complaint:         │           │
  │  ┌────────────────────────────────┐  │           │
  │  │ 1. Mark is_overdue = True      │  │           │
  │  │ 2. Auto-bump star_rating +1    │  │           │
  │  │    (max 5 stars)               │  │           │
  │  │ 3. Check assigned_tier         │  │           │
  │  │    tier < 4? → can escalate    │  │           │
  │  │                                │  │           │
  │  │ 4. Find next tier official:    │  │           │
  │  │    tier 1→2: COLLECTOR         │  │           │
  │  │    tier 2→3: MP                │  │           │
  │  │    tier 3→4: MINISTRY          │  │           │
  │  │                                │  │           │
  │  │ 5. Create EscalationLog:       │  │           │
  │  │    from_tier, to_tier,         │  │           │
  │  │    from_official, to_official, │  │           │
  │  │    reason (days overdue)       │  │           │
  │  │                                │  │           │
  │  │ 6. PENALIZE previous official: │  │           │
  │  │    accountability_score -= 10  │  │           │
  │  │                                │  │           │
  │  │ 7. REASSIGN complaint:         │  │           │
  │  │    assigned_to = new official  │  │           │
  │  │    assigned_tier += 1          │  │           │
  │  │    status = "ESCALATED"        │  │           │
  │  │    escalation_count += 1       │  │           │
  │  │                                │  │           │
  │  │ 8. HALVE deadline window:      │  │           │
  │  │    new_deadline = now +        │  │           │
  │  │    (old_window / 2)            │  │           │
  │  │    ← Creates urgency that      │  │           │
  │  │      compounds with each tier  │  │           │
  │  └────────────────────────────────┘  │           │
  │                                      │           │
  │  DB commit()                         │           │
  │  WebSocket broadcast:                │           │
  │   notify_clients("ESCALATION_SWEEP", │           │
  │                  {count: N})         │           │
  │                                      │           │
  │  asyncio.sleep(60) ──────────────────────────────┘
  └──────────────────────────────────────┘

DEADLINE WINDOWS PER CRITICALITY:
┌────────────────┬───────────────┬──────────────────┐
│ Criticality    │ Initial Window│ After Escalation  │
├────────────────┼───────────────┼──────────────────┤
│ CATASTROPHIC   │ 1 hour        │ 30 minutes        │
│ CRITICAL       │ 2 hours       │ 1 hour            │
│ HIGH           │ 2 days        │ 1 day             │
│ ELEVATED       │ 7 days        │ 3.5 days          │
│ MODERATE       │ 15 days       │ 7.5 days          │
│ ROUTINE        │ 30 days       │ 15 days           │
└────────────────┴───────────────┴──────────────────┘

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: SMS/Push notification to escalated official
🔴 PLANNED: Email alert to MP when MLA misses deadline
🔴 PLANNED: Three-strike system: 3 false closures →
            all complaints auto-escalate from that official
🔴 PLANNED: Configurable sweep intervals per criticality
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 8. Resolution & Verification Loop

> **Status: ✅ FULLY BUILT** (`backend/routes/resolution.py`) — The anti-false-closure engine

```
OFFICIAL is viewing complaint → /official/complaint/:id
                │
                ▼
  Official takes action on complaint:
  PUT /api/complaints/:id/status
  status = "IN_PROGRESS"
                │
                ▼
  Official prepares resolution evidence
                │
                ▼
  POST /api/complaints/:id/resolve
  { resolution_note, resolution_photos,
    resolution_action, fund_used, amount_spent }
                │
                ▼
  ┌─────────────────────────────────────────────┐
  │    STATUS → "PENDING_VERIFICATION"          │
  │    (NOT RESOLVED YET — citizen must verify) │
  │                                             │
  │    resolution_status = "PENDING"            │
  │    resolved_at = now()                      │
  │    WebSocket broadcast → STATUS_CHANGE      │
  └─────────────────────────┬───────────────────┘
                            │
                            ▼
         Citizen gets notified: "Your complaint was
         marked resolved. Was it actually fixed?"
                            │
                            ▼
         POST /api/complaints/:id/verify
         { citizen_id, vote: true/false }
                            │
                ┌───────────┴──────────────┐
                │                          │
         vote = TRUE                 vote = FALSE
         (YES, it's fixed)          (NO, still broken)
                │                          │
                ▼                          ▼
  verification_yes += 1        verification_no += 1
                │                          │
                ▼                          ▼
  ┌─────────────────────┐    ┌──────────────────────────┐
  │  STATUS → RESOLVED  │    │  STATUS → ASSIGNED        │
  │  (VERIFIED)         │    │  (REOPENED)               │
  │                     │    │                          │
  │  resolution_status  │    │  resolution_status =     │
  │   = "VERIFIED"      │    │   "FALSE_CLOSURE"         │
  │  verified_at = now()│    │                          │
  │                     │    │  verification_yes = 0    │
  │  REWARD OFFICIAL:   │    │  verification_no = 0     │
  │  +10 accountability │    │  (reset for next attempt) │
  │  +1 resolved count  │    │                          │
  └─────────────────────┘    │  PENALIZE OFFICIAL:      │
                             │  -15 accountability pts  │
                             │                          │
                             │  Alert sent to tier above│
                             │  (MLA's false closure    │
                             │   notifies Collector)    │
                             └──────────────────────────┘

VERIFICATION LOG TABLE:
Every vote is permanently stored:
{ complaint_id, citizen_id, vote, voted_at }
→ Creates an auditable, tamper-proof record

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: 72h auto-verify timeout
           (if citizen doesn't respond, complaint
            auto-resolves with reduced score for official)
🔴 PLANNED: Community verification
           (3 upvoters can also cast NO votes)
🔴 PLANNED: Photo geolocation verification
           (GPS in resolution photo must match
            complaint location within 500m)
🔴 PLANNED: Temp Fix flag (complaint stays open
            for 30 days with a temporary resolution)
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 9. Star Rating Engine

> **Status: ✅ BUILT** (`ai_engine.py: calculate_stars_rating()`) — Dynamic priority scoring

```
              calculate_stars_rating(score, upvotes)
                            │
                            ▼
  ┌──────────────────────────────────────────────────┐
  │         STEP 1: AI SCORE → BASE STARS            │
  │                                                  │
  │   score >= 90  →  base_stars = 5   (CATASTROPHIC)│
  │   score >= 70  →  base_stars = 4   (CRITICAL)    │
  │   score >= 50  →  base_stars = 3   (ELEVATED)    │
  │   score >= 30  →  base_stars = 2   (MODERATE)    │
  │   score <  30  →  base_stars = 1   (ROUTINE)     │
  └──────────────────────────┬───────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────┐
  │         STEP 2: COMMUNITY UPVOTE BUMP            │
  │                                                  │
  │   upvote_bump = upvotes // 25                    │
  │   (every 25 upvotes adds +1 star)                │
  │                                                  │
  │   Example: 75 upvotes → +3 star bump             │
  └──────────────────────────┬───────────────────────┘
                             │
                             ▼
  final_stars = min(5, base_stars + upvote_bump)
  final_stars = max(1, final_stars)

  EXAMPLE:
  ┌──────────────────────────────────────────────────┐
  │ Pothole complaint    score=35 (Moderate)         │
  │ base_stars = 2                                   │
  │ 0 upvotes → bump = 0                             │
  │ RESULT: ⭐⭐ (2 stars)                           │
  │                                                  │
  │ Same pothole but 100 residents upvote:           │
  │ base_stars = 2                                   │
  │ 100 upvotes → bump = 4                           │
  │ min(5, 2+4) = 5                                  │
  │ RESULT: ⭐⭐⭐⭐⭐ (5 stars) — community demand  │
  │         overrides AI severity estimate           │
  │                                                  │
  │ Also recalculated on every new upvote:           │
  │ POST /api/complaints/:id/upvote                  │
  │ → star_rating updated live in DB                 │
  └──────────────────────────────────────────────────┘

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Time decay factor
           (old unresolved complaints gain +0.5 stars
            per week to prevent being permanently ignored)
🔴 PLANNED: Star bumped during escalation sweep
           (already partial: is_overdue triggers +1 star)
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 10. WebSocket / Real-Time Engine

> **Status: ⚠️ PARTIAL** — Server built, resolution broadcasts work, map not fully wired

```
SERVER SIDE (main.py):
  ConnectionManager maintains: List[WebSocket]

  /ws/map endpoint:
       │
       ▼
  Client connects → manager.connect(websocket)
  Client disconnects → manager.disconnect(websocket)

  Events that trigger broadcast:
  ┌─────────────────────────────────────────────────┐
  │ Event Type          │ Triggered When             │
  ├─────────────────────┼────────────────────────────┤
  │ "NEW_COMPLAINT"     │ POST /api/complaints  ✅   │
  │ "STATUS_CHANGE"     │ PUT status update     ✅   │
  │ "STATUS_CHANGE"     │ POST /resolve         ✅   │
  │ "STATUS_CHANGE"     │ POST /verify          ✅   │
  │ "STATUS_CHANGE"     │ POST /upvote          ✅   │
  │ "ESCALATION_SWEEP"  │ Every 60s sweep       ✅   │
  └─────────────────────┴────────────────────────────┘

  Payload format:
  { "event": "NEW_COMPLAINT",
    "data": { complaint_object } }

CLIENT SIDE:
  LiveMap.jsx connects to ws://localhost:8000/ws/map
  Listens for incoming JSON messages
  → "NEW_COMPLAINT": adds new pin to Leaflet map
  → "STATUS_CHANGE": updates existing pin color/status

  NotificationBell.jsx:
  → Shows badge count for unread events
  → Dropdown with recent alerts

CONNECTION STATE:
  Browser tab open → WebSocket connected
  Multiple officials open → each gets all broadcasts
  Connection drops → auto-reconnect logic ⚠️ (partial)

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Constituency.jsx wired to LiveMap
           (currently uses static CSS fake map)
🔴 PLANNED: Notification Bell fully consuming WS events
🔴 PLANNED: Per-user filtered broadcasts
           (MLA only gets their ward's events)
🔴 PLANNED: PWA push notifications when tab is closed
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 11. Accountability Score Engine

> **Status: ✅ BUILT** (woven through complaints.py, resolution.py, escalation.py)

```
Every Official starts with: accountability_score = 100

SCORE CHANGES:
┌──────────────────────────────────────────────────────────┐
│  EVENT                              │  SCORE CHANGE       │
├─────────────────────────────────────┼─────────────────────┤
│  Citizen votes YES (verified fix)   │  +10 points         │
│  Complaint escalated away from them │  -10 points         │
│  Citizen votes NO (false closure)   │  -15 points         │
├─────────────────────────────────────┼─────────────────────┤
│  Score floor                        │  min 0              │
│  Score ceiling                      │  max 100            │
└─────────────────────────────────────┴─────────────────────┘

SCORE IS USED FOR:
  ┌────────────────────────────────────────────────────────┐
  │  1. MLA Scoreboard (MP portal)                        │
  │     → MPs see ranked list of all MLAs by score        │
  │     → Creates peer accountability                     │
  │                                                       │
  │  2. Official Profile page                             │
  │     → Officials see their own performance telemetry   │
  │     → resolution_rate, avg_response_time shown        │
  │                                                       │
  │  3. DPR Priority Ranking (Planned)                    │
  │     → Low-scoring official's area gets flagged        │
  │        for priority infrastructure investment         │
  └────────────────────────────────────────────────────────┘

DERIVED METRICS (stored on Official model):
  complaints_assigned  → total ever assigned
  complaints_resolved  → total citizen-verified
  avg_response_time    → average hours to first action
  resolution_rate      → complaints_resolved /
                         complaints_assigned × 100

- - - - - - - - - - - - - - - - - - - - - - (PLANNED)
🔴 PLANNED: Time-to-resolve bonus
           (faster resolution = more points)
🔴 PLANNED: Streak bonuses
           (10 consecutive resolutions = double points)
🔴 PLANNED: Three-strike false closure system
           (3 false closures → complaints auto-escalate)
🔴 PLANNED: Public-facing official scorecard
           (visible without login for transparency)
- - - - - - - - - - - - - - - - - - - - - -
```

---

## 12. DPR Generation Engine (Planned)

> **Status: ⚠️ PARTIAL** — Model exists, routes exist, AI generation not built yet

```
                    🔴 PLANNED FLOW

  Background job (daily/weekly):
       │
       ▼
  Query all RESOLVED + ESCALATED complaints
  GROUP BY (ward, category)
       │
       ▼
  ┌────────────────────────────────────────────────────┐
  │  CLUSTER ANALYSIS:                                 │
  │                                                    │
  │  If ward "X" has > 10 complaints of category       │
  │  "Water" within 500m radius:                       │
  │  → Create DevelopmentProject record                │
  │                                                    │
  │  DevelopmentProject fields:                        │
  │  ├── complaint_count   (how many drove this)       │
  │  ├── population_affected                           │
  │  ├── star_avg          (avg severity)              │
  │  ├── criticality_max   (worst complaint in cluster)│
  │  ├── budget_estimate   (AI-generated)              │
  │  ├── scheme_eligible   [MPLADS, Smart City,        │
  │  │                      AMRUT, PMGSY, etc.]        │
  │  └── ai_recommendation (Gemini-written brief)      │
  └────────────────────────────┬───────────────────────┘
                               │
                               ▼
  Gemini API call:
  "Given these complaints about water pipe bursts in
   Ward 7, write a formal Development Project Report
   for repair/replacement. Estimate cost, suggest
   scheme eligibility, and prioritize urgency."
                               │
                               ▼
  DPR saved to development_projects table
  Ranked by: criticality_max + complaint_count + star_avg
                               │
                               ▼
  ┌────────────────────────────────────────────────────┐
  │  MP Priority Ranker (/mp/priority)                 │
  │  Shows top-ranked DPRs, MP can:                    │
  │  ├── "Approve for MPLADS Funding"  ✅ (built)      │
  │  └── "Export as PDF"              🔴 (planned)     │
  │                                                    │
  │  Official Analytics (/official/analytics)          │
  │  Shows DPR cards with scheme suggestions   ⚠️     │
  └────────────────────────────────────────────────────┘

Currently:
  GET /api/projects  → returns seeded static projects
  POST /api/projects/generate → returns same static list
  POST /api/projects/:id/approve → marks approved=True ✅
```

---

## 13. Full Complaint Lifecycle — End to End

> The complete journey of a single complaint from filing to resolution

```
CITIZEN FILES COMPLAINT
    │
    ▼
┌──────────┐
│  FILED   │  status="FILED"  (milliseconds)
└────┬─────┘
     │  AI Engine runs + Routing Engine runs
     ▼
┌──────────┐
│ ASSIGNED │  status="ASSIGNED"
│          │  assigned_to = official_id
│          │  assigned_tier = 1/2/3/4
│          │  deadline_at = set based on criticality
│          │  WebSocket → pin appears on official's map
└────┬─────┘
     │
     ├── [Clock ticking toward deadline_at]
     │
     ▼
Official opens complaint detail page
     │
     ▼
┌──────────┐
│  VIEWED  │  status="VIEWED"
│          │  first_viewed_at = now()
└────┬─────┘
     │
     ▼
Official starts working on it
     │
     ▼
┌─────────────┐
│ IN_PROGRESS │  status="IN_PROGRESS"
│             │  first_response_at = now()
└──────┬──────┘
       │
       ├─────────────────────────────────────────────────┐
       │                                                  │
  Official acts                                    DEADLINE PASSES
  in time                                                 │
       │                                                  ▼
       │                                        ┌──────────────┐
       │                                        │  ESCALATED   │
       │                                        │  Escalation  │
       │                                        │  Sweep fires │
       │                                        │  (every 60s) │
       │                                        │              │
       │                                        │  Previous    │
       │                                        │  official:   │
       │                                        │  score -= 10 │
       │                                        │              │
       │                                        │  New official│
       │                                        │  assigned at │
       │                                        │  higher tier │
       │                                        │  deadline/2  │
       │                                        └──────┬───────┘
       │                                               │
       └───────────────────────┬───────────────────────┘
                               │
                               ▼
                   Official submits resolution
                   (photo evidence required)
                               │
                               ▼
                   ┌───────────────────────┐
                   │  PENDING_VERIFICATION │
                   │  resolution_status    │
                   │   = "PENDING"         │
                   │  Citizen notified     │
                   └──────────┬────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
               Citizen: YES        Citizen: NO
                    │                    │
                    ▼                    ▼
             ┌──────────┐      ┌──────────────────┐
             │ RESOLVED │      │ FALSE CLOSURE     │
             │ VERIFIED │      │ → REOPENED        │
             │          │      │ → official -15pts │
             │ +10 pts  │      │ → back to         │
             └──────────┘      │   IN_PROGRESS     │
                               └──────────────────┘
                                        │
                                  [cycle repeats
                                   with halved
                                   deadline window]

FINAL STATES:
  RESOLVED  → Citizen verified, archived after 30 days
  ARCHIVED  → Old resolved complaint moved to cold storage
```

---

## 14. Frontend Route Map

> All screens in the app and what role can access them

```
/  (Portal.jsx)
│  PUBLIC — Landing page, role selection
│
├── /login/citizen       (CitizenLogin.jsx)
│   PUBLIC — OTP-based phone login
│
├── /login/official      (OfficialLogin.jsx)
│   PUBLIC — Email/password login + register
│
├── /citizen/*           [AuthGuard: role=CITIZEN]
│   │   Wrapped in CitizenLayout (sidebar + topbar)
│   │
│   ├── /citizen/home          (CitizenHome.jsx)       ⚠️ placeholder
│   ├── /citizen/file-report   (CitizenReport.jsx)     ⚠️ voice mock
│   ├── /citizen/issues        (CitizenIssues.jsx)     ✅ working
│   ├── /citizen/analytics     (CitizenAnalytics.jsx)  ⚠️ placeholder
│   └── /citizen/profile       (CitizenProfile.jsx)    ✅ working
│
├── /official/*          [AuthGuard: MLA/COLLECTOR/MP/MINISTRY]
│   │   Wrapped in OfficialLayout (sidebar + topbar)
│   │
│   ├── /official/dashboard    (OfficialDashboard.jsx) ✅ working
│   ├── /official/constituency (Constituency.jsx)      ⚠️ fake map
│   ├── /official/escalations  (Escalations.jsx)       ⚠️ mock data
│   ├── /official/analytics    (Analytics.jsx)         ⚠️ mock data
│   ├── /official/profile      (OfficialProfile.jsx)   ✅ working
│   └── /official/complaint/:id (ComplaintDetail.jsx)  ✅ working
│
├── /mla/*               [AuthGuard: role=MLA]
│   │   Wrapped in MlaLayout
│   │
│   └── /mla/dashboard   (MlaDashboard.jsx)            ✅ working
│
├── /mp/*                [AuthGuard: role=MP]
│   │   Wrapped in MpLayout
│   │
│   ├── /mp/dashboard    (MpDashboard.jsx)             ✅ working
│   ├── /mp/overview     (MpOverview.jsx)              ✅ working
│   ├── /mp/priority     (MpPriorityRanker.jsx)        ⚠️ mock data
│   └── /mp/mlas         (MpMlaScoreboard.jsx)         ✅ working
│
└── /*                   (NotFound.jsx)
    PUBLIC — 404 catch-all
```

---

## 15. Database Entity Relationships

```
┌─────────────┐        ┌───────────────────────────────────────────┐
│   Citizen   │        │                 Complaint                  │
│─────────────│        │───────────────────────────────────────────│
│ id (PK)     │◄───────┤ citizen_id (FK)                           │
│ phone       │        │ id (PK)                                   │
│ name        │        │ text_content / text_original              │
│ ward        │        │ language_detected                         │
│ district    │        │ voice_file_url                            │
│ location_   │        │ photo_urls [ ]                            │
│  lat/lng    │        │ location_lat/lng/address                  │
│ reward_     │        │ ward / district                           │
│  points     │        │ category / sub_category                   │
└──────┬──────┘        │ criticality_level / score                 │
       │               │ star_rating                               │
       │               │ upvote_count                              │
       │  ┌────────────┤ assigned_to (FK) ──────────────────────┐  │
       │  │            │ assigned_tier (1/2/3/4)                │  │
       │  │            │ status (FILED→ASSIGNED→IN_PROGRESS→    │  │
       │  │            │         ESCALATED→PENDING_VERIFICATION │  │
       │  │            │         →RESOLVED→ARCHIVED)            │  │
       │  │            │ is_overdue / escalation_count          │  │
       │  │            │ near_school/hospital/highway (bool)     │  │
       │  │            │ filed_at/assigned_at/deadline_at/       │  │
       │  │            │  resolved_at/verified_at               │  │
       │  │            │ resolution_note/photos/action          │  │
       │  │            │ resolution_status (PENDING/VERIFIED/   │  │
       │  │            │                    FALSE_CLOSURE)      │  │
       │  │            │ verification_yes / verification_no      │  │
       │  │            └───────────────────────────────────────┘  │
       │  │                                                        │
       │  │     ┌──────────────────────────────────────────┐      │
       │  │     │              Official                     │◄─────┘
       │  │     │──────────────────────────────────────────│
       │  │     │ id (PK)                                  │
       │  │     │ name / role (MLA/COLLECTOR/MP/MINISTRY)  │
       │  │     │ jurisdiction / email / phone             │
       │  │     │ password_hash (bcrypt)                   │
       │  │     │ accountability_score (0-100)             │
       │  │     │ complaints_assigned / resolved           │
       │  │     │ avg_response_time / resolution_rate      │
       │  │     └──────────────────────────────────────────┘
       │  │
       │  │     ┌──────────────────────────────────────────┐
       │  └────►│              Upvote                      │
       │        │──────────────────────────────────────────│
       │        │ id (PK)                                  │
       │        │ complaint_id (FK)                        │
       │        │ citizen_id (FK)                          │
       │        │ filed_at                                 │
       │        └──────────────────────────────────────────┘
       │
       │        ┌──────────────────────────────────────────┐
       └───────►│          VerificationLog                 │
                │──────────────────────────────────────────│
                │ id (PK)                                  │
                │ complaint_id (FK)                        │
                │ citizen_id (FK)                          │
                │ vote (boolean: YES/NO)                   │
                │ voted_at                                 │
                └──────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      EscalationLog                           │
│──────────────────────────────────────────────────────────────│
│ id (PK)                                                      │
│ complaint_id (FK)                                            │
│ from_tier → to_tier                                          │
│ from_official_id (FK) → to_official_id (FK)                  │
│ reason (text: "Deadline exceeded by N days")                 │
│ escalated_at                                                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    DevelopmentProject                        │
│──────────────────────────────────────────────────────────────│
│ id (PK)                                                      │
│ title / category / ward                                      │
│ complaint_count / population_affected                        │
│ star_avg / criticality_max                                   │
│ budget_estimate                                              │
│ scheme_eligible [ MPLADS, Smart City, AMRUT, PMGSY... ]     │
│ ai_recommendation (Gemini-written text)                      │
│ data_evidence { }                                            │
│ rank / approved (boolean)                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: All API Endpoints

```
AUTH
  POST /api/auth/citizen/request-otp    ✅ Request OTP
  POST /api/auth/citizen/verify-otp     ✅ Login + JWT
  POST /api/auth/official/login         ✅ Official login
  POST /api/auth/official/register      ✅ Register official
  GET  /api/auth/citizen/:id            ✅ Get citizen
  PUT  /api/auth/citizen/profile        ✅ Update citizen
  PUT  /api/auth/official/profile       ✅ Update official

COMPLAINTS
  POST /api/complaints                  ✅ File complaint (runs AI + routing)
  GET  /api/complaints                  ✅ List (filterable by ward/status/category)
  GET  /api/complaints/:id              ✅ Get single complaint
  PUT  /api/complaints/:id/status       ✅ Update status
  POST /api/complaints/:id/upvote       ✅ Upvote
  POST /api/complaints/:id/resolve      ✅ Submit resolution
  POST /api/complaints/:id/verify       ✅ Citizen verify (YES/NO)

PROJECTS
  GET  /api/projects                    ⚠️ Returns seeded static data
  POST /api/projects/generate           🔴 AI generation not built
  POST /api/projects/:id/approve        ✅ Approve DPR

MAP / REAL-TIME
  GET  /api/map                         ✅ All complaint pins for map
  WS   /ws/map                          ✅ WebSocket live updates

HEALTH
  GET  /api/health                      ✅ System status check
```

---

*Last updated: August 2026 | Team H2K | VANTA v1.0*
*This document reflects the actual codebase — every flow was traced from source files.*
