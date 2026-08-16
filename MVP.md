# SAMADHAN — MVP Build Plan
## SIH25031 · Government of Jharkhand · Team H2K

> **One goal: Win the competition.** This document defines exactly what to build, in what order, to have a working, impressive demo of SAMADHAN. Nothing more. Nothing less.

---

## THE ONE-LINE PITCH

> *"In every other civic app, an official decides when a complaint is resolved. In SAMADHAN, only the citizen can close their own ticket — and if officials ignore it, the system automatically escalates to their boss."*

That is what makes us different. Everything in this MVP exists to demonstrate that sentence.

---

## SECTION 1 — What We Are Solving

**Problem Statement SIH25031:** Build a crowdsourced civic issue reporting and resolution system.

**The real problem inside that PS:**
India has had dozens of civic apps. All of them fail the same way — complaints get marked "Resolved" by officials without the problem actually being fixed. Citizens have no power. Officials face no consequences.

**SAMADHAN's answer — three things no existing system does:**

```
1. CITIZEN CONTROLS RESOLUTION
   An official submits a resolution → ticket goes to
   PENDING VERIFICATION → citizen votes YES or NO.
   Only a YES from the citizen closes the ticket.
   A NO reopens it, penalises the official, and escalates.

2. AUTO-ESCALATION WITH CONSEQUENCES
   Every complaint has a deadline.
   Deadline missed → complaint goes to official's boss.
   Boss misses deadline → goes to their boss.
   Every miss = accountability score penalty, publicly visible.
   No one can hide by ignoring.

3. AI DOES THE ROUTING — NOT HUMANS
   Citizen files. AI reads, classifies, scores severity,
   and routes to the correct official automatically.
   Officials cannot claim "I never received it."
```

---

## SECTION 2 — MVP Scope

### IN SCOPE — Build This for SIH

| Feature | Why It's In |
|---------|-------------|
| Citizen complaint filing (text + photo + voice) | Core feature |
| AI classification + severity scoring | Engine 1 — differentiator |
| Auto-routing to correct official | Engine 2 — differentiator |
| Official dashboard + complaint management | Officials need a functional interface |
| Auto-escalation with deadline tracking | Engine 3 — the biggest differentiator |
| Citizen YES/NO verification on resolution | Engine 4 — anti-false-closure proof |
| Accountability score on official profile | Engine 5 — public consequence mechanism |
| Live complaint map (Constituency view) | Visual impact for demo |
| MLA dashboard | Tier 2 official |
| MP dashboard (scoreboard of MLAs) | Tier 3 official |
| Real-time WebSocket updates | Map updates live |
| Role-based login (Citizen OTP / Official email) | Authentication |
| Basic analytics dashboard | Judges love charts |

### OUT OF SCOPE — Do Not Build for SIH

| Feature | Why It's Out | When |
|---------|-------------|------|
| Contractor portal | Not in core PS | Phase 2 |
| Phase-wise payments | Requires contractor portal | Phase 2 |
| 3-quote bidding system | Requires contractor portal | Phase 2 |
| Aadhaar verification | Regulatory approval needed | Phase 2 |
| 5-person GPS community verification | Simplify to upvote threshold for MVP | Phase 2 |
| AI cost estimation at filing | Only contractors know costs accurately | Year 2 |
| Full DPR auto-generation | Mention in pitch, don't demo | Partial |
| Android APK | PWA / web is sufficient for demo | Phase 3 |
| White-label licensing | Not relevant for SIH | Year 2 |

---

## SECTION 3 — MVP User Roles (Simplified)

Three roles. That is it.

```
CITIZEN (Tier 0)
  Login: Phone number + OTP (Firebase Auth)
  Can: File complaints, upvote, verify resolutions, track status
  Cannot: Change status, assign officials

WARD OFFICIAL / LOCAL BODY (Tier 1)
  Login: Email + Password
  Sees: Complaints assigned to them
  Can: Update status, mark resolved, view map

MLA (Tier 2)
  Login: Email + Password
  Sees: All complaints in constituency + escalated
  Can: Take over escalated complaints, view MLA dashboard

MP (Tier 3)
  Login: Email + Password
  Sees: All MLAs' performance, constituency overview
  Can: View scoreboard, see critical escalations
```

