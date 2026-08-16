# 🛡️ SAMADHAN — Governance Intelligence Platform
### Smart India Hackathon 2025 | PS: SIH25031 | Org: Government of Jharkhand
> **Theme:** Clean & Green Technology | **Category:** Software

---

## 📌 Problem Statement (SIH25031)

**Crowdsourced Civic Issue Reporting and Resolution System**

Citizens in India face significant challenges in reporting and tracking the resolution of local civic issues (pothole roads, broken streetlights, garbage dumps, waterlogging, sanitation failures). Existing grievance systems are opaque, slow, and lack accountability. There is no closed-loop feedback mechanism to confirm that issues are actually resolved — leading to rampant false closures and systemic neglect.

**The Government of Jharkhand** seeks a tech-enabled platform that:
- Enables citizens to **report** issues easily (voice, text, multilingual)
- **Routes** complaints intelligently to the right official
- **Escalates** automatically when deadlines are breached
- Holds officials **accountable** with quantifiable performance metrics
- **Closes the loop** with citizen verification of resolutions

---

## 🚀 What is SAMADHAN?

**SAMADHAN** (Vigilance And Accountability Network for Transparent Administration) is an **AI-powered civic governance intelligence platform** that connects citizens, ward-level officials (MLAs), District Collectors, and Members of Parliament in a **tiered, self-escalating accountability loop**.

It transforms the broken grievance system into a **real-time, AI-triaged, citizen-verified** pipeline where every complaint is tracked, every deadline is enforced, and every official is scored.

### The Core Loop

```
🧑 CITIZEN
   │  Reports via voice/text (any language)
   ▼
🤖 GEMINI AI ENGINE
   │  Categorizes complaint → Assigns criticality score (0–100)
   │  Determines severity tier (1–6 levels)
   ▼
📋 COMPLAINT CREATED
   │  Auto-routed to responsible official
   ▼
Tier 1: MLA (Ward-level)       ← 72h deadline window
Tier 2: Collector              ← 48h deadline window   ← Auto-escalation on breach
Tier 3: MP (Constituency)      ← 24h deadline window
Tier 4: Ministry (National)    ← 12h deadline window
   │
   ▼
📸 RESOLUTION SUBMITTED (with photo evidence)
   │
   ▼
🧑 CITIZEN VERIFIES
   ├─ YES → Complaint RESOLVED → Official score increases
   └─ NO  → FALSE CLOSURE → Complaint REOPENS → Official score decreases + penalty
```

---

## 🏗️ Architecture Overview

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | Single Page Application |
| Routing | React Router v7 | Client-side navigation + AuthGuard |
| Maps | Leaflet + React-Leaflet | Interactive complaint location maps |
| Styling | Pure CSS3 + CSS Variables | Dark, premium cyber-governance theme |
| Fonts | Inter, Space Grotesk, Space Mono | Dashboard typography system |
| Backend | Python + FastAPI | REST API + WebSocket server |
| Database | MongoDB (custom PyMongo ORM) | Complaint, user, and project data |
| AI Engine | Google Gemini API | Complaint classification + DPR generation |
| Real-Time | WebSockets | Live map updates + instant notifications |
| Auth | JWT Tokens + OTP / Password | Role-based access control |
| Deployment | Docker (multi-stage) | Containerized frontend + backend |

---

## 👥 User Roles and Portals

### Citizen Portal
- Login: Phone number + OTP (no passwords to remember)
- File Report: Voice-to-text → AI categorizes instantly
- My Issues: Track all complaints with live status + AI diagnostic
- Verify Resolution: Accept or reject official closure claims
- Analytics: Personal impact metrics, reward points, ward-level comparison
- Profile: Name, ward, district, geotagged home location

### MLA / Collector Portal (Official)
- Login: Email + Password with role-based access
- Dashboard: Command center — total issues, resolved, pending, critical queue
- Constituency Map: Leaflet live map with color-coded complaint pins
- Complaint Detail: Full ticket — AI diagnostic, citizen profile, photo evidence, action buttons
- Escalations: Auto-escalated complaints with breach timeline
- Analytics: AI-recommended Development Project Reports (DPRs) from complaint clusters
- Profile: Performance telemetry and accountability score

