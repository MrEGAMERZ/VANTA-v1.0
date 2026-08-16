# SAMADHAN — Complete System Flowcharts
### Microservices Architecture · All Engines · All Workflows
### SIH25031 | Government of Jharkhand | Team H2K

> A comprehensive technical mapping of the SAMADHAN Microservices Architecture, detailing event-driven data flows, AI workflows, and civic governance engines.

## TABLE OF CONTENTS

1. [Full System Architecture (Microservices)](#1-full-system-architecture-microservices)
2. [Authentication Flow](#2-authentication-flow)
3. [Complaint Filing Flow (Microservices Path)](#3-complaint-filing-flow-microservices-path)
4. [AI Engine Flow (LangGraph)](#4-ai-engine-flow-langgraph)
5. [Smart Routing Engine Flow](#5-smart-routing-engine-flow)
6. [Auto-Escalation Engine Flow (RabbitMQ + Notification Service)](#6-auto-escalation-engine-flow-rabbitmq--notification-service)
7. [Anti-False-Closure / Resolution Verification Flow](#7-anti-false-closure--resolution-verification-flow)
8. [Duplicate Detection & Smart Redirect Flow](#8-duplicate-detection--smart-redirect-flow)
9. [5-Citizen Community Verification Flow](#9-5-citizen-community-verification-flow)
10. [Transparency Engine — Contractor Bidding Flow](#10-transparency-engine--contractor-bidding-flow)
11. [Phase-wise Work & Milestone Payment Flow](#11-phase-wise-work--milestone-payment-flow)
12. [Accountability Score Engine Flow](#12-accountability-score-engine-flow)
13. [Citizen Reputation Score Flow](#13-citizen-reputation-score-flow)
14. [WebSocket Real-Time Event Flow](#14-websocket-real-time-event-flow)
15. [Public Ledger Write Flow](#15-public-ledger-write-flow)
16. [Complete Complaint Lifecycle — End to End](#16-complete-complaint-lifecycle--end-to-end)
17. [Frontend Route Map](#17-frontend-route-map)
18. [Database Schema](#18-database-schema)

---

## 1. Full System Architecture (Microservices)

> **Status: ✅ BUILT / ⚠️ PARTIAL** (Transitioning to Microservices)

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CLIENT LAYER (React / React Native)                               ║
║  ┌─────────────────────────────────┐                       ┌──────────────────────────────────────────┐  ║
║  │ Citizen App (Mobile)            │                       │ Official Portal (Web)                    │  ║
║  │ [React Native + Leaflet]        │                       │ [React 19 + Vite + Tailwind + Leaflet]   │  ║
║  └──────────────┬──────────────────┘                       └─────────────────────┬────────────────────┘  ║
╚═════════════════│════════════════════════════════════════════════════════════════│═══════════════════════╝
                  │ HTTPS / WSS                                                    │ HTTPS / WSS
╔═════════════════▼════════════════════════════════════════════════════════════════▼═══════════════════════╗
║                                 EDGE & SECURITY LAYER                                                    ║
║  ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐  ║
║  │                                 API Gateway [Nginx + Proxy]                                        │  ║
║  │                           (Rate Limiting, Routing, SSL Termination)                                │  ║
║  └──────┬──────────────────────┬───────────────────────────────┬──────────────────────────────┬───────┘  ║
╚═════════│══════════════════════│═══════════════════════════════│══════════════════════════════│══════════╝
          │                      │                               │                              │
╔═════════▼══════════════════════▼═══════════════════════════════▼══════════════════════════════▼══════════╗
║                                 CORE SERVICES LAYER (Python + FastAPI)                                   ║
║                                                                                                          ║
║  ┌──────────────────┐   ┌───────────────────────────┐   ┌─────────────────────┐   ┌───────────────────┐  ║
║  │ AUTH SERVICE     │   │ COMPLAINT SERVICE         │   │ TRANSPARENCY SERVICE│   │ NOTIFICATION      │  ║
║  │ [Python/FastAPI] │   │ [Python/FastAPI]          │   │ [Python/FastAPI]    │   │ SERVICE           │  ║
║  │ - JWT Auth       │   │ - Lifecycle Mgmt          │   │ - Tenders/Bids      │   │ [Python/FastAPI]  │  ║
║  │ - Phone OTP      │   │ - Routing Rules           │   │ - Work Orders       │   │ - WebSockets      │  ║
║  │ - UIDAI Verify   │   │ - Resolution Loop         │   │ - AI Collusion      │   │ - SLA Escalation  │  ║
║  └───────┬──────────┘   └────────┬──────────────────┘   └──────────┬──────────┘   └───────┬───────────┘  ║
╚══════════│═══════════════════════│═════════════════════════════════│══════════════════════│══════════════╝
           │                       │                                 │                      │
╔══════════▼═══════════════════════▼═════════════════════════════════▼══════════════════════▼══════════════╗
║                                  DATA & MESSAGING LAYER                                                  ║
║  ┌───────────────┐      ┌─────────────────────────────┐         ┌────────────────┐    ┌───────────────┐  ║
║  │ cache-layer   │      │ Message Queue [RabbitMQ]    │◄───────►│ main-db        │    │ public-ledger-│  ║
║  │ [Redis]       │      │ - AI_ANALYSIS_QUEUE         │         │ [MongoDB]      │    │ db            │  ║
║  │ - Sessions    │      │ - NOTIFICATION_QUEUE        │         │ - Core Data    │    │ [Immutable DB]│  ║
║  │ - Map Data    │      │ - ESCALATION_QUEUE          │         │ - Status       │    │ - Audit Logs  │  ║
║  │ - Rate Limits │      │ - LEDGER_QUEUE              │         │                │    │ - Hashes      │  ║
║  └───────────────┘      └────────┬───────────▲────────┘         └────────────────┘    └───────────────┘  ║
╚══════════════════════════════════│═══════════│═══════════════════════════════════════════════════════════╝
                                   │           │
╔══════════════════════════════════▼═══════════│═══════════════════════════════════════════════════════════╗
║                                  AI/INTELLIGENCE LAYER                                                   ║
║  ┌────────────────────────────────────────────────────────┐       ┌───────────────────────────────────┐  ║
║  │ AI Engine [Python + LangGraph + LangChain]             │       │ Gemini API                        │  ║
║  │ - Workflow Automation                                  │──────►│ [Google Gemini 1.5 Flash]         │  ║
║  │ - Classification, Scoring, Priority Routing            │       │ - Vision (Photos) & Text Analysis │  ║
║  └────────────────────────────────────────────────────────┘       └───────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Authentication Flow

> **Status: ⚠️ PARTIAL**

### 2a. Citizen Phone OTP Flow (Firebase Auth path)
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Citizen App     │       │ API Gateway     │       │ Auth Service    │       │ Firebase Auth   │
│ [React Native]  │──────►│ [Nginx]         │──────►│ [FastAPI]       │──────►│ (External)      │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                                                       │
                                                                             (Sends SMS OTP to user)
                                                                                       │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌────────▼────────┐
│ Citizen App     │       │ API Gateway     │       │ Auth Service    │       │ Firebase Auth   │
│ (Enters OTP)    │──────►│                 │──────►│ (Verify Token)  │◄──────│ (Validates OTP) │
└────────┬────────┘       └─────────────────┘       └────────┬────────┘       └─────────────────┘
         │                                                   │
         │                                      ┌────────────┴────────────┐
         │                                      │ Generate JWT + Set Role │
         │                                      │ (main-db read/write)    │
         │                                      └────────────┬────────────┘
         │                                                   │
         │◄──────────────────────────────────────────────────┘
   (Stores JWT in
   localStorage)
```

### 2b. Aadhaar UIDAI Verification Flow (Trust Upgrade)
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Citizen App     │       │ Auth Service    │       │ UIDAI API       │
│ (Aadhaar Input) │──────►│ [FastAPI]       │──────►│ [External REST] │
└─────────────────┘       └────────┬────────┘       └────────┬────────┘
                                   │                         │
                                   │◄────────────────────────┘
                                   │
                      ┌────────────┴────────────┐
                      │ Upgrade to Level 1      │
                      │ Update main-db          │
                      │ Write to public-ledger  │
                      └─────────────────────────┘
```

### 2c. Official Email Login Flow
```text
┌─────────────────┐       ┌─────────────────┐
│ Official Portal │       │ Auth Service    │
│ (Email/Pass)    │──────►│ [FastAPI]       │
└─────────────────┘       └────────┬────────┘
                                   │
                      ┌────────────┴────────────┐
                      │ Bcrypt Verify Password  │
                      │ Check Role (main-db)    │
                      │ Generate JWT Token      │
                      └────────────┬────────────┘
                                   │
                                   │◄───────────────────
                           (Role-based Redirect)
```

---

## 3. Complaint Filing Flow (Microservices Path)

> **Status: ✅ BUILT (Monolith) / ⚠️ PARTIAL (Microservices)**

```text
┌───────────────┐
│ Citizen App   │ (Input text, photo, location)
└───────┬───────┘
        │ POST /api/complaints
        ▼
┌───────────────┐
│ API Gateway   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Complaint     │ → Writes temporary state to main-db (STATUS: PENDING_AI)
│ Service       │ → Uploads photo to Firebase Storage
└───────┬───────┘
        │ Publishes message: {complaint_id, text, photo_url, loc}
        ▼
┌───────────────┐
│ RabbitMQ      │ [AI_ANALYSIS_QUEUE]
└───────┬───────┘
        │ Consumes message
        ▼
┌───────────────┐
│ AI Engine     │ → Calls Gemini API for Vision & Text classification
│ [LangGraph]   │ → Computes criticality, category, assignment
└───────┬───────┘
        │ Returns structured JSON result
        ▼
┌───────────────┐
│ Complaint     │ → Updates main-db (STATUS: FILED/ASSIGNED)
│ Service       │
└───────┬───────┘
        │ Publishes events
        ├──► [NOTIFICATION_QUEUE] → Notification Service → FCM Push + WS Broadcast
        └──► [LEDGER_QUEUE]       → Public Ledger DB (COMPLAINT_FILED)
```

---

## 4. AI Engine Flow (LangGraph)

> **Status: ⚠️ PARTIAL**

```text
      [INPUT: complaint_text, photo_url, location]
                           │
                           ▼
           ┌────────────────────────────────┐
           │ Node 1: Photo Analysis         │ [Gemini Vision]
           │ (Extract visual evidence)      │
           └───────────────┬────────────────┘
                           │
                           ▼
           ┌────────────────────────────────┐
           │ Node 2: Text Classification    │ [Gemini Text/Embeddings]
           │ (Semantic & Keyword match)     │
           └───────────────┬────────────────┘
                           │
                           ▼
           ┌────────────────────────────────┐
           │ Node 3: Category Assignment    │ (Maps to 10 standard govt categories)
           └───────────────┬────────────────┘
                           │
                           ▼
           ┌────────────────────────────────┐
           │ Node 4: Criticality Scoring    │ (0-100 scale based on rules + AI)
           └───────────────┬────────────────┘
                           │
                           ▼
           ┌────────────────────────────────┐
           │ Node 5: Severity Labeling      │ (ROUTINE to CATASTROPHIC)
           └───────────────┬────────────────┘
                           │
                           ▼
           ┌────────────────────────────────┐
           │ Node 6: Dept Routing Suggestion│ (e.g., PWD, Water Board)
           └───────────────┬────────────────┘
                           │
                           ▼
                 [OUTPUT: STRUCTURED JSON]
                           │
           (Fallback: If Gemini is down, bypass to Local Keyword Classifier)
```

---

## 5. Smart Routing Engine Flow

> **Status: ✅ BUILT (Monolith)**

```text
[AI OUTPUT JSON] ──────► [SMART ROUTING ENGINE (Complaint Service)]
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │ Map Criticality to Tier      │
                      ├──────────────────────────────┤
                      │ CATASTROPHIC (90-100)        │──► MP / Ministry (6h deadline)
                      │ CRITICAL (75-89)             │──► MLA (12h deadline)
                      │ HIGH (60-74)                 │──► Ward Official (48h deadline)
                      │ ELEVATED (40-59)             │──► Ward Official (96h deadline)
                      │ MODERATE (20-39)             │──► Ward Official (7 days)
                      │ ROUTINE (0-19)               │──► Ward Official (14 days)
                      └──────────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │ Map Category to Department   │
                      │ (e.g., Water -> Jal Board)   │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │ Update main-db               │
                      │ assigned_to = official_id    │
                      │ deadline = calculated_time   │
                      └──────────────────────────────┘
```

---

## 6. Auto-Escalation Engine Flow (RabbitMQ + Notification Service)

> **Status: ⚠️ PARTIAL**

```text
┌───────────────────────┐
│ NOTIFICATION SERVICE  │ Runs sweep every 60 seconds
│ [FastAPI + Celery]    │
└──────────┬────────────┘
           │ Consumes
           ▼
┌───────────────────────┐
│ RabbitMQ              │ [ESCALATION_QUEUE] (Contains complaint IDs to check)
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ Check main-db         │ Find overdue complaints (now > deadline)
└──────────┬────────────┘
           │ For each overdue complaint:
           ▼
┌───────────────────────┐
│ Escalation Action     │ 1. get_tier_above() -> Assign to new official
│                       │ 2. Penalty: -15 accountability score for old official
│                       │ 3. Halve new deadline window
└──────────┬────────────┘
           │ Publish events
           ├──► FCM Push & WS Broadcast (to both officials)
           └──► LEDGER_QUEUE → public-ledger-db (ESCALATION event)
```

---

## 7. Anti-False-Closure / Resolution Verification Flow

> **Status: ✅ BUILT (Monolith)**

```text
[Official Portal] ──► Official marks "Resolved" + uploads photo
       │
       ▼
[Complaint Service] ──► Updates main-db: status = PENDING_VERIFICATION
       │
       ▼
[Notification Service] ──► Sends Push + SMS to Citizen (48h window opens)
       │
       ▼
       ├─► [PATH A] Citizen votes YES ──► STATUS: RESOLVED
       │                                  Score: +10 to Official
       │                                  Ledger: write RESOLUTION_VERIFIED
       │
       ├─► [PATH B] Citizen votes NO  ──► STATUS: REOPENED (False Closure flag)
       │                                  Score: -20 to Official
       │                                  Action: Escalate to tier above
       │                                  Ledger: write FALSE_CLOSURE
       │
       └─► [PATH C] No response (48h) ──► STATUS: AUTO_VERIFIED
                                          Score: +3 to Official
                                          Ledger: write AUTO_VERIFIED
```

---

## 8. Duplicate Detection & Smart Redirect Flow

> **Status: 🔴 NEEDS WORK / PLANNED**

```text
Trigger 1: Map Pin Drop (Location)
       │
       ▼
[Complaint Service] ──► Queries main-db: Radius 300m + Same Category + Last 45 days + Unresolved
       │
       ▼
       ├─► [FOUND] Show existing complaint card
       │      │
       │      ├─► User clicks YES (Join) ──► Auto-upvote, +3 Citizen points, Ledger write
       │      └─► User clicks NO (Diff)  ──► Proceed to file, cross-link as related
       │
       └─► [NOT FOUND] Proceed normally

Trigger 2: Real-time Text Similarity
       │
       ▼
[AI Engine] ──► Semantic similarity check against nearby complaints as citizen types
       │
       ▼
       └─► 60%+ Match ──► Show banner: "Is this your issue?"
```

---

## 9. 5-Citizen Community Verification Flow

> **Status: 🔴 PLANNED**

```text
Complaint Filed (by Level 0 or Level 1 Citizen)
       │
       ▼
[Complaint Service] ──► STATUS: PENDING_COMMUNITY_VERIFICATION (Not in official queue yet)
       │
       ▼
[Notification Service] ──► Sends Push to Citizens within 500m radius
       │
       ▼
Citizens verify via App (must pass GPS check within 500m)
       │
       ▼
[Verification Logic] ──► Sums verification weights:
       │                   - Level 0 Citizen = 0.5 points
       │                   - Level 1 Citizen = 1.0 points
       │                   - Level 2 Citizen = 2.0 points
       │
       ├─► Sum >= 5 points ──► STATUS: COMMUNITY_VERIFIED (Enters official queue)
       └─► 48h Timeout     ──► STATUS: LOW_INTEREST
       │
       (Exception: AI scores CATASTROPHIC/CRITICAL bypass this flow)
```

---

## 10. Transparency Engine — Contractor Bidding Flow

> **Status: 🔴 PLANNED**

```text
[Official Portal] ──► Official creates Work Order
       │
       ▼
[Transparency Service] ──► Checks value
       │
       ├─► < ₹10k ──► Skip tender, direct assignment
       │
       └─► ≥ ₹10k ──► Open Tender Process
              │
              ├──► Publish to RabbitMQ [CONTRACTOR_QUEUE]
              ├──► Notifications sent to registered contractors (category + jurisdiction)
              ├──► Contractors submit sealed bids via portal
              │
              ├──► (At Deadline) Bids revealed simultaneously
              ├──► [AI Engine] Runs collusion detection (inflated quotes, same director, etc.)
              │
              ├──► Official views Dashboard (Leaderboard + Selection Score)
              ├──► Official awards contract (Requires justification if not top scorer)
              └──► Writes to main-db (Contract) + public-ledger-db (CONTRACT_AWARDED)
```

---

## 11. Phase-wise Work & Milestone Payment Flow

> **Status: 🔴 PLANNED**

```text
Phases: Mobilisation (10%) ──► Groundwork (25%) ──► Midwork (25%) ──► Complete (30%) ──► Retention (10%)

For each phase:
[Contractor Portal] ──► Marks complete + Uploads GPS-tagged photos
       │
       ▼
[Field Engineer App] ──► On-site verification + Sign-off
       │
       ▼
[Notification Service] ──► Alerts 5 nearby citizens to rate YES/NO
       │
       ▼
       ├─► Majority YES ──► Payment released (main-db) + Ledger write
       │
       └─► Majority NO  ──► Phase rejected, Contractor redos work, Score penalty applies

Retention Phase (10%): Held for 90 days, monitors for re-complaints, then releases.
```

---

## 12. Accountability Score Engine Flow

> **Status: ✅ BUILT (Monolith)**

```text
┌───────────────────────────────┬────────────────┬────────────────────────┐
│ Triggering Event              │ Score Change   │ Source Service         │
├───────────────────────────────┼────────────────┼────────────────────────┤
│ Citizen Verification YES      │ +10 points     │ Complaint Service      │
│ Auto-Verification (No reply)  │ +3 points      │ Complaint Service      │
│ Missed Deadline (Escalation)  │ -10 points     │ Notification Service   │
│ False Closure (Citizen NO)    │ -20 points     │ Complaint Service      │
│ Phase Work Rejected (Civic)   │ -15 points     │ Transparency Service   │
└───────────────────────────────┴────────────────┴────────────────────────┘

Base Score: 100
Star Rating = f(Score)

Visibility Rules:
- Officials see exact score on dashboard.
- Superiors (Tier above) see exact score.
- Public Profile / Citizens see ONLY Star Rating (1-5).
```

---

## 13. Citizen Reputation Score Flow

> **Status: 🔴 PLANNED**

```text
Trust Score dictates User Level.

┌───────────────────────────────┬────────────────┬────────────────────────┐
│ Event                         │ Trust Points   │ Effect                 │
├───────────────────────────────┼────────────────┼────────────────────────┤
│ Valid Complaint (Resolved)    │ +10 points     │ Build Trust            │
│ Accurate Upvote / Verification│ +2 points      │ Build Trust            │
│ Aadhaar Verification          │ +50 points     │ Instant Level 1 Upgrade│
│ False/Spam Complaint          │ -20 points     │ Lose Trust             │
└───────────────────────────────┴────────────────┴────────────────────────┘

Levels:
- Level 0 (Basic): Phone Auth only, strict filing limits, 0.5x verification weight.
- Level 1 (Verified): Aadhaar linked, standard limits, 1.0x verification weight.
- Level 2 (Trusted): High score (>200), increased limits, 2.0x verification weight.
```

---

## 14. WebSocket Real-Time Event Flow

> **Status: ⚠️ PARTIAL**

```text
[API Gateway] ──► Maintains WSS connections with Clients

[Notification Service] ──► Publishes events via Pub/Sub (Redis/RabbitMQ) to Gateway

┌────────────────────────┬─────────────────────────────────────────┬──────────────────────┐
│ Event Type             │ Payload/Action                          │ Recipients           │
├────────────────────────┼─────────────────────────────────────────┼──────────────────────┤
│ NEW_COMPLAINT          │ {lat, lng, cat} -> Map pin appears      │ Officials in Ward    │
│ STATUS_CHANGE          │ {id, status} -> Pin color changes       │ Subscribed Clients   │
│ ESCALATION             │ {msg} -> Push + Badge update            │ Target Officials     │
│ VERIFICATION_NEEDED    │ {id} -> Citizen alert modal             │ Specific Citizen     │
│ SCORE_UPDATE           │ {new_score} -> Live dashboard update    │ Specific Official    │
│ CONTRACTOR_BID         │ {bid_info} -> Bid dashboard updates     │ Transparency Admin   │
└────────────────────────┴─────────────────────────────────────────┴──────────────────────┘
```

---

## 15. Public Ledger Write Flow

> **Status: 🔴 PLANNED**

```text
Triggering Event (Auth, Complaint, Transparency Services)
       │
       ▼
Publish to RabbitMQ [LEDGER_QUEUE]
       │
       ▼
[Ledger Consumer Service] (Dedicated Microservice)
       │
       ▼
Write to [public-ledger-db] (Append-Only MongoDB Collection / Blockchain)
       │
       ├──► Payload: { timestamp, event_type, data, previous_hash }
       ├──► Current Hash: SHA-256(previous_hash + current_data)
       └──► Stores Hash with entry
       │
       ▼
Read Requests verify chain integrity by recalculating hashes.

Event Types: COMPLAINT_FILED, ASSIGNED, STATUS_CHANGE, PAYMENT_RELEASED,
             ESCALATION, FALSE_CLOSURE, CONTRACT_AWARDED, RESOLUTION_VERIFIED
```

---

## 16. Complete Complaint Lifecycle — End to End

> **Status: ✅ BUILT (Monolith)**

```text
                [FILED] ──────────────────┐ (Duplicate detected)
                   │                      ▼
                   │               [DUPLICATE_REDIRECT]
                   ▼
  [PENDING_COMMUNITY_VERIFICATION] ───────┐ (Rejected by AI/Spam)
                   │                      ▼
                   │                  [REJECTED]
                   ▼
         [COMMUNITY_VERIFIED]
                   │
                   ▼
              [ASSIGNED] ◄────────────────┐
                   │                      │
                   ▼                      │ (Deadline missed)
            [ACKNOWLEDGED]                │
                   │                      │
                   ▼                      │
            [IN_PROGRESS]                 │
                   │                      │
                   ▼                      │
        [PENDING_VERIFICATION]            │
                   │                      │
             ┌─────┴─────┐                │
             │           │                │
          (YES)         (NO) ─────────────┘
             │           │ (False Closure)
             ▼           ▼
         [RESOLVED]  [REOPENED]
             │
         (48h no reply)
             │
             ▼
      [AUTO_VERIFIED]
```

---

## 17. Frontend Route Map

> **Status: ✅ BUILT / ⚠️ PARTIAL**

```text
CITIZEN APP (React Native / Web)
  /login/citizen             ✅ BUILT
  /citizen/home              ⚠️ PARTIAL
  /citizen/file-report       ✅ BUILT
  /citizen/issues            ✅ BUILT
  /citizen/profile           📋 PLANNED

OFFICIAL PORTAL (React 19)
  /login/official            ✅ BUILT
  /official/dashboard        ✅ BUILT (Collector / Ward)
  /official/complaint/:id    ✅ BUILT
  /official/tenders          📋 PLANNED

MLA/MP PORTALS
  /mla/dashboard             ✅ BUILT
  /mp/dashboard              ✅ BUILT
  /mp/overview               ⚠️ PARTIAL
```

---

## 18. Database Schema

> **Status: ⚠️ PARTIAL (Migrating to Microservices)**

```text
[main-db] (MongoDB)
  - citizens
      { _id, phone, aadhaar_hash, trust_score, level, location }
  - officials
      { _id, email, pass_hash, role, ward/jurisdiction, accountability_score }
  - complaints
      { _id, text, photo_url, citizen_id, official_id, status, criticality, deadline }
  - upvotes
      { _id, complaint_id, citizen_id }
  - work_orders
      { _id, complaint_id, official_id, value, status }
  - tenders / contractors / contractor_bids
      { _id, related_ids, amounts, ai_flags, status }
  - verifications
      { _id, complaint_id, citizen_id, vote, type(resolution|community) }

[public-ledger-db] (Separate Immutable DB)
  - ledger_entries
      { _id, timestamp, event_type, service_source, payload, prev_hash, curr_hash }

[cache-layer] (Redis)
  - Sessions (JWT blocklists)
  - Rate Limiting counters
  - Map clustered points (TTL: 5 mins)
```

---
*Last updated: August 2026 | Team H2K | SIH25031*