For SIH demo: Pre-create 3-4 test accounts per role. Show the full escalation chain live.

---

## SECTION 4 — The 5 Engines

These are the non-negotiable technical pieces. Everything else is UI around them.

---

### ENGINE 1 — AI Classification (Gemini 2.0 Flash)

When a citizen files, AI reads text and photo and assigns category, sub-category, criticality score (0-100), severity label.

```
Input:  complaint text + photo + location
Output: {
  category: "ELECTRICAL",
  subcategory: "Fallen electricity pole",
  criticality_score: 87,
  severity: "CRITICAL",
  suggested_department: "JBVNL"
}
```

Fallback: If Gemini is unavailable → keyword-based local classifier (already in codebase). System never goes down.

---

### ENGINE 2 — Smart Routing Engine

Takes AI output and assigns to correct official with deadline:

```
CATASTROPHIC (90-100) → MP directly         6 hours
CRITICAL     (75-89)  → MLA directly        12 hours
HIGH         (60-74)  → Ward Official       48 hours
ELEVATED     (40-59)  → Ward Official       96 hours
MODERATE     (20-39)  → Ward Official       7 days
ROUTINE      (0-19)   → Ward Official       14 days

Category → Department:
  ROADS       → PWD / Ward Engineering
  ELECTRICAL  → JBVNL / Ward Electrical JE
  WATER       → Jal Shakti / Ward Water JE
  SANITATION  → Municipal Sanitation Inspector
```

---

### ENGINE 3 — Auto-Escalation Engine

Background process runs every 60 seconds. Checks deadlines. Escalates automatically.

```python
async def escalation_sweep():
    while True:
        overdue = find_overdue_complaints()
        for complaint in overdue:
            new_official = get_tier_above(complaint.assigned_to)
            update_score(complaint.assigned_to, -15)
            reassign(complaint, new_official, halved_deadline)
            notify_clients(ESCALATION_EVENT)
        await asyncio.sleep(60)
```

For demo: Use 1-minute artificial deadlines to show escalation live.

---

### ENGINE 4 — Anti-False-Closure Engine (The Unique One)

```
Official clicks "Mark Resolved" + uploads photo
         ↓
Status → PENDING_VERIFICATION  (NOT resolved yet)
Citizen gets: push notification + SMS
"Was your problem fixed? [YES] [NO]"
48-hour window
         ↓
YES → RESOLVED. Official +10 score.
NO  → REOPENED. Official -20 score. Escalated to boss.
No response in 48h → AUTO-VERIFIED. Official +3 score.
```

This one mechanic is why SAMADHAN is different from every other civic app in India.

---

### ENGINE 5 — Accountability Score Engine

```
Score events:
  +10  Resolved before deadline (citizen YES)
  +5   Resolved after deadline (citizen YES)
  +3   Auto-verified (no response)
  -10  Missed deadline → escalation triggered
  -15  Missed deadline on escalated complaint
  -20  False closure (citizen voted NO)

Score → Stars:
  90-100 → 5 stars
  75-89  → 4 stars
  60-74  → 3 stars
  40-59  → 2 stars
  0-39   → 1 star

Visible on: official profile, MP scoreboard, MLA scoreboard
```

---

## SECTION 5 — Screen-by-Screen Features

### CITIZEN PORTAL (5 screens)

```
1. LOGIN
   Phone number → OTP → Home

2. HOME
   My open complaints count
   Recent complaints in my ward (feed)
   BIG BUTTON: "REPORT A PROBLEM"

3. FILE REPORT
   Microphone (voice) + Camera (photo) + Text (fallback)
   Map pin (auto GPS, adjustable)
   AI auto-fills category and severity
   Preview → SUBMIT → Complaint number shown

4. MY ISSUES
   List with colour status indicators (red/yellow/green)
   If PENDING_VERIFICATION: show [YES - FIXED] and [NO - STILL BROKEN]
   prominently at top of that complaint

5. COMPLAINT DETAIL
   Timeline of all status changes
   Assigned official name + score
   Photos (filed + resolution)
   Escalation history
   Upvote button + count
```

### OFFICIAL PORTAL — WARD LEVEL (4 screens)