### MP Portal
- Overview: Constituency-wide aggregate telemetry
- Priority Ranker: AI-ranked projects for budget allocation
- MLA Scoreboard: Real-time accountability rankings for all MLAs

---

## 🤖 AI Features (Powered by Google Gemini)

| Feature | How It Works |
|---------|-------------|
| Complaint Classification | Gemini reads voice/text input → assigns category (roads, sanitation, water, electricity, etc.) |
| Criticality Scoring | 0–100 score based on urgency, location density, historical data → maps to 6 severity tiers |
| Smart Routing | AI determines which department/official tier receives the complaint first |
| DPR Generation | Clusters similar complaints geographically → AI writes Development Project Report for MPs |
| Local Fallback | Keyword-based rules engine activates if Gemini is unavailable — no single point of failure |

---

## ⭐ Unique Innovations (SIH Differentiators)

### 1. Citizen Verification Loop (Anti-False-Closure)
Officials cannot mark complaints resolved without submitting photo evidence AND having the citizen vote YES/NO on the resolution. A NO vote reopens the complaint and penalizes the official's accountability score.

### 2. Auto-Escalation Engine
Scheduled background sweeps check all complaints for deadline breaches. No manual intervention needed — every complaint automatically climbs the accountability chain until resolved.

### 3. Star Priority System
Dynamic 1–5 star rating = AI criticality score + community upvotes + time-elapsed. Officials see what matters most, not just the first-in-first-out queue.

### 4. Accountability Score
Live performance scores for every official:
- Points gained for on-time resolution
- Points lost for false closures, missed deadlines, and escalations
- MP Scoreboard creates healthy inter-MLA competition driven by data

### 5. Real-Time Live Map
WebSocket-powered Leaflet map: new complaints appear on all officials' screens instantly, no page refresh needed. Color-coded pins (red = critical → green = resolved).

---

## 📁 Project Structure

```
SAMADHAN-v1.0/
├── backend/
│   ├── main.py              # FastAPI app + WebSocket manager
│   ├── database.py          # Custom PyMongo ORM adapter
│   ├── requirements.txt     # Python dependencies
│   ├── seed_data.py         # Demo database seeder
│   ├── auth/                # JWT handler
│   ├── models/              # MongoDB document models
│   ├── routes/
│   │   ├── auth.py          # Citizen OTP + Official login
│   │   ├── complaints.py    # CRUD + upvote + status updates
│   │   ├── resolution.py    # Submit resolution + citizen verify
│   │   └── officials.py     # Official management
│   ├── schemas/             # Pydantic request/response schemas
│   └── services/
│       ├── escalation.py    # Auto-escalation deadline sweep
│       ├── routing.py       # Intelligent complaint routing
│       └── gemini_service.py# Gemini AI integration
│
├── src/
│   ├── App.jsx              # Root component + all routes
│   ├── index.css            # Global CSS variables + base styles
│   ├── components/
│   │   ├── *Layout.jsx      # Role-specific sidebars and navbars
│   │   ├── NotificationBell.jsx   # WebSocket real-time alerts
│   │   ├── Toast.jsx              # Global toast notification system
│   │   └── map/LiveMap.jsx        # Leaflet map with WebSocket sync
│   ├── pages/
│   │   ├── Portal.jsx             # Public landing page
│   │   ├── CitizenHome.jsx        # Citizen dashboard
│   │   ├── CitizenReport.jsx      # Voice-to-text complaint filing
│   │   ├── CitizenIssues.jsx      # My complaints + verification buttons
│   │   ├── CitizenAnalytics.jsx   # Personal metrics
│   │   ├── OfficialDashboard.jsx  # Official command center
│   │   ├── Constituency.jsx       # Live Leaflet map view
│   │   ├── Escalations.jsx        # Escalated complaints view
│   │   ├── Analytics.jsx          # AI-recommended DPRs
│   │   ├── ComplaintDetail.jsx    # Full complaint deep-dive
│   │   ├── MlaDashboard.jsx       # MLA-specific dashboard
│   │   ├── MpDashboard.jsx        # MP-specific dashboard
│   │   ├── MpPriorityRanker.jsx   # AI project priority ranking
│   │   └── MpMlaScoreboard.jsx    # MLA accountability league table
│   └── services/
│       ├── api.js                 # Centralized API calls + authFetch
│       └── authGuard.jsx          # Role-based route protection
│
├── Dockerfile               # Multi-stage: build frontend, serve via FastAPI
├── .env.example             # Environment variable template
└── vite.config.js           # Vite build configuration
```