```
1. DASHBOARD
   4 stat cards: Total / Pending / Critical / Overdue
   Complaint queue sorted by deadline (overdue at top in red)
   My accountability score (star rating)

2. COMPLAINT DETAIL
   Citizen photo + description + AI analysis
   Status controls: [ACKNOWLEDGE] [IN PROGRESS] [MARK RESOLVED]
   Resolve: upload photo → triggers citizen verification

3. CONSTITUENCY MAP
   Leaflet map with live complaint pins
   Colour: red = open, yellow = in progress, green = resolved
   Click pin → complaint card

4. ESCALATIONS
   Complaints escalated TO me
   My complaints approaching deadline
   Already-overdue (red highlight)
```

### MLA DASHBOARD (2 screens)

```
1. OVERVIEW
   Constituency-wide stats
   Ward performance comparison
   Accountability scores of all ward officials under this MLA
   Escalated complaints needing action

2. MAP
   Full constituency view
   Ward-level health colour coding
```

### MP DASHBOARD (2 screens)

```
1. OVERVIEW
   All constituencies overview
   MLA scoreboard (ranked by score)
   Critical complaints across all MLA areas

2. MLA SCOREBOARD
   Table: MLA name, score, resolved count, false closures, avg time
   Sort by any column
```

---

## SECTION 6 — Tech Stack

```
FRONTEND:    React 19 + Vite (existing — no changes)
STYLING:     Vanilla CSS dark theme (existing)
MAP:         Leaflet + React-Leaflet (existing)

BACKEND:     FastAPI + Python (existing)
DATABASE:    MongoDB Atlas (existing)
AI:          Gemini 2.0 Flash API (existing)
REALTIME:    WebSockets (existing in main.py)

NEW ADDITIONS:
AUTH:        Firebase Phone Auth (replaces custom OTP)
STORAGE:     Firebase Storage (complaint photos)
NOTIF:       Firebase Cloud Messaging (push notifications)

HOSTING:
  Frontend:  Firebase Hosting
  Backend:   Google Cloud Run (Docker container)
```

No new frameworks. No rewrites. The codebase is 70% there already.

---

## SECTION 7 — What Is Built vs What to Fix

### ALREADY BUILT

Backend:
- FastAPI server, MongoDB, all route files
- AI engine (Gemini + local fallback)
- Routing engine, escalation engine, resolution engine
- WebSocket broadcast manager
- Accountability score calculation

Frontend:
- All page components created
- Role-based layouts (Citizen, MLA, MP, Official)
- LiveMap component (Leaflet)
- Notification bell (WebSocket listener)
- API service layer (api.js)

### NEEDS FIXING (in order)

```
CRITICAL BUGS — Fix first or nothing works:
  BUG-01  Remove sqlalchemy imports from escalation.py + routing.py
  BUG-02  Add load_dotenv() to backend/main.py
  BUG-03  Call notify_clients() in complaints.py after status changes
  BUG-04  Apply AuthGuard to all protected routes in App.jsx

WIRING WORK — Components exist, just not connected:
  FEAT-01  Wire LiveMap into Constituency.jsx
  FEAT-02  Connect Voice-to-Text in CitizenReport.jsx
  FEAT-03  Replace mock data in CitizenHome.jsx with real API
  FEAT-04  Wire YES/NO verification buttons to resolution API
  FEAT-05  Replace mock data in Escalations.jsx
  FEAT-06  Replace mock data in Analytics.jsx
  FEAT-07  Wire photo upload (Firebase Storage)
  FEAT-08  Replace custom OTP with Firebase Auth
```

---

## SECTION 8 — Build Order (3 Weeks)

### WEEK 1 — Make It Work

```
Day 1-2: Fix 4 critical bugs (2-3 hours total)
Day 3-4: Wire citizen YES/NO verification end-to-end
Day 5-7: Replace all mock data with real API calls
```

### WEEK 2 — Make It Impressive

```
Day 8-9:   Wire LiveMap with WebSocket real-time pins
Day 10-11: Firebase Auth (replace OTP)
Day 12-13: Firebase Storage (photo upload)
Day 14:    Full end-to-end test of the complete demo flow
```

### WEEK 3 — Make It Demo-Ready

```
Day 15-16: Mobile responsive (test on 375px)
Day 17-18: Deploy (Cloud Run backend + Firebase Hosting frontend)
Day 19-20: Seed realistic demo data, polish rough edges
Day 21:    Demo rehearsal — run it 10 times, time each section
```

---

## SECTION 9 — The Demo Script (4 Minutes)

Practice until it takes exactly 4 minutes.

```
0:00 – 0:30  THE PROBLEM
"India has 640,000 villages. Every day, millions of civic
complaints go nowhere. Officials mark them resolved.
The problem stays. The citizen has no power.
SAMADHAN changes that. Let me show you."

0:30 – 1:30  CITIZEN FILES (live on phone/browser)
→ Open SAMADHAN, tap Report Problem
→ Use voice input, speak complaint in Hindi
→ AI auto-classifies: category, severity shown
→ Submit → "Complaint filed. Watch what happens."

1:30 – 2:30  OFFICIAL RECEIVES IT (switch account)
→ Official dashboard — new complaint appears live (WebSocket)
→ Map pin appears in real-time
→ Official marks resolved, uploads photo
→ Status → PENDING VERIFICATION
→ "Notice — it says PENDING VERIFICATION, not RESOLVED."

2:30 – 3:00  CITIZEN SAYS NO (switch back to citizen)
→ Citizen gets notification: "Was it fixed?"
→ Citizen taps NO — STILL BROKEN
→ Status reopens RED
→ Official score drops live on screen
→ "This is what SAMADHAN does that nothing else does."

3:00 – 3:30  ESCALATION (the wow moment)
→ Show pre-set overdue complaint
→ Watch escalation happen — moves to MLA live
→ MLA dashboard shows the escalated complaint
→ "Automatic. No human triggers this.
   The system escalates. No one can hide."

3:30 – 4:00  MP SCOREBOARD (close strong)
→ MP dashboard → MLA scoreboard
→ Performance visible, publicly, for every official
→ "For the first time, every official's performance
   is visible to the person above them.
   SAMADHAN. No escape. No corruption. Only accountability."
```

---

## SECTION 10 — Judge Q&A

**"How is this different from CPGRAMS?"**
CPGRAMS lets officials mark complaints resolved. Citizens cannot verify. SAMADHAN makes citizen verification the only way to close a ticket. CPGRAMS has 97% disposal rate. Real resolution rate is far lower. In SAMADHAN, disposal rate = actual resolution rate. They're the same event.

**"What if the citizen never responds?"**
After 48 hours, the ticket auto-verifies and gives the official credit. Benefit of the doubt. But the window for false closure is eliminated — officials cannot close it themselves.

**"What about rural users with no internet?"**
Voice input works on slow connections. Complaint data is tiny in size. Offline filing syncs when connected. SMS fallback for notifications. Hindi interface removes the literacy barrier.

**"What's your go-to-market?"**
Win SIH. Government of Jharkhand is the problem setter — they become our first pilot. Free 6-month pilot → paid SaaS license → expand to 24 districts → pitch other states. Jharkhand alone = ₹2.4 crore ARR.

**"How do you prevent officials from gaming the system?"**
The citizen controls resolution. Officials cannot. Escalation is automated — no human triggers it. The accountability score is calculated by the system. The algorithm is published publicly. No black box. No override.

---

## SECTION 11 — The 3 Things That Win

```
1. THE DEMO WORKS LIVE, END-TO-END
   File complaint → AI routes → official sees it live →
   Resolution → citizen verification → escalation.
   No mock data. Real system. Real-time.

2. THE PROBLEM IS SOLVED, NOT JUST DESCRIBED
   Every civic app describes the problem well.
   SAMADHAN demonstrates the solution mechanically.
   Show the NO button. Show the score drop. Show escalation.
   Make judges feel the accountability, not just hear about it.

3. THE TEAM KNOWS THE SCOPE
   Research document proves depth of thinking.
   MVP document proves discipline and execution.
   Roadmap proves you know what comes next.
   Answer every question specifically, not vaguely.
```

---

*SAMADHAN MVP Build Plan | August 2026 | Team H2K*
*SIH25031 — Government of Jharkhand*
*"No escape. No corruption. Only accountability."*