---

## 🔄 Current Development Status

### Working — Core Engine is Live
- MongoDB backend with custom ORM adapter
- Citizen OTP login + Official email/password login
- Gemini AI complaint analysis with keyword fallback
- Auto-routing based on complaint criticality
- Full complaint CRUD (create, read, filter, update status, upvote)
- Resolution submission and citizen YES/NO verification
- Auto-escalation deadline sweep engine
- Official dashboard with real API data
- MLA Dashboard, MP Overview, MLA Scoreboard (all live data)
- Complaint detail view (AI diagnostic, citizen profile, evidence, actions)
- WebSocket infrastructure built in main.py
- Docker multi-stage build

### Needs Wiring
- Constituency.jsx has LiveMap built but uses static CSS map
- CitizenHome.jsx shows placeholder — needs real stats from API
- CitizenAnalytics.jsx shows placeholder — needs personal metrics endpoint

### Must Fix Before Demo
- escalation.py and routing.py import sqlalchemy — will CRASH with MongoDB
- main.py never calls load_dotenv() — Gemini API key is never loaded from .env
- WebSocket broadcast not triggered after complaint creation — no real-time updates firing
- Several pages still use mockComplaints.js hardcoded data
- No auth guards — any URL is publicly accessible by direct navigation
- No mobile responsive breakpoints

---

## 🏆 SIH Winning Strategy

### The 60-Second Demo Script
```
1.  Login as Citizen via OTP
2.  File complaint via voice: "Broken water pipe on MG Road, Ranchi"
3.  AI classifies: WATER | Criticality Score: 72/100 | 4-star priority
4.  Switch tab → Login as MLA official
5.  Complaint appears as live pin on constituency map (WebSocket magic!)
6.  MLA clicks pin → full AI diagnostic + citizen photo evidence
7.  MLA marks IN_PROGRESS → citizen dashboard updates instantly
8.  MLA submits resolution + photo
9.  Citizen votes YES → RESOLVED → MLA accountability score increases
10. Switch to MP portal → MLA scoreboard + AI DPR for the water pipe zone
```

### What Sets SAMADHAN Apart

| SIH Criterion | SAMADHAN's Answer |
|---------------|----------------|
| Problem-Solution Fit | Directly solves every requirement of SIH25031 end-to-end |
| Technical Depth | Gemini does real work: categorization, criticality scoring, DPR writing |
| Innovation | Anti-false-closure loop + auto-escalation chain is genuinely novel |
| Scalability | MongoDB + Docker + WebSockets = constituency-agnostic architecture |
| Live Demo | Stable end-to-end flow testable in under 60 seconds |

---

## ⚙️ Quick Start

### Backend
```bash
cd backend
cp ../.env.example .env   # Add GEMINI_API_KEY + MONGODB_URL + JWT_SECRET
pip install -r requirements.txt
python main.py            # Runs at http://localhost:8000
```

### Frontend
```bash
# From project root
npm install
npm run dev               # Runs at http://localhost:5173
```

### Docker (Production)
```bash
docker build -t samadhan .
docker run -p 8000:8000 --env-file backend/.env samadhan
```

---

## 🔑 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| GEMINI_API_KEY | Google Gemini API for AI features | Yes |
| MONGODB_URL | MongoDB connection string (local or Atlas) | Yes |
| JWT_SECRET | JWT token signing key | Yes |
| VITE_API_URL | Backend URL override for production frontend | Optional |

---

## 👨‍💻 Team

**Team Name:** H2K  
**Hackathon:** Smart India Hackathon 2025  
**PS Number:** SIH25031  
**Organization:** Government of Jharkhand  
**Theme:** Clean & Green Technology | **Category:** Software  

---

*Built with passion by Team H2K for SIH 2025 — for every citizen who deserves to be heard.*
