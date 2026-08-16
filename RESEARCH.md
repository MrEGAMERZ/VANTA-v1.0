# SAMADHAN — Research & Design Document
## Crowdsourced Civic Issue Reporting and Resolution System
### SIH25031 | Government of Jharkhand | Team H2K

> A living research brief for the entire team. It covers who uses SAMADHAN and why, what is already built, what still needs to be built, and a deep analysis of why every system before ours has failed — and exactly how SAMADHAN is designed to solve those failures.

## TABLE OF CONTENTS

---

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement — SIH25031 Alignment](#2-problem-statement--sih25031-alignment)
3. [What SAMADHAN Handles — Problem Category Taxonomy](#3-what-samadhan-handles--problem-category-taxonomy)
4. [Why Existing Systems Have Failed — Research](#4-why-existing-systems-have-failed--research)
5. [Who Uses SAMADHAN — Complete Government Hierarchy](#5-who-uses-samadhan--complete-government-hierarchy)
6. [Citizen Identity & Trust System](#6-citizen-identity--trust-system)
7. [Complaint Filing & Authenticity Engine](#7-complaint-filing--authenticity-engine)
8. [Citizen Reputation Score](#8-citizen-reputation-score)
9. [Core System Architecture — How SAMADHAN Works](#9-core-system-architecture--how-samadhan-works)
10. [Transparency Engine — Procurement & Contractor Accountability](#10-transparency-engine--procurement--contractor-accountability)
11. [What Makes SAMADHAN Unique](#11-what-makes-samadhan-unique)
12. [Revenue Model](#12-revenue-model)
13. [Current Build Status](#13-current-build-status)
14. [Open Design Questions](#14-open-design-questions)

---

## 1. Executive Summary

SAMADHAN is an accountability operating system for civic governance that transforms a passive grievance portal into an action-oriented workflow. 

**In every other system an official decides when a complaint is resolved. In SAMADHAN only the citizen can.**

3 Core Innovations:
1. **The 5-Citizen Community Verification System:** Replaces manual official validation by requiring five GPS-verified citizens to confirm an issue exists before it enters the official's queue.
2. **Citizen-Triggered Resolution:** A ticket cannot be closed unless the citizen who reported it casts a "YES" vote on the resolution evidence, completely preventing fake administrative closures.
3. **The Transparency Engine:** A fully integrated public procurement ledger that tracks contractor bids, phase-wise payments, and milestone completions publicly for every resolved complaint.

**SIH Alignment Statement:** SAMADHAN directly solves the SIH25031 problem statement by providing a comprehensive "Crowdsourced Civic Issue Reporting and Resolution System" that is scalable, transparent, and built with accountability mechanisms specifically designed for the Government of Jharkhand.

---

## 2. Problem Statement — SIH25031 Alignment

India has over 640,000 villages and 8,000+ urban local bodies. Every single day, millions of citizens encounter broken civic infrastructure — flooded roads, burst water pipes, overflowing drains, dead streetlights, open garbage dumps. The physical problem is fixable. The administrative gap is not: **there is no reliable, closed-loop system that ensures a reported problem is actually fixed before it is marked resolved.**

The problem statement for SIH25031 calls for a Crowdsourced Civic Issue Reporting and Resolution System that empowers citizens to highlight their community problems and ensures these problems reach the right authorities in a timely and structured manner.

SAMADHAN is the answer because it is not merely a reporting tool; it is a full-stack civic operating system. While existing portals act as passive digital suggestion boxes where complaints get lost, ignored, or falsely closed, SAMADHAN enforces accountability through automated routing, public performance scoreboards for officials, and mandatory citizen verification to confirm successful resolution.

---

## 3. What SAMADHAN Handles — Problem Category Taxonomy

### 3.1 Master Category List
### CATEGORY 1 — ROADS & FOOTPATHS 🛣️
```
Department responsible: PWD (Public Works Department)
                        Municipal Engineering Dept
                        NHAI (National Highways only)

Sub-categories:
  1.1  Pothole / Road damage
  1.2  Broken or missing footpath / pavement
  1.3  Road cave-in / sinkhole
  1.4  Damaged speed breaker / hump
  1.5  Missing road divider / median
  1.6  Missing or faded road markings / lane lines
  1.7  Waterlogging on road (not drainage — road level issue)
  1.8  Encroachment on road (shops, construction blocking road)
  1.9  Unpaved / kutcha road in urban area
  1.10 Bridge / culvert damage

First Responder:  Ward Councillor / JE (Roads)
MPLADS Eligible:  Yes — road construction and repair
```

---

### CATEGORY 2 — DRAINAGE & SEWERAGE 🌊
```
Department responsible: Jal Shakti / Urban Development
                        Municipal Sanitation Dept

Sub-categories:
  2.1  Blocked/clogged drain
  2.2  Overflowing drain / sewage overflow
  2.3  Open / uncovered manhole (safety hazard)
  2.4  Broken manhole cover
  2.5  Sewage leakage on road
  2.6  Sewage entering water supply pipe
  2.7  Storm drain blocked (flooding risk)
  2.8  Drain construction incomplete
  2.9  Drain odour / health hazard
  2.10 Industrial/commercial waste into public drain

First Responder:  Ward Councillor / JE (Water & Sanitation)
Criticality bump: +20 if near_school or near_hospital flag
MPLADS Eligible:  Yes — drainage infrastructure
```

---

### CATEGORY 3 — WATER SUPPLY 💧
```
Department responsible: Jal Shakti Department
                        Drinking Water & Sanitation Dept
                        JUSNL (Jharkhand Urban Infrastructure)

Sub-categories:
  3.1  Burst/leaking water pipe
  3.2  No water supply (entire area)
  3.3  Contaminated water supply (colour, smell, taste)
  3.4  Low water pressure
  3.5  Irregular water supply timing
  3.6  Public tap / standpost not functioning
  3.7  Water tanker not arriving (areas without pipeline)
  3.8  Water meter not working / tampered
  3.9  Illegal water connection
  3.10 Hand pump broken (rural)
  3.11 Borewell/tube well defunct (rural)
  3.12 Overhead tank overflow / damage

First Responder:  JE (Water) / Sarpanch (rural)
Auto-escalate:    Contaminated water → CRITICAL immediately
MPLADS Eligible:  Yes — water supply infrastructure
```

---

### CATEGORY 4 — ELECTRICAL & STREETLIGHTING ⚡
```
Department responsible: JBVNL (Jharkhand Bijli Vitran Nigam Ltd)
                        Urban Local Body (streetlights)

Sub-categories:
  4.1  Streetlight not working
  4.2  Multiple streetlights out (entire street dark)
  4.3  Broken / leaning electricity pole (safety hazard)
  4.4  Low-hanging / dangling electrical wire (hazard)
  4.5  Transformer fault / area blackout
  4.6  Frequent power cuts in area
  4.7  Illegal electricity connection / theft
  4.8  Burning smell / sparking wire (emergency)
  4.9  Meter box damage / tampering
  4.10 Electric pole obstructing road or footpath
  4.11 Solar street light panel damaged (newer installations)

First Responder:  JE (Electrical) / Lineman assigned by dept
Auto-escalate:    Dangling wire / sparking = CRITICAL instantly
MPLADS Eligible:  Yes — rural electrification
```

---

### CATEGORY 5 — SANITATION & WASTE MANAGEMENT 🗑️
```
Department responsible: Municipal Sanitation Dept
                        Swachh Bharat Mission (SBM) implementing body

Sub-categories:
  5.1  Garbage not collected (missed collection schedule)
  5.2  Overflowing garbage bin / dhalaow
  5.3  Illegal garbage dump (private land or roadside)
  5.4  Open burning of waste
  5.5  Garbage dumping in water body / drain
  5.6  Dead animal on road / public area
  5.7  Stray animal issue in public space
  5.8  Open defecation (no toilet facility nearby)
  5.9  Public toilet not functional / no water
  5.10 Public toilet not cleaned / insanitary
  5.11 Community toilet vandalism

First Responder:  Sanitation Inspector / Ward Councillor
SBM alignment:    Direct integration with Swachh Bharat targets
MPLADS Eligible:  Yes — solid waste management
```

---

### CATEGORY 6 — PUBLIC HEALTH HAZARDS 🏥
```
Department responsible: Chief Medical Officer (CMO)
                        Health & Family Welfare Department
                        Urban Local Body (pest control)

Sub-categories:
  6.1  Stagnant water / mosquito breeding site
  6.2  Rat infestation in public area
  6.3  Pest/cockroach infestation (public building)
  6.4  Disease outbreak cluster (multiple people sick, same area)
  6.5  Contaminated food being sold in public (market/vendor)
  6.6  Chemical / toxic waste dumping
  6.7  Slaughterhouse / meat shop hygiene violation
  6.8  Hospital/clinic waste disposal in open
  6.9  COVID/epidemic safety violation in public space

First Responder:  Health Inspector / Sanitation Inspector
Auto-escalate:    Disease outbreak = CRITICAL immediately
Note:             SAMADHAN does NOT handle medical treatment
                  complaints — only PUBLIC SPACE health hazards
```

---

### CATEGORY 7 — ENVIRONMENT & POLLUTION 🌱
```
Department responsible: State Pollution Control Board (JSPCB)
                        Environment & Forests Department
                        Urban Local Body

Sub-categories:
  7.1  Industrial smoke/emission in residential area
  7.2  Construction dust / pollution (uncontrolled site)
  7.3  Noise pollution — construction outside permitted hours
  7.4  Noise pollution — loudspeakers / events (public space)
  7.5  Illegal tree felling (public/government land)
  7.6  Encroachment on public park / green area
  7.7  Water body (pond/lake/river) pollution
  7.8  Encroachment on water body
  7.9  Burning of crop/waste in open (air pollution)
  7.10 Illegal quarrying / mining on public land

First Responder:  Gram Sevak / Sanitation Inspector
                  (then JSPCB for industrial violations)
Clean & Green:    Direct alignment with SIH's
                  "Clean & Green Technology" theme
MPLADS Eligible:  Yes — environmental projects
```

---

### CATEGORY 8 — PUBLIC INFRASTRUCTURE & BUILDINGS 🏗️
```
Department responsible: PWD / Urban Development / Local Body

Sub-categories:
  8.1  Government building maintenance (roof, walls, windows)
  8.2  Community hall / panchayat bhawan in disrepair
  8.3  Public toilet construction incomplete
  8.4  Bus stop / bus shelter damaged
  8.5  Public park maintenance / equipment damaged
  8.6  Public playground / sports ground damaged
  8.7  Boundary wall of public property broken
  8.8  Public statue / monument vandalism
  8.9  Government school building maintenance
  8.10 Anganwadi / balwadi centre maintenance
  8.11 PHC (Primary Health Centre) building maintenance
  8.12 Public library maintenance

First Responder:  Ward Councillor / Sarpanch
MPLADS Eligible:  Yes — public amenities construction
```

---

### CATEGORY 9 — CONSTRUCTION SITE HAZARDS ⚠️
```
Department responsible: Municipal Engineering / Labour Dept
                        Urban Development Dept

Sub-categories:
  9.1  Uncovered excavation / open pit on road/footpath
  9.2  No safety barriers around construction site
  9.3  No signage / lighting at construction obstruction
  9.4  Construction material dumped on road
  9.5  Road dug up and not repaired after utility work
  9.6  Construction noise outside permitted hours
  9.7  Illegal construction blocking public road/space
  9.8  Construction without permit on public land
  9.9  Crane/machinery accident risk in public area
  9.10 Construction waste / debris not cleared

First Responder:  Ward Councillor / JE (Civil)
Safety flag:      Uncovered pit = CRITICAL auto-flag
```

---

### CATEGORY 10 — SOCIAL SERVICES & AMENITIES 📋
```
Department responsible: Varies by sub-category

Sub-categories:
  10.1  Anganwadi not functioning (no teacher, no food)
  10.2  ASHA / healthcare worker not visiting
  10.3  Ration shop (PDS) not distributing (only if physical
         access issue — not fraud — that is a separate system)
  10.4  MGNREGA work site not started (area-level delay)
  10.5  School mid-day meal not being provided
  10.6  Public Wi-Fi / digital kiosk not working
  10.7  Post office infrastructure issue
  10.8  Government scheme camp / awareness drive not held

IMPORTANT: SAMADHAN handles only PHYSICAL ACCESS and
           INFRASTRUCTURE failures in this category.
           Financial fraud, corruption in schemes,
           and individual benefit disputes are OUT OF SCOPE.
           Those belong to separate grievance systems.
```

---

### 3.2 What Is Out of Scope

Being explicit about scope prevents misuse and keeps the platform focused:

```
❌ OUT OF SCOPE — DO NOT ACCEPT:
  → Police/law enforcement matters (use dedicated portals)
  → Criminal complaints (court system)
  → Individual land/property disputes
  → Private company disputes (ISP, telecom, bank)
  → Employment/labour disputes
  → Personal domestic issues
  → Financial fraud between individuals
  → Tax grievances
  → Medical negligence by doctors (clinical matters)
  → Electoral complaints
  → Social media / cyber crime
  → Any issue inside a private residence

✅ IN SCOPE — THE SAMADHAN DOMAIN:
  → Any problem visible in a public space
  → Infrastructure that the government is responsible for
  → Services the government is obligated to provide
  → Environmental hazards in public areas
  → Issues where a government official or contractor
    is the responsible party
```

When a citizen tries to file an out-of-scope complaint, SAMADHAN's AI:
1. Flags it as out-of-scope
2. Tells the citizen which portal to use instead
3. Does NOT create a ticket

---

### 3.3 Category → Department → Official Routing Map

```
CATEGORY         AI DETECTS        ROUTES TO (Tier 1)
─────────────────────────────────────────────────────────────
Roads            Roads / PWD       JE (Roads) → Ward Councillor
Drainage         Water / Sanit.    JE (Water) → Ward Councillor
Water Supply     Water             JE (Water) → Ward Councillor
Electrical       Electrical        JE (Elec.) → Ward Councillor
Sanitation       Sanitation        Sanitation Inspector → Councillor
Health Hazard    Health            Health Inspector → CMO
Environment      Environment       Sanitation Insp. → JSPCB
Construction     Civil / Safety    JE (Civil) → Ward Councillor
Public Buildings Infrastructure   Ward Councillor → PWD
Social Services  Social            Sarpanch (rural) / Councillor (urban)

RURAL equivalents:
  Ward Councillor  →  Sarpanch
  JE (any dept)    →  Gram Sevak (initial) → BDO assigns JE
```

---

## 4. Why Existing Systems Have Failed — Research

### 4.1 The "Procedural Closure" Problem (India: CPGRAMS, Jan Sunwai)

**What happened:** India's flagship grievance portal CPGRAMS (Centralised Public Grievance Redress and Monitoring System) processes millions of complaints annually and boasts high "disposal" rates. The Department of Administrative Reforms (DARPG) reports over 97% disposal within the SLA window.

**The reality:** Disposal ≠ Resolution.

Studies and RTI responses reveal that a significant fraction of "disposed" complaints fall into these categories:
- Complaint forwarded to another department (no action taken)
- Reply: "Matter is under process" (no timeline given)
- Reply: "Citizen should contact local office" (sent back to the starting point)
- Complaint reclassified as a "suggestion" (exempt from resolution mandate)

**The consequence:** Citizens file, see "Closed" status, check the road — the pothole is still there. They stop filing. The system reports high resolution rates. Nobody is accountable.

**How SAMADHAN solves it:** Ticket closure requires TWO independent confirmations:
1. Official submits photo evidence of resolution
2. Citizen casts a YES vote confirming resolution is real

If the citizen votes NO, the ticket automatically reopens with the label "FALSE CLOSURE" and the official's score is penalized. No official can game the system by simply marking a ticket closed.

---

### 4.2 The "Black Hole" Effect (International: FixMyStreet, SeeClickFix, 311 Apps)

**What happened:** Apps like FixMyStreet (UK), SeeClickFix (USA), and hundreds of municipal 311 apps were launched with significant investment. Citizens eagerly reported issues. The reports were filed... and disappeared.

**Root cause:** The civic app was a frontend interface disconnected from the backend work-order system that municipal staff actually use. Reports piled up in a separate database that no field worker ever saw. The app had no integration with the people responsible for physically fixing the problem.

**Real-world data:** Research in Boston showed that public spending on pothole repair did not correlate with high-volume complaint areas identified in the 311 app. The data was there. Nobody acted on it.

**How SAMADHAN solves it:** SAMADHAN IS the work-order system. The complaint does not go into a separate "suggestion box" — it goes directly into the dashboard of the assigned official (Ward Councillor, MLA, or Collector) who has authority and responsibility to act. The official's entire performance score on SAMADHAN is tied to resolving the complaints in their queue.

---

### 4.3 The "Reporting Fatigue" Cycle (India: Swachhata App, UMANG)

**What happened:** Apps like the Swachhata (Swachh Bharat) app had excellent initial adoption. Citizens filed sanitation complaints enthusiastically. Then... nothing happened. Citizens stopped filing because they had learned from experience that filing was futile.

This created a negative feedback loop:
```
Low trust → Few reports → Less pressure on officials
     ↑                              ↓
Less improvement ← Less accountability ← Officials not acting
```

Once this cycle starts, it is almost impossible to break without a fundamental redesign of the incentive structure.

**Specific failure mode:** The Swachhata App's "gamification" (points for uploading cleanliness photos) created perverse incentives. Officials "resolved" issues by taking photos of DIFFERENT clean areas and uploading them as proof.

**How SAMADHAN solves it:** 
- Citizens are explicitly invited back into the loop after every resolution (push notification: "Your complaint was marked resolved — was it actually fixed?")
- Community upvotes mean other citizens can amplify an unresolved complaint even if the original reporter has given up
- The public scoreboard of officials creates social pressure from peers, not just citizens

---

### 4.4 Administrative Resistance and Silo Culture

**What happened:** In multiple Indian states, digital grievance portals were launched by IT departments but never adopted by the departments actually responsible for civic services (PWD, Municipal bodies, Jal Shakti). Staff continued using WhatsApp groups and phone calls to communicate work orders.

**Structural reasons:**
- Officials feared accountability from a digital paper trail
- Departments worried about being "overloaded" with visible complaints
- Junior officials were not empowered to act — every action required sign-off from seniors
- The app was seen as "extra work" on top of existing processes, not a replacement for them

**How SAMADHAN solves it:** 
- Auto-escalation creates an INCENTIVE to resolve. If a junior official resolves the complaint quickly, they score points. If they ignore it, it goes to their senior automatically — creating embarrassment and formal accountability.
- The complaint is routed directly to the person with authority, not CC'd to a chain of seniors.
- SAMADHAN's dashboard IS the primary work surface, not a side system.

---

### 4.5 The Digital Divide and Representation Gap

**What happened:** Research from multiple countries shows that civic reporting apps are primarily used by English-educated, smartphone-owning, urban residents. The neighborhoods with the worst civic problems — low-income, rural, elderly populations — are systematically underrepresented in complaint data.

This means the app inadvertently improves services for those who are already better-served, while the most vulnerable communities have no voice.

**How SAMADHAN addresses it:**
- Voice-to-text complaint filing in Hindi (and planned regional languages) — no typing required
- Phone OTP login — no email, no app store account, no digital literacy required beyond calling a number
- SMS fallback planned (for feature phones) — file a complaint via a structured SMS
- Community upvoting means one digitally literate neighbor can amplify problems for an entire street

---

### 4.6 The Misclassification Escape Hatch

**What happened:** CPGRAMS allows grievances to be reclassified. Departments discovered that a complaint classified as a "suggestion" does not require a formal resolution — only acknowledgment. Officials learned to reclassify borderline grievances as suggestions to avoid the accountability clock.

Similarly, some platforms allowed officials to forward complaints to other departments indefinitely. A complaint would bounce between PWD and Municipal Corporation for months, each claiming it fell under the other's jurisdiction.

**How SAMADHAN solves it:**
- AI classification happens before the complaint reaches any official — it cannot be reclassified by the receiving official
- Jurisdiction is determined by geographic pin (the Leaflet map location) — the ward boundary determines the responsible official, not self-declaration
- Forwarding complaints to another department still counts against the original official's deadline — the clock does not reset on transfer

---

### 4.7 No Consequence for Non-Performance

**What happened:** The root cause beneath all other failures is simple: there is no meaningful consequence for an official who ignores a complaint. CPGRAMS disposal metrics are internal. Citizens cannot see which officers have the worst response records. Promotions and transfers are unaffected by complaint resolution performance. There is zero skin in the game.

**International parallel:** SeeClickFix's study found that the single largest predictor of complaint resolution was whether the mayor's office was personally monitoring the platform. When political pressure existed, things got fixed. Without it, things rotted.

**How SAMADHAN solves it:** SAMADHAN makes accountability **public and quantified**:
- Every official has a live Accountability Score visible to the tier above them
- The MP's scoreboard shows every MLA's performance ranking — creating peer pressure among elected officials
- False closure penalties are immediate and visible
- The score is designed to be presentable at election time — a data-backed record of official performance

---

### 4.8 The Core Problem: Fake Ticket Closure

This deserves its own section because it is the single most important design challenge in any civic grievance system.

### What "Fake Closure" Looks Like

```
Timeline of a typical fake closure:
─────────────────────────────────────────────────────

Day 1     Citizen files: "Pothole on Station Road, 3 months old"
Day 2     Complaint assigned to Ward Councillor
Day 5     Status changed to "IN_PROGRESS"
          (No actual work done — status changed to stop the deadline clock)
Day 8     Status changed to "RESOLVED"
          Resolution note: "Work completed by department"
          Evidence: A photo of a DIFFERENT repaired road uploaded
Day 9     Citizen checks app: Status = RESOLVED ✅
          Citizen goes to Station Road: Pothole still there ❌
Day 10    Citizen has no recourse. Complaint is "closed."
Day 30    Citizen stops using the app.

Result: 100% disposal rate in the system. 0% actual resolution.
```

### Why Officials Do This

1. **Deadline pressure** — SLA windows create incentive to close fast, not close well
2. **No verification mechanism** — once an official clicks "Resolved," there is no check
3. **No consequence** — no penalties for false closure exist in most systems
4. **No citizen power** — citizens can "appeal" but the appeal goes to the same department
5. **Lack of evidence standards** — "resolution notes" can be any text; no photo or location required

### SAMADHAN's Anti-False-Closure Architecture

SAMADHAN is the first system to make citizen verification **mandatory and consequential**:

```
STEP 1 — Official submits resolution
         ├── Must upload minimum 1 photo
         ├── Photo metadata extracted (time, GPS if available)
         └── Status changes to "PENDING_VERIFICATION" (NOT resolved)

STEP 2 — Citizen is notified (push/SMS)
         "Your complaint #C-2847 has been marked resolved.
          Was it actually fixed? You have 48 hours to respond."

STEP 3A — Citizen votes YES
          ├── Status → RESOLVED ✅
          ├── Official score: +10 points (on-time) or +5 (late)
          └── Complaint archived

STEP 3B — Citizen votes NO
          ├── Status → REOPENED 🔴
          ├── Official score: -20 points (FALSE CLOSURE penalty)
          ├── Complaint re-enters queue with "Previously False-Closed" flag
          ├── Deadline window HALVED for the next resolution attempt
          └── Alert sent to tier above (MLA gets notified of false closure by Councillor)

STEP 3C — Citizen does not respond in 48h
          ├── Status → AUTO-VERIFIED ✅ (benefit of the doubt)
          └── Official gets reduced score (+3 points)
```

### Community Verification as Backup

Even if the original citizen does not respond (migrated, lost phone, etc.), SAMADHAN enables **community verification**:
- Other citizens in the same ward who upvoted the original complaint are notified
- Any 3 community members voting NO on a closed complaint can trigger a "Contested Resolution" review
- This goes to the tier above the responsible official for manual review

---

### 4.9 SAMADHAN's Solutions to Each Failure Mode

| Failure Mode | Existing System Response | SAMADHAN's Response |
|-------------|--------------------------|-----------------|
| Procedural closure without real action | Complaint marked "Disposed" administratively | Citizen must vote YES before status reaches RESOLVED |
| Official reclassifying complaints to avoid accountability | No safeguard | AI classifies before official sees it; classification locked |
| Complaint jurisdiction bouncing | Clock resets on each transfer | Clock never resets; original official retains accountability |
| No consequence for non-performance | Internal metrics, no public visibility | Live public scoreboard; score affects MPLADS recommendations |
| False photo evidence | No photo required OR no verification | Photo required + citizen verifies it matches the actual location |
| Digital divide excluding poor communities | English-only, app-only | Hindi voice input, SMS-only filing planned, OTP login |
| "Black hole" — reports not reaching field workers | App separate from work-order system | SAMADHAN IS the work-order system for officials |
| Reporting fatigue — citizens stop filing | No mechanism to re-engage | Citizens receive push notifications on status changes; community upvotes extend complaint life |
| Administrative resistance | No incentive to use the platform | Auto-escalation creates incentive: resolve it or it goes to your boss |
| No inter-complaint learning | Each complaint handled in isolation | AI clusters complaints into systemic issues → DPR generation |

---

## 5. Who Uses SAMADHAN — Complete Government Hierarchy

### 5.1 The Three-Tier Constitutional Structure

India's Constitution distributes civic responsibility across three tiers, each with a defined domain. SAMADHAN maps complaints up and down this structure automatically.

```
╔══════════════════════════════════════════════════════════════╗
║           TIER 1 — CENTRAL GOVERNMENT                       ║
║   Policy, national schemes, central funding (MPLADS etc.)   ║
╠══════════════════════════════════════════════════════════════╣
║           TIER 2 — STATE GOVERNMENT (Jharkhand)             ║
║   State budgets, PWD, departments, district administration   ║
╠══════════════════════════════════════════════════════════════╣
║    TIER 3A — URBAN LOCAL BODIES (ULB)                       ║
║    Municipal Corporation / Council / Nagar Panchayat         ║
╠══════════════════════════════════════════════════════════════╣
║    TIER 3B — RURAL LOCAL BODIES (Panchayati Raj)            ║
║    Zila Parishad → Panchayat Samiti → Gram Panchayat         ║
╚══════════════════════════════════════════════════════════════╝
```

90% of all civic complaints in SAMADHAN — roads, water, drainage, streetlights, garbage — are resolved at **Tier 3**. SAMADHAN routes there first. Tiers 1 and 2 only receive complaints that Tier 3 cannot or will not handle.

---

### 5.2 The Full Hierarchy — Top to Bottom

---

### ━━━ CENTRAL GOVERNMENT LEVEL ━━━

These officials appear in SAMADHAN only for the most extreme systemic failures or MPLADS fund allocation. Day-to-day complaints do not reach here.

---

#### Prime Minister / PMO
```
Role in SAMADHAN:  None for individual complaints.
                Visible in: National analytics dashboard only.
                SAMADHAN can generate national-level civic
                health reports for PMO consumption.
```

#### Cabinet Minister — Urban Development / Rural Development / Jal Shakti / Power
```
Role in SAMADHAN:  Policy oversight. Receives aggregated
                state-level reports if state-wide systemic
                failure is detected (e.g., entire state's
                water supply infrastructure failing).
Login:          Not on SAMADHAN platform directly.
                Receives PDF reports from SAMADHAN API.
```

#### MP — Member of Parliament (Lok Sabha / Rajya Sabha)
```
Role in SAMADHAN:  ★ ACTIVE USER — Tier 4 in escalation chain
Jurisdiction:   Parliamentary Constituency
                (~15–25 Assembly Constituencies)
Login:          Parliament Secretariat issued credentials
Dashboard:      /mp/dashboard, /mp/overview, /mp/priority
                /mp/mlas (MLA scoreboard)

Primary function:
  → Receives complaints escalated past Collector level
  → Views constituency-wide analytics
  → Approves AI-generated DPRs for MPLADS fund use
    (₹5 crore/year per MP for local development)
  → Sees MLA performance scoreboard
  → Cannot directly resolve complaints — approves projects
```

---

### ━━━ STATE GOVERNMENT LEVEL — Jharkhand ━━━

---

#### Governor of Jharkhand
```
Role in SAMADHAN:  None. Constitutional/ceremonial head.
                Not part of the resolution chain.
```

#### Chief Minister (CM)
```
Role in SAMADHAN:  Receives state-wide SAMADHAN monthly report.
                Can view macro analytics dashboard.
                Not part of individual complaint chain.
Login:          Special read-only analytics access
Dashboard:      State health dashboard (planned feature)

Politically relevant:
  → CM's staff can pull ward-level complaint heatmaps
    before election campaign planning
  → State-wide false closure rates visible to CM office
```

#### Deputy Chief Minister
```
Same as CM — read-only analytics access.
Often holds a specific portfolio (e.g., PWD or Urban Dev)
so may receive department-specific escalation reports.
```

#### Cabinet Minister — State Level
```
Departments relevant to SAMADHAN:
  → Urban Development & Housing
  → Rural Development
  → Drinking Water & Sanitation
  → Energy / Electricity (JBVNL oversight)
  → Roads & Bridges (PWD)
  → Panchayati Raj
  → Health (for civic health hazards)
  → Environment & Forests (for pollution/waste)

Role in SAMADHAN:  Tier 5 in escalation chain.
                Receives only score 90–100 systemic complaints.
Login:          State secretariat email + password
```

#### Chief Secretary (IAS — Senior most civil servant in state)
```
Role in SAMADHAN:  Receives weekly district performance digest.
                Intervention authority over all districts.
Login:          NIC email access — read-only analytics
```

#### Principal Secretary / Secretary — Relevant Departments
```
PWD Secretary, Urban Dev Secretary, Water Secretary etc.
Role in SAMADHAN:  Department-specific escalations.
                If all road complaints in a district go
                unresolved → PWD Secretary is auto-notified.
```

#### Divisional Commissioner
```
Jurisdiction:   Division (group of districts)
                Jharkhand has 5 Divisions:
                Ranchi, Dhanbad, Palamu, Santhal Pargana,
                Kolhan
Role in SAMADHAN:  Receives multi-district pattern alerts.
                Not in standard escalation chain —
                only for systemic regional failures.
```

---

### ━━━ DISTRICT LEVEL — Core Executive Tier ━━━

This is where real administrative power sits. The Collector is the single most important official for SAMADHAN's escalation chain.

---

#### District Collector / Deputy Commissioner (IAS)
```
Role in SAMADHAN:  ★ ACTIVE USER — Tier 3 in escalation chain
                Most powerful executive at district level.
Jurisdiction:   Entire district (Jharkhand has 24 districts)
Login:          NIC gov email (@jharkhand.gov.in or @nic.in)
Dashboard:      /official/dashboard (Collector role)

Powers on SAMADHAN:
  → Receives MLA-escalated complaints
  → Can force-override and resolve any complaint in district
  → Can issue directions logged and tracked permanently
  → Receives daily district analytics digest
  → Can trigger "District Emergency Mode" for CATASTROPHIC
    complaints (all officials in district notified)
  → Views all officials' accountability scores in district

Deadline window:  48 hours on escalated complaints
Penalty for miss: Score -10, escalates to MP
```

#### Additional District Collector (ADC)
```
Role in SAMADHAN:  Receives complaints when Collector is
                unavailable. Same dashboard, sub-role.
```

#### Sub-Divisional Magistrate / Sub-Divisional Officer (SDO)
```
Jurisdiction:   Sub-division (multiple blocks)
Role in SAMADHAN:  Intermediary between Collector and BDO.
                Receives HIGH criticality complaints in
                their sub-division.
Login:          District admin credentials
```

#### District Development Commissioner (DDC)
```
Role in SAMADHAN:  Reviews Development Project Reports (DPRs)
                generated by SAMADHAN AI from complaint clusters.
                Approves district-level project budgets.
```

#### Departmental District Officers
```
Executive Engineer — PWD (Roads & Bridges)
Executive Engineer — Jal Shakti (Water & Sanitation)
Executive Engineer — JBVNL (Electrical)
Chief Medical Officer — District Health
District Education Officer

Role in SAMADHAN:  Receives department-specific complaints
                routed by category.
                Roads → PWD Executive Engineer
                Water → Jal Shakti Executive Engineer
                Electrical → JBVNL Executive Engineer

These are the officials who actually ASSIGN contractors
and manage the Work Order system (Section 9).
```

---

### ━━━ ASSEMBLY CONSTITUENCY LEVEL ━━━

---

#### MLA — Member of Legislative Assembly
```
Role in SAMADHAN:  ★ ACTIVE USER — Tier 2 in escalation chain
Jurisdiction:   Assembly Constituency
                (Jharkhand has 81 Assembly Constituencies)
                Each covers ~200,000–300,000 citizens
Login:          Jharkhand Legislative Assembly credentials
Dashboard:      /mla/dashboard

Powers on SAMADHAN:
  → Receives Ward-level escalated complaints
  → Views constituency-wide heatmap
  → Accountability score visible to MP above them
  → MLA FUNDS (MLA Local Area Development Scheme)
    — AI suggests projects to fund from complaint data
  → Cannot override Collector — can only escalate UP

Deadline window:  72 hours on escalated complaints
Penalty for miss: Score -10, escalates to Collector
```

---

### ━━━ URBAN LOCAL BODY LEVEL (Cities & Towns) ━━━

This is where 90% of urban complaints are FIRST ROUTED.

---

#### Municipal Corporation (Ranchi, Jamshedpur, Dhanbad, Bokaro)

```
Mayor (Elected)
  → Highest elected official in city
  → Role in SAMADHAN: Receives city-wide analytics.
                   Political accountability for all
                   unresolved complaints in the city.
  → Login: Mayor's office credentials (read-only analytics)

Deputy Mayor (Elected)
  → Assists Mayor, often a specific portfolio holder
  → Role in SAMADHAN: Same as Mayor

Municipal Commissioner (IAS/State Service — Executive head)
  → Actual executive in charge of day-to-day operations
  → Role in SAMADHAN: ★ ACTIVE USER
                   Receives escalated complaints from
                   Ward Councillors
                   Approves Work Orders above ₹10 lakh
  → Deadline: 48 hours
  → Login: Municipal corp email credentials

Additional Commissioner / Zonal Commissioner
  → City divided into zones, Zonal Commissioner manages zone
  → Role in SAMADHAN: Zone-level complaint oversight

Chief Engineer — Municipal
  → Reviews all engineering-category complaints citywide
  → Approves DPRs for roads, water, drainage projects

Ward Officer / Zonal Officer (Administrative)
  → Below Commissioner, manages clusters of wards
  → Role in SAMADHAN: First administrative escalation from Councillor

Ward Councillor (Elected — MOST IMPORTANT GROUND-LEVEL OFFICIAL)
  ★ FIRST RESPONDER — Tier 1A in SAMADHAN escalation chain
  → Jurisdiction: 1 ward (~10,000–30,000 citizens)
  → Jharkhand's Ranchi Municipal Corporation: 53 wards
  → Login: Corp-issued ID + password
  → Dashboard: Ward-specific complaint queue
  → Deadline: 96 hours (standard), shorter for HIGH+
  → Penalty: Score -10 per missed deadline
  → Responsibility: ALL complaints in their ward
  → First line of response for the citizen
```

#### Junior Engineer / Assistant Engineer (Ward-level)
```
Role in SAMADHAN:  ★ TECHNICAL RESPONDER — Tier 1B
Jurisdiction:   Department-specific within ward/zone
  → Roads JE → Road and footpath complaints
  → Water JE → Pipe, drainage, sewage complaints
  → Electrical JE → Streetlight, wiring complaints

Login:          Department employee ID
Function:       Assigned complaints by their senior
                Physically inspects, raises Work Orders,
                verifies contractor phases
                Signs off on Phase completions (Section 9.3)
```

#### Sanitation Inspector / Health Inspector
```
Role in SAMADHAN:  Handles garbage, cleanliness, disease-hazard
                complaints. Reports to Ward Officer.
```

#### Safai Karamchari / Field Worker
```
Role in SAMADHAN:  Not a login user. Tagged in Work Orders
                as the assigned field staff.
                Their supervisor is accountable on SAMADHAN.
```

---

### ━━━ RURAL LOCAL BODY LEVEL (Panchayati Raj) ━━━

Jharkhand Panchayati Raj Act, 2001 — Three-tier structure.

---

#### Zila Parishad (District-level Rural Body)
```
President / Adhyaksha (Elected)
  → Elected head of district-level panchayat
  → Role in SAMADHAN: Receives district rural analytics.
                   Equivalent to Mayor but for rural areas.
  → Login: District Panchayat credentials

CEO — Zila Parishad (IAS/State Service)
  → Executive head, like Municipal Commissioner for rural
  → Role in SAMADHAN: Escalation point for Panchayat Samiti
                   failures. Approves large rural work orders.

Zila Parishad Members (Elected, one per constituency)
  → Role in SAMADHAN: Read-only analytics for their area
```

#### Panchayat Samiti / Block Panchayat (Block-level)
```
Pramukh / Block Panchayat President (Elected)
  → Head of block-level panchayat
  → Role in SAMADHAN: Receives escalations from Sarpanch level
  → Login: Block panchayat credentials

Block Development Officer — BDO (Government Officer)
  ★ CRITICAL RURAL OFFICIAL — Tier 2 in rural escalation
  → Most important government officer at block level
  → Role in SAMADHAN: Receives Sarpanch-escalated complaints
                   Manages MGNREGS, rural scheme funds
                   Approves rural work orders
  → Login: Block office credentials
  → Deadline: 72 hours escalation window

Up-Pramukh (Deputy)
  → Assists Pramukh
```

#### Gram Panchayat (Village-level — MOST GROUND-LEVEL)
```
Sarpanch (Elected village head)
  ★ FIRST RESPONDER for RURAL — Tier 1A Rural
  → Jurisdiction: One Gram Panchayat (1–5 villages)
  → Jharkhand has ~4,300 Gram Panchayats
  → Login: Panchayat Raj Department issued credentials
  → Dashboard: GP-level complaint queue
  → Deadline: 96 hours standard
  → Responsible for ALL rural civic complaints in their GP

Up-Sarpanch (Deputy Sarpanch)
  → Assists Sarpanch, takes over when unavailable

Ward Panch / Gram Panchayat Ward Member (Elected)
  → One per village ward within the GP
  → Role in SAMADHAN: Not a primary login user
                   Can be tagged in complaints as the
                   responsible local representative
  → Assists Sarpanch in ground-level verification

Gram Sevak (Government Employee assigned to GP)
  → Technical and administrative support for GP
  → Role in SAMADHAN: Field verification of complaints
                   Signs off on work completion

Panchayat Secretary
  → Administrative head of GP office
  → Role in SAMADHAN: Manages GP's official account,
                   files Work Orders, tracks contractor
```

#### Gram Sabha (Not an official — but constitutionally powerful)
```
The assembly of ALL voters in a village.
Role in SAMADHAN:  The community verification system
                (Section 10.3) is essentially a digital
                Gram Sabha — any registered voter can
                verify, upvote, or dispute a complaint
                in their area.
                This is constitutionally legitimate.
```

---

### 5.8 Complete SAMADHAN Escalation Map

```
COMPLAINT FILED
      │
      ▼
━━━ URBAN PATH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TIER 1A — Ward Councillor        [96h deadline]
  TIER 1B — Junior Engineer        [assigned by Councillor]
      │
      │ Missed deadline →
      ▼
  TIER 2  — Municipal Commissioner [48h deadline]
      │
      │ Missed deadline →
      ▼
  TIER 3  — MLA                    [72h deadline]
      │
      │ Missed deadline →
      ▼
  TIER 4  — District Collector     [48h deadline]
      │
      │ Missed deadline →
      ▼
  TIER 5  — MP                     [24h deadline]
      │
      │ Systemic / CATASTROPHIC →
      ▼
  TIER 6  — State Ministry         [12h deadline]

━━━ RURAL PATH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TIER 1A — Sarpanch / GP          [96h deadline]
  TIER 1B — Gram Sevak             [assigned by Sarpanch]
      │
      │ Missed deadline →
      ▼
  TIER 2  — BDO / Pramukh          [72h deadline]
      │
      │ Missed deadline →
      ▼
  TIER 3  — MLA                    [72h deadline]
      │
      │ Missed deadline →
      ▼
  TIER 4  — District Collector     [48h deadline]
      │
      │ Missed deadline →
      ▼
  TIER 5  — MP                     [24h deadline]
      │
      │ Systemic / CATASTROPHIC →
      ▼
  TIER 6  — State Ministry         [12h deadline]
```

---

### 5.9 Who Can See What — Visibility Matrix

```
ROLE                SEES OWN AREA    SEES BELOW    SEES METRICS    CAN RESOLVE
─────────────────────────────────────────────────────────────────────────────────
Field Worker        ✅ Assigned only   ❌            ❌              ❌
Jr Engineer         ✅ Dept + ward     ❌            Basic           ✅ (Work order)
Gram Sevak          ✅ GP only         ❌            Basic           ✅ (Field work)
Ward Panch          ✅ Ward only       ❌            Basic           ❌
Ward Councillor     ✅ Full ward       ❌            ✅ Ward stats    ✅
Sarpanch            ✅ Full GP         ❌            ✅ GP stats      ✅
BDO                 ✅ Full block      ✅ All GPs     ✅ Block stats   ✅
Mun. Commissioner   ✅ Full city       ✅ All wards   ✅ City stats    ✅
MLA                 ✅ Constituency    ✅ All below   ✅ Full metrics  ✅ (Escalated)
Collector / DC      ✅ Full district   ✅ All below   ✅ Full metrics  ✅ (Force)
MP                  ✅ Parl. constit.  ✅ All below   ✅ Full + scores ⚠️ (Projects)
CM Office           ✅ Full state      ✅ All         ✅ State view    ❌ (Analytics)
State Ministry      ✅ State (dept)    ✅ Dept only   ✅ Dept metrics  ✅ (Emergency)
```

### 5.10 Login Credential Matrix

### Login Credential Matrix

| User Type | Login Method | ID Source | Notes |
|-----------|-------------|-----------|-------|
| Citizen | Phone OTP | Mobile number | No gov ID needed |
| Ward Councillor | Email + Password | Municipal Corporation | Corp issues credentials |
| Sarpanch / GP Member | Email + Password | District Panchayati Raj office | |
| Junior Engineer | Email + Password | Department HR system | |
| MLA | Email + Password | State Legislative Assembly Secretariat | |
| District Collector | NIC Email + Password | NIC / State IT Dept | @nic.in or @[state].gov.in |
| MP | Email + Password | Lok Sabha / Rajya Sabha Secretariat | |
| Ministry Official | Email + Password | State / Central Secretariat | |

**Implementation Note:** In SAMADHAN v1.0, official credentials are provisioned by an admin (super-user) who seeds the database. In production, this integrates with NIC's National Identity Platform or state-specific SSO. Any official with a `.gov.in` or NIC email should be able to self-register pending admin approval.

---

## 6. Citizen Identity & Trust System

### 6.1 Three Trust Levels

#### LEVEL 0 — Phone Verified (Entry Level)
How to reach it:   Phone number + OTP (done at signup)
What it proves:    You have a working Indian SIM card
Badge on profile:  📱 Phone Verified

| Capability | Limit |
|-----------|-------|
| File complaints | Max 2 per month |
| Ticket priority | Low — starts at 1 star regardless of AI score |
| Ticket status | "PENDING COMMUNITY VERIFICATION" until 5 citizens confirm |
| Cast verification votes | ❌ Cannot verify others' complaints |
| Upvote complaints | ✅ Yes (Unlimited) |
| Visible on ticket | "Filed by Unverified Citizen" |

#### LEVEL 1 — Aadhaar Verified
How to reach it:   Phone OTP + Aadhaar OTP via UIDAI API
                   (We never store the Aadhaar number —
                    only a verification token is kept)
What it proves:    You are a real, uniquely identifiable
                   Indian citizen. One person = one account.
Badge on profile:  🔵 Aadhaar Verified

| Capability | Limit |
|-----------|-------|
| File complaints | Max 4 per month |
| Ticket priority | Normal — AI criticality score applies immediately |
| Ticket status | "PENDING COMMUNITY VERIFICATION" (still needs 5, but counts 2x) |
| Cast verification votes | ✅ Yes — counts as 1 verification |
| Upvote complaints | ✅ Yes (Unlimited) |
| Visible on ticket | "Filed by Verified Citizen ✅" |

#### LEVEL 2 — Ward Resident Verified (Full Trust)
How to reach it:   Level 1 + address on Aadhaar matches
                   the ward boundary they are filing in
                   (Aadhaar address cross-checked against
                    GeoJSON ward boundary database)
What it proves:    You are a real person who actually
                   lives in the area you are reporting
Badge on profile:  🟢 Resident Verified

| Capability | Limit |
|-----------|-------|
| File complaints | Max 10 per month |
| Ticket priority | Full — AI score + immediate routing |
| Ticket status | Counts as 2 of the 5 required verifications automatically |
| Cast verification votes | ✅ Yes — counts as 2 verifications |
| Upvote complaints | ✅ Yes (Unlimited) |
| Visible on ticket | "Filed by Ward Resident ✅✅" |

### 6.2 Trust Level Summary

```
                 LEVEL 0          LEVEL 1          LEVEL 2
                 Phone Only       Aadhaar          Ward Resident
                ┌────────────┐  ┌────────────┐  ┌────────────┐
 Daily Limit    │  2/month   │  │  4/month   │  │ 10/month   │
 Priority       │  Low       │  │  Normal    │  │  Full      │
 Verif. Weight  │  1 vote    │  │  1 vote    │  │  2 votes   │
 Auto-Verifies  │  0 of 5    │  │  0 of 5    │  │  2 of 5    │
 Can Verify     │  ❌        │  │  ✅        │  │  ✅✅      │
                └────────────┘  └────────────┘  └────────────┘

Upgrade path is voluntary. Citizens can use SAMADHAN forever
at Level 0. Aadhaar verification is an OPT-IN that unlocks
higher capability — never a gate that blocks filing.
```

---

## 7. Complaint Filing & Authenticity Engine

### 7.1 — GPS Geofencing (Location Authenticity)

When a citizen files a complaint, two GPS coordinates are captured:
- **Citizen GPS** — where they are when filing (device location)
- **Complaint GPS** — where they say the problem is (map pin)

The system then enforces three rules:

```
RULE A — Proximity Check
  Citizen GPS must be within 500m of Complaint GPS
  
  WHY: You cannot credibly report a problem you cannot
  physically see. If you are 5km away and filing a
  complaint about a pothole — you are either mistaken
  or fabricating.

  EXCEPTION: "I saw this while driving/commuting"
  Citizens can flag this option, which raises the
  distance limit to 2km but adds a note on the ticket:
  "Reported by a commuter passing through"

RULE B — State Boundary Check
  Complaint GPS must be within Jharkhand state boundary

RULE C — Ward Boundary Awareness
  Complaint GPS is automatically matched to a ward.
  The ticket is auto-tagged with that ward — not
  what the citizen typed. This prevents citizens from
  filing in Ward 1 while physically in Ward 7.
```

**GPS Spoofing Detection:**
Mock location apps are common. SAMADHAN detects spoofing by:
- Cross-referencing mobile network cell tower location with GPS
- Detecting if GPS coordinates change impossibly fast between recent actions
- Flagging VPN usage (IP geolocation vs GPS mismatch)
- Flagging perfectly round GPS coordinates (1234.0000, 7890.0000) which are often fake

If spoofing is detected → complaint filed but flagged for human review, citizen trust score penalised.

---

### 7.2 — Photo Verification via Gemini Vision AI

A photo is **mandatory** for all complaints above ROUTINE criticality. The uploaded photo is immediately sent to Gemini Vision for analysis. Three sub-checks run:

#### Sub-check A — Does the photo match the complaint?

```
COMPLAINT TEXT:    "Overflowing garbage dump near school"
PHOTO SUBMITTED:   [image]

Gemini Vision Analysis:
  → Garbage/waste visible?          YES ✅
  → Outdoor location?               YES ✅
  → Signs of school/children nearby? YES ✅
  → Photo appears authentic?         YES ✅
  → VERDICT: PHOTO MATCHES COMPLAINT

─────────────────────────────────────────

COMPLAINT TEXT:    "Large pothole causing accidents"
PHOTO SUBMITTED:   [image of clean new road]

Gemini Vision Analysis:
  → Road surface visible?            YES
  → Road damage/pothole visible?     NO ❌
  → Road appears intact?             YES
  → VERDICT: PHOTO DOES NOT MATCH
  → Action: Citizen shown warning:
    "Your photo doesn't appear to show the
     problem described. Please upload a photo
     of the actual issue. [RETRY] [SKIP PHOTO]"
  → If skipped: complaint filed at lower priority
    with flag "No photo evidence"
```

#### Sub-check B — Photo Timestamp Check (EXIF Metadata)

```
Photo EXIF data extracted:
  → Date taken:    3 weeks ago ❌
  → Location EXIF: Different city ❌
  
ACTION: Complaint filed but flagged:
  "Photo appears to be older than 2 hours.
   Please upload a fresh photo of the current issue."
   
EXCEPTION: Flagged, not blocked. Sometimes citizens
take a photo on Monday and file Tuesday morning.
We flag it for community verification — not reject it.
```

#### Sub-check C — Reverse Image Check

```
Photo hash compared against:
  → SAMADHAN's own database of previously submitted photos
    (catches the exact same image used on multiple tickets)
  → Stock photo / internet image signatures

IF MATCH FOUND:
  "This photo has been used in a previous complaint.
   Please take a new photo of the current issue."
  → Ticket blocked until fresh photo submitted
  → Citizen trust score: -10 points
```

---

### 7.3 — Real-Time Duplicate Detection

This runs **before** the citizen finishes writing their complaint — while they are still on the filing screen. It uses a combination of location proximity and semantic text similarity.

#### Trigger Point — Map Pin Drop

The moment a citizen pins their complaint location on the map:

```
Within 300m radius + same category + filed in last 45 days
+ status NOT RESOLVED:

System finds: Complaint #C-2847
  "Burst water pipe near Station Road junction"
  Filed 5 days ago · 23 upvotes · Status: ASSIGNED

Map shows existing complaint pin highlighted in yellow.
Banner slides up from bottom:

┌─────────────────────────────────────────────────────┐
│  📍 Similar open complaint 180m from your location  │
│                                                     │
│  [PHOTO]  "Burst water pipe near Station Road"      │
│           Filed 5 days ago · 23 people affected     │
│           Status: ASSIGNED to MLA Suresh Kumar      │
│                                                     │
│  Is this the same problem you want to report?       │
│                                                     │
│  [✅ YES — JOIN THIS COMPLAINT]  [No, mine differs] │
└─────────────────────────────────────────────────────┘
```

If citizen taps **YES — JOIN THIS COMPLAINT:**
```
→ They are taken to the existing ticket
→ Auto-upvoted (counts as 1 upvote + 1 community verification)
→ Their GPS recorded as another witness location
→ Citizen gets +3 reward points for not creating duplicate
→ Existing ticket's star rating recalculated (more upvotes = higher stars)
→ If this pushes ticket to 5 verifications → status upgrades
```

If citizen taps **No, mine differs:**
```
→ They proceed to file their complaint
→ System notes this (for audit — if 10 people say "mine is different"
  for the exact same location, something is suspicious)
→ New ticket is created but cross-linked to the similar complaint
  ("3 similar complaints in this area — possible recurring issue")
```

#### Trigger Point — Real-Time Text Similarity

As the citizen types their complaint description, semantic similarity runs in the background:

```
Citizen typing: "there is no street light working
                 near the bus stop on—"

Semantic match found (85% similarity):
Complaint #C-2901: "Street lamps not functioning at
                    Station Road bus stand" · 2 days ago

Banner appears:
┌─────────────────────────────────────────────────────┐
│  ⚡ Looks like this might already be reported        │
│                                                     │
│  "Street lamps not functioning at Station Road      │
│   bus stand" — filed 2 days ago · 18 upvotes       │
│                                                     │
│  [SEE FULL TICKET]  [UPVOTE THIS]  [DIFFERENT]     │
└─────────────────────────────────────────────────────┘
```

#### What Counts as a Duplicate?

```
DEFINITE DUPLICATE (auto-redirect):
  → Same GPS location (within 100m)
  → Same category
  → Same complaint within last 7 days
  → Unresolved

LIKELY DUPLICATE (show warning, let citizen decide):
  → Within 300m radius
  → Same category
  → 60%+ semantic text similarity
  → Within last 45 days
  → Unresolved

NOT A DUPLICATE (file fresh):
  → Previously RESOLVED complaint at same location
    (problem came back = recurring issue = important data)
  → Different category entirely
  → Beyond 300m
  → Original complaint is >45 days old
  → Citizen explicitly states "mine is different"
```

**The Recurring Problem Rule:**
If a complaint is filed at a location that has had 3 or more resolved complaints of the same category in the last 6 months — the new complaint is automatically tagged **"RECURRING ISSUE"** and gets:
- 2x criticality multiplier
- Immediate escalation to MLA regardless of normal routing
- AI flag: "This location has systemic infrastructure failure"

---

### 7.4 The 5-Citizen Community Verification System

This is SAMADHAN's most powerful anti-fake-ticket mechanism — and simultaneously its most powerful **user acquisition engine.**

### How It Works

When a Level 0 or Level 1 citizen files a complaint, it enters **PENDING COMMUNITY VERIFICATION** status. It is NOT yet formally assigned to any official. Five verified citizens must confirm they have seen the issue before it becomes active.

```
COMPLAINT FILED by Citizen A (Level 0)
         │
         ▼
Status: "PENDING COMMUNITY VERIFICATION"
Visible in: Nearby Citizens' "Verify Issues" feed
Official sees: Nothing yet (not in their queue)
         │
         ▼
SAMADHAN sends notifications to citizens
registered within 500m of the issue:
  "Someone near you reported an issue.
   Have you seen it? Your verification
   helps get it fixed faster. 📍"
         │
         ▼
Citizen B opens app → sees the complaint
Goes to location (GPS checked) →
taps "I've seen this issue ✅"
[Verification weight: depends on their trust level]

  Level 0 citizen verifying  →  0.5 verifications
  Level 1 citizen verifying  →  1 verification
  Level 2 citizen verifying  →  2 verifications
         │
         ▼
THRESHOLD REACHED when sum of verifications ≥ 5
         │
         ▼
Status → "COMMUNITY VERIFIED ✅"
Complaint now formally enters the queue
AI criticality score applied at full weight
Routed to assigned official
Official notified: "Verified complaint assigned to you"
All 5 verifiers get reward points
```

### Why GPS Check During Verification?

When a citizen taps "I've seen this issue," their GPS must place them within **500m of the reported complaint location.** This is non-negotiable. You cannot verify an issue you are physically not near.

This prevents:
- Friends verifying each other's fake complaints from home
- Organised fake verification rings
- Political agents creating fake complaint swarms

```
Citizen taps "Verify" from home sofa:
  GPS check: 4.2km from complaint location ❌
  
  Message shown:
  "You need to be near the issue to verify it.
   Walk or drive to [location] and open the
   app there to confirm."
```

### The Urgent Issue Exception

Not everything can wait for community verification. Critical and catastrophic complaints are dangerous:

```
Criticality Level    Verification Required?    Fast-Track?
─────────────────────────────────────────────────────────
CATASTROPHIC         ❌ Skip immediately         YES → Routed in seconds
CRITICAL             ❌ Skip                     YES → Routed in minutes
HIGH                 Partial (3 verifications)   Queued but visible
ELEVATED             Full 5 verifications        Standard
MODERATE             Full 5 verifications        Standard
ROUTINE              Full 5 verifications        Standard
```

A gas explosion cannot wait 48 hours for 5 people to walk to the site. Common sense overrides.

### What Verifiers See

When a citizen opens the "Verify Issues" tab, they see a feed of nearby unverified complaints:

```
VERIFY ISSUES NEAR YOU                        [📍 Ward 7]

  ┌──────────────────────────────────────────────────┐
  │ 📍 180m away                    ⏳ 3/5 verified  │
  │                                                  │
  │ [PHOTO] Overflowing drain near primary school    │
  │         Filed 6 hours ago by Verified Citizen    │
  │         Category: Water · Score: 65 (HIGH)       │
  │                                                  │
  │  [📍 GO VERIFY — +5 PTS]    [Not near me]        │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │ 📍 340m away                    ⏳ 1/5 verified  │
  │                                                  │
  │ [PHOTO] Broken footpath causing falls near       │
  │         post office entrance                     │
  │         Filed 2 hours ago                        │
  │         Category: Roads · Score: 45 (ELEVATED)   │
  │                                                  │
  │  [📍 GO VERIFY — +5 PTS]    [Not near me]        │
  └──────────────────────────────────────────────────┘
```

### The User Acquisition Engine

This is the feature that drives organic downloads:

```
SCENARIO:
  Citizen A files a complaint about a pothole
  SAMADHAN needs 5 verifiers from the neighbourhood
  
  Citizen A shares the complaint link to:
    → Their building's WhatsApp group
    → Neighbours they know personally
  
  Recipients click the link:
    → If they have SAMADHAN: opens app directly
    → If they DON'T have SAMADHAN: opens to a web page
      showing the complaint + "Download SAMADHAN to verify"
  
  They download SAMADHAN, verify the complaint (+5 pts),
  and are now active users who will file their own
  complaints in future.

RESULT:
  Every complaint is a potential invitation to 5 new users.
  Every new user is motivated (they want to fix a real
  problem in their neighbourhood).
  Retention is high (they care about the outcome).
  
  This is not marketing. This is the product itself
  acquiring users by working correctly.
```

### 7.5 How All Checks Work Together
```
CITIZEN FILES A COMPLAINT
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              AUTHENTICITY STACK (milliseconds)          │
│                                                         │
│  1. IDENTITY CHECK                                      │
│     → What is their Trust Level? (0/1/2)                │
│     → What is their Civic Trust Score?                  │
│     → How many complaints today? (rate limit check)     │
│                                                         │
│  2. LOCATION CHECK                                      │
│     → Citizen GPS within 500m of complaint pin?         │
│     → GPS spoofing detected?                            │
│     → Ward auto-tagged from complaint coordinates       │
│                                                         │
│  3. DUPLICATE CHECK                                     │
│     → Similar complaint within 300m + 45 days?         │
│     → YES → Show existing ticket, offer upvote          │
│     → NO → Proceed to filing                           │
│                                                         │
│  4. PHOTO CHECK (if photo submitted)                    │
│     → Does photo match complaint text? (Gemini Vision)  │
│     → Is photo timestamp recent? (EXIF)                 │
│     → Is photo recycled? (hash check)                   │
│     → Does photo GPS match complaint GPS?               │
└────────────────────────┬────────────────────────────────┘
                         │
            All checks passed? → TICKET CREATED
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│           COMMUNITY VERIFICATION PHASE                  │
│                                                         │
│  Criticality CATASTROPHIC/CRITICAL?                     │
│    → SKIP — route immediately to official               │
│                                                         │
│  All others:                                            │
│    Status = "PENDING COMMUNITY VERIFICATION"            │
│    5 GPS-verified citizens must confirm                 │
│    Level 2 citizen = 2 verifications                    │
│    Level 1 citizen = 1 verification                     │
│    Level 0 citizen = 0.5 verifications                  │
│                                                         │
│  Threshold reached (sum ≥ 5)?                           │
│    → Status = "COMMUNITY VERIFIED ✅"                   │
│    → Routed to official                                 │
│    → All verifiers rewarded with points                 │
│                                                         │
│  48 hours pass, threshold NOT reached?                  │
│    → Status = "LOW INTEREST — AWAITING VERIFICATION"    │
│    → Citizen notified: "Share your complaint to get     │
│      neighbours to verify it"                           │
│    → Complaint stays open for 7 days total              │
│    → After 7 days with 0 verification: auto-archived    │
│      (complaint not deleted — remains searchable)       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
          OFFICIALLY VERIFIED COMPLAINT
          Enters official queue with full context:
            → Trust Level of filer
            → Number of community verifications
            → Number of upvotes
            → Photo evidence (Gemini-confirmed)
            → GPS trail of all verifiers
            → Civic Trust Score of original filer
```

---

## 8. Citizen Reputation Score

### 8.1 Starting Score
### Starting Score

```
New account:             50 / 100
After Aadhaar verify:    70 / 100  (+20 automatic)
After Ward verify:       80 / 100  (+10 additional)
```

### What Changes The Score

```
SCORE INCREASES:
─────────────────────────────────────────────────────
  +5   Your complaint was community-verified (real)
  +8   Your complaint was officially resolved
  +3   Your upvote joined an existing complaint
       instead of creating a duplicate
  +5   You verified another citizen's complaint
       (GPS-confirmed, on-site)
  +10  You were one of the 5 who verified a complaint
       that eventually got resolved
  +3   Your YES/NO resolution vote matched the outcome
       (you said YES and official confirmed, or vice versa)
  +15  You reported a "RECURRING ISSUE" that led to
       a Development Project being created
  +20  Aadhaar verification completed (one-time)
  +10  Ward verification completed (one-time)

SCORE DECREASES:
─────────────────────────────────────────────────────
  -30  Your complaint was marked FAKE by official
       AND confirmed fake by 3 other citizens
  -15  Photo submitted was identified as recycled
       (same image used before)
  -10  GPS spoofing detected when filing complaint
  -10  Photo EXIF shows image is >7 days old
  -5   You created a duplicate complaint after being
       shown the existing one and saying "mine is different"
       (and it was verified to be the same issue)
  -20  Repeated duplicate creation (3+ times)
  -25  Organised fake verification (you verified
       a complaint without being near the location —
       GPS mismatch caught)
  -50  Account manipulation (multiple accounts
       linked to same Aadhaar)
```

### What The Score Affects

```
Score 80–100  🟢 HIGH TRUST
  → Complaints skip to 3/5 verifications (need only 2 more)
  → Resolution votes count double
  → Profile shows "Trusted Civic Reporter" badge
  → Invited to beta test new features

Score 60–79   🔵 NORMAL TRUST
  → Standard experience, all features unlocked
  → Profile shows "Active Citizen" badge

Score 40–59   🟡 LOW TRUST
  → Complaints need all 5 community verifications
  → Cannot cast resolution verification votes
  → Upvotes count as 0.5x
  → Profile shows no trust badge

Score 20–39   🟠 RESTRICTED
  → Max 1 complaint per day
  → Complaints go into a manual review queue
  → Cannot verify other complaints
  → Profile shows "Restricted Account" note

Score 0–19    🔴 SUSPENDED
  → Cannot file new complaints for 30 days
  → All pending complaints paused
  → Must complete Aadhaar verification to restore
  → Profile shows "Account Under Review"
```

### The Score Is Never Shown Publicly

This is important. The Trust Score is **visible only to the citizen themselves** (on their profile page). Officials see the aggregate — "this complaint has 5 community verifications" — but they never see an individual's trust score. This prevents discrimination based on past filing behaviour and respects citizen dignity.

### 8.2 Data Models
### CitizenVerification (upgrade events)
```
id, citizen_id (FK), verification_type (AADHAAR/WARD),
verified_at, aadhaar_token (hashed, never raw),
ward_matched (boolean)
```

### ComplaintVerification (community verify events)
```
id, complaint_id (FK), verifier_citizen_id (FK),
verifier_trust_level, verification_weight (0.5/1/2),
verifier_gps_lat, verifier_gps_lng,
distance_from_complaint (metres),
gps_spoofing_detected (boolean),
verified_at
```

### DuplicateInteraction (what happened when shown a duplicate)
```
id, existing_complaint_id (FK),
new_filer_citizen_id (FK),
action_taken (UPVOTED_EXISTING / FILED_NEW / IGNORED),
similarity_score (0.0–1.0),
distance_metres, timestamp
```

### CitizenTrustLog (every score change)
```
id, citizen_id (FK), event_type, score_change,
new_score, related_complaint_id, reason_text, logged_at
```

### PhotoVerificationResult (Gemini Vision analysis)
```
id, complaint_id (FK), photo_url,
matches_complaint_text (boolean),
exif_timestamp, exif_gps_lat, exif_gps_lng,
gps_matches_complaint (boolean),
is_recycled_image (boolean),
gemini_confidence_score (0.0–1.0),
gemini_reasoning, analysed_at
```

---

### 8.3 The Virtuous Cycle This Creates

```
                    MORE USERS
                        ↑
          Every complaint needs 5 verifiers
          Verifiers must download SAMADHAN
                        │
                        ▼
           BETTER QUALITY COMPLAINTS
                        ↑
          GPS-verified, photo-checked,
          community-confirmed tickets
                        │
                        ▼
            HIGHER OFFICIAL TRUST
                        ↑
          Officials know every ticket in
          their queue is real and verified
                        │
                        ▼
             FASTER RESOLUTIONS
                        ↑
          Officials respond because the
          platform has credibility
                        │
                        ▼
          HIGHER CITIZEN TRUST & RETENTION
                        ↑
          Citizens see results → keep using
          → refer neighbours → more verifiers
                        │
                        └───────────────────→ MORE USERS
```

This is the flywheel. Every feature in this section feeds the next. The verification requirement drives downloads. Downloads create verifiers. Verifiers create quality. Quality creates official response. Official response creates citizen trust. Citizen trust creates more downloads.

No other civic app in India has built this loop. **SAMADHAN is the first.**

---

## 9. Core System Architecture — How SAMADHAN Works

The SAMADHAN ecosystem relies on a robust 4-engine pipeline to autonomously classify, route, escalate, and verify civic complaints.

### 9.1 AI Analysis Engine
At the core is the AI Analysis Engine powered by Gemini 2.0 Flash (with a local keyword classifier fallback). It analyzes incoming complaints to determine the correct taxonomy category and dynamically assigns a criticality score (0-100), ensuring issues like a burst water pipe are prioritized over a faded road marking.

### 9.2 Smart Routing Engine
The Smart Routing Engine takes the AI-assigned category and location (ward/district) and maps it directly to the exact Tier 1 official responsible (e.g., Ward Councillor or Junior Engineer). Deadlines are applied based on the complaint's criticality.

### 9.3 Auto-Escalation Engine
A background sweep runs every 60 seconds to track SLA deadlines. If a Tier 1 official misses their resolution window, the engine auto-escalates the ticket to the next tier (e.g., MLA), halves the new deadline window, and deducts penalty points from the negligent official's score.

### 9.4 Resolution & Anti-False-Closure Engine
When an official marks an issue as fixed, the system transitions it to a `PENDING_VERIFICATION` state. The citizen who filed the report must vote YES or NO on the resolution evidence. A NO vote instantly re-opens the ticket, slaps the official with a false-closure penalty, and escalates it.

### 9.5 Accountability Score Engine
Every official is tracked with an Accountability Score. On-time resolutions add points (+10), missed deadlines deduct points (-10), and false closures trigger heavy penalties (-15). This powers the public scoreboard.

### 9.6 Real-Time WebSocket Engine
Built with WebSockets, this engine broadcasts real-time state changes to active dashboards. Map pins update their status instantly, and notification bells ring without manual page refreshes.

### 9.7 Star Rating Engine
Citizen upvotes directly influence an AI-assisted Star Rating formula, which dynamically increases a complaint's visibility based on community interest, ensuring highly requested issues surface to the top of official queues.

### 9.8 DPR Generation Engine
By mapping clustered complaints in the same geography, the system's AI automatically generates a Development Project Report (DPR). MPs can review these clustered reports to effectively allocate their MPLADS budget to systemic problem areas.

### 9.9 Full Complaint Lifecycle End-to-End
The ticket lifecycle flows seamlessly through the states: FILED → ASSIGNED → VIEWED → IN_PROGRESS → ESCALATED (if delayed) → PENDING_VERIFICATION → RESOLVED.

---

## 10. Transparency Engine — Procurement & Contractor Accountability

### 10.1 The Problem: Where Money Disappears in Civic Works

### The Anatomy of a Typical Corrupt Civic Work

```
COMPLAINT FILED (citizen)
         ↓
ACKNOWLEDGED (official)
         ↓
"CONTRACTOR HIRED"
  ← No public record of how contractor was selected
  ← No record of whether 3 quotes were obtained
  ← No record of what the approved amount is
         ↓
"WORK IN PROGRESS"
  ← No phase-wise tracking
  ← No verification that work actually started
  ← Payment often released 100% upfront
         ↓
"WORK COMPLETED"
  ← Official signs off based on contractor's word
  ← Citizen has no verification mechanism
  ← Resolution photo may be of a different location
         ↓
TICKET CLOSED ✅ (in the system)
POTHOLE STILL THERE ❌ (in reality)
MONEY GONE ❌ (into unknown accounts)
```

### Documented Fraud Patterns in India (from research)

| Fraud Type | How It Happens | How Common |
|-----------|---------------|-----------|
| **Inflated Quotations** | Contractor quotes ₹5 lakh for ₹50k job. Official approves without market check | Extremely common at ward level |
| **Single-Vendor Tendering** | Tender published for 2 hours so only "preferred" contractor can respond | Documented in multiple state audits |
| **Bid Rigging / Cartel** | 3 contractors bid but are owned by same person. Rotate wins | CCI has penalized companies for this |
| **Contract Splitting** | ₹10 lakh project split into 4 × ₹2.5 lakh to avoid competitive tender threshold | Standard workaround |
| **Ghost Work** | Payment released, no work done, completion certificate forged | Extremely common in rural areas |
| **Phase Payment Fraud** | 100% payment released at Phase 1. Work stops after. | Contractor disappears |
| **Quality Fraud** | Substandard materials used (thin tar on road, weak cement). Looks complete, fails in 3 months | Endemic in roads and construction |
| **Recycled Photos** | Completion photos from a different (previously repaired) location submitted | Undocumented but widespread |

---

### 10.2 The SAMADHAN Transparency Engine — System Design

SAMADHAN transforms the post-complaint lifecycle from a **black box into a public glass box**. Every rupee, every contractor, every phase, every photo — permanently recorded and publicly visible.

### Core Principle

> **"If a citizen filed it, a citizen can see everything that happens to it — forever."**

No login required to VIEW. Only officials need accounts to ACT.

---

### 10.3 The Five Pillars of the Transparency Engine

---

### PILLAR 1 — The Verified Contractor Registry 🏗️

Before any work can be assigned, a contractor must exist in SAMADHAN's verified registry. This is not a yellow-pages listing — it is a background-checked, category-licensed database.

#### Contractor Categories (matching complaint types)

| Category Code | Works Covered | License Required |
|--------------|--------------|-----------------|
| `CIVIL` | Roads, footpaths, drains, retaining walls, construction | PWD empanelment / contractor license |
| `ELECTRICAL` | Streetlights, transformers, wiring, poles | Electrical Contractor License (CEA) |
| `PLUMBING` | Water pipes, sewage lines, pumping stations | Plumber License (Municipal Corp) |
| `SANITATION` | Garbage collection, waste processing, sweeping | SWM contract eligibility |
| `HORTICULTURE` | Parks, trees, green belts | Horticulture dept empanelment |
| `SIGNAGE` | Road signs, traffic markings, boards | None (open category) |

#### What the Registry Stores Per Contractor

```
ContractorProfile {
    id                   → unique SAMADHAN contractor ID
    legal_name           → registered business name
    gst_number           → verified GST registration
    pan_number           → PAN (cross-checked with IT dept)
    license_number       → category-specific license
    license_valid_until  → expiry date (auto-flagged)
    category             → [CIVIL, ELECTRICAL, PLUMBING, ...]
    tier                 → A/B/C (capacity class, determines
                           max contract value)
    jurisdiction         → which districts/wards they can work in
    performance_score    → 0–100 (starts at 70, earned/lost)
    contracts_completed  → total verified completions
    contracts_defaulted  → total abandoned/fake completions
    active_contracts     → how many currently running
    blacklisted          → boolean (can't receive new contracts)
    blacklist_reason     → documented reason if blacklisted
    bank_account         → verified account for fund release
    documents [ ]        → license scans, GST cert, PAN
    registered_at        → when they joined SAMADHAN
    verified_by          → official who verified their docs
}
```

#### Anti-Shell Company Checks (AI-powered)

Before a new contractor is approved, SAMADHAN's AI runs:
- **GST cross-check** — GST number must match MCA21 database
- **Director overlap detection** — Same director name across multiple registered contractors → flagged for review
- **Address clustering** — Multiple contractors at the same address → flagged as potential shell companies
- **Bank account uniqueness** — Same bank account linked to two contractors → rejected automatically

---

### PILLAR 2 — Mandatory Competitive Bidding (3-Quote Rule) 💰

**No single contractor can ever be directly awarded a contract on SAMADHAN.** The system enforces minimum competition based on estimated work value.

#### Tender Threshold Table

| Estimated Work Value | Minimum Quotes Required | Tender Visibility |
|---------------------|------------------------|-------------------|
| Below ₹10,000 | 1 quote (petty works) | Internal only |
| ₹10,000 – ₹1 lakh | **3 quotes mandatory** | Visible to ward citizens |
| ₹1 lakh – ₹10 lakh | **3 quotes + public tender** | Public (48h minimum open period) |
| ₹10 lakh – ₹1 crore | **5 quotes + public tender** | Public (7 days minimum) |
| Above ₹1 crore | Full DPR + state-level tender | Public (30 days) |

#### The Bidding Process on SAMADHAN

```
STEP 1 — Official creates Work Order from complaint
         Attaches: scope of work, bill of quantities,
                   location, expected completion date
         System auto-calculates: estimated budget
         using AI market rate database
                    │
                    ▼
STEP 2 — Tender published on SAMADHAN Public Board
         Visible to ALL citizens without login
         Open for minimum required duration
         Registered contractors in category notified
                    │
                    ▼
STEP 3 — Contractors submit bids (sealed)
         Each bid contains:
           → Quoted total amount
           → Phase-wise cost breakdown
           → Timeline per phase
           → Materials specification
           → Past work references
         Bids are LOCKED — not visible to other bidders
                    │
                    ▼
STEP 4 — Bid Opening (automated, time-locked)
         At deadline: ALL bids revealed simultaneously
         Visible publicly immediately
         AI runs market rate comparison:
           "AI Market Rate: ₹82,000"
           "Bid 1 (Contractor A): ₹79,000  ← L1"
           "Bid 2 (Contractor B): ₹91,000"
           "Bid 3 (Contractor C): ₹1,45,000 ← Flagged (77% above market)"
                    │
                    ▼
STEP 5 — AI Anomaly Flags (auto-generated)
         Flag types:
           → All 3 bids within 2% of each other → possible collusion
           → Any bid > 40% above AI market rate → inflated
           → Winning contractor has won > 60% of tenders in ward → monopoly alert
           → Bid submitted in final 5 minutes → suspicious timing
                    │
                    ▼
STEP 6 — Official selects contractor
         MUST select L1 (lowest bidder) OR
         document a specific, logged reason for deviation
         Reason is PUBLIC — any citizen can read it
         Any deviation from L1 notifies the tier above
                    │
                    ▼
STEP 7 — Contract Awarded — PUBLICLY POSTED
         Visible to all citizens:
           - Contractor name + SAMADHAN ID
           - Awarded amount
           - Timeline
           - All 3 bids (so citizens can see if L1 was chosen)
           - Official who awarded it
```

#### Anti-Collusion AI Flags

The system continuously monitors for bid-rigging patterns:

```
RED FLAGS (trigger automatic review):
  → 3 bids within 3% of each other
  → Same IP address submitting multiple bids
  → Same contractor winning > 65% of tenders in 1 ward
  → Contractor with 0 previous completions winning high-value tender
  → Bid submitted by contractor outside their licensed jurisdiction
  → Contract value just below public tender threshold (splitting detection)

ORANGE FLAGS (logged for auditors):
  → Winning contractor has family-name match with awarding official
  → Contractor registered < 30 days before submitting first bid
  → Any bid > 35% above AI market rate
  → Tender open period less than required minimum
```

---

### PILLAR 3 — Phase-wise Work Tracking & Milestone Payments 📊

**This is the single most powerful anti-fraud mechanism.** No contractor can receive full payment before work is done. Money flows only when milestones are verified — by a field engineer AND by community members.

#### How Every Contract is Broken Into Phases

When a Work Order is created, the scope is broken into mandatory phases:

```
PHASE 0 — MOBILISATION (10% of total value)
  Contractor receives: 10% advance
  Must provide: Site readiness photo,
                materials procurement proof,
                site hoarding with SAMADHAN QR code
  Deadline: 3 days after contract award

PHASE 1 — GROUNDWORK COMPLETE (25% of total value)
  Contractor receives: Next 25%
  Must provide: Geotagged photos (GPS must match site)
                Field Engineer on-site inspection
                sign-off via SAMADHAN app
  Citizen verification: Any 3 nearby citizens can
                         scan QR code and rate "Is work
                         actually happening?"

PHASE 2 — MID-WORK COMPLETE (25% of total value)
  Same verification as Phase 1
  Additional: Material quality check
              (grade of cement/tar/pipes documented)

PHASE 3 — WORK COMPLETE (30% of total value)
  Contractor must provide:
    → Before + After photos (GPS-verified)
    → Field Engineer sign-off
    → Materials consumption vs quoted
  Community verification:
    → Original complainant notified
    → 5 nearby citizens asked to verify
    → Majority YES required to release payment

PHASE 4 — RETENTION (10% of total value)
  Held for 90 days after completion
  Released ONLY if:
    → No re-complaint about same issue within 90 days
    → Structural integrity inspection passed
  This incentivises quality work — contractor only
  gets final 10% if their work LASTS
```

#### What Citizens See at Each Phase

Every phase is publicly visible on the complaint's page:

```
COMPLAINT #C-2847 — "Burst water pipe, Station Road"

STATUS: PHASE 2 IN PROGRESS

  ════ FINANCIAL TRACKER ════════════════════════
  AI Market Rate:          ₹82,000
  Quoted (L1 Winner):      ₹79,500
  Approved Budget:         ₹79,500
  Released So Far:         ₹27,825 (35%)
  Remaining (locked):      ₹51,675

  ════ CONTRACTOR ════════════════════════════════
  SAMADHAN Contractor ID:     VCR-JH-00847
  Company:                 Sharma & Sons Civil Works
  Performance Score:       78/100
  Contracts Completed:     23  |  Defaulted: 1

  ════ TIMELINE ════════════════════════════════
  [✅] Phase 0 — Mobilisation       Released ₹7,950
       Verified: 12 Aug 2026, 09:14 AM
       Engineer: Ramesh Kumar (SAMADHAN ID: ENG-00124)

  [✅] Phase 1 — Groundwork          Released ₹19,875
       Verified: 14 Aug 2026, 02:30 PM
       Community: 4/5 citizens rated YES ✅

  [🔄] Phase 2 — Mid-work            PENDING
       Contractor submitted photos — awaiting
       field engineer verification
       Expected by: 17 Aug 2026

  [🔒] Phase 3 — Completion          Locked ₹23,850
  [🔒] Phase 4 — Retention           Locked ₹7,950
  ════════════════════════════════════════════════

  [VIEW ALL PHOTOS] [VIEW CONTRACTOR BID] [FLAG ISSUE]
```

---

### PILLAR 4 — The Public Audit Ledger 📒

Every financial transaction in SAMADHAN's civic works system is posted to a **Public Audit Ledger** — a permanent, append-only log. No entry can be edited. No entry can be deleted.

#### What Gets Logged

```
Every entry contains:
  → Timestamp (to the millisecond)
  → Action type
  → Actor (who did this, their SAMADHAN ID)
  → Amount (if financial)
  → Complaint ID
  → Work Order ID
  → Digital signature hash (tamper detection)

Example log for one complaint:

2026-08-10 14:23:11  COMPLAINT_FILED        Citizen C-JH-9831
2026-08-10 14:23:12  AI_ANALYZED            Score:72, Category:Water
2026-08-10 14:23:12  ROUTED_TO              Official MLA-JH-0047
2026-08-11 09:11:00  WORK_ORDER_CREATED     WO-2847, Est: ₹80,000
2026-08-11 09:11:00  TENDER_PUBLISHED       Open until 13 Aug 2026
2026-08-11 09:15:22  BID_RECEIVED           Contractor VCR-JH-00847: ₹79,500
2026-08-12 16:00:00  BID_RECEIVED           Contractor VCR-JH-00201: ₹91,000
2026-08-13 10:45:12  BID_RECEIVED           Contractor VCR-JH-00445: ₹88,500
2026-08-13 11:00:00  BIDS_REVEALED          L1: VCR-JH-00847 (₹79,500)
2026-08-13 11:30:00  CONTRACT_AWARDED       To VCR-JH-00847 by MLA-JH-0047
2026-08-14 08:00:00  PHASE_0_SUBMITTED      Contractor uploaded site photos
2026-08-14 09:14:00  PHASE_0_VERIFIED       Engineer ENG-00124 approved
2026-08-14 09:14:01  PAYMENT_RELEASED       ₹7,950 to A/C ****4821
...
```

#### Why This Is Different from Any Existing System

- **Append-only** — Officials cannot delete an embarrassing log entry
- **Publicly accessible** — RTI request not needed; it's already online
- **Linked to complaint** — Citizen can see the full financial trail from their original report
- **Auditor access** — CAG, Lokayukta, State Audit get read-only API access
- **Journalist access** — Media can pull all transactions for a ward/month as CSV

---

### PILLAR 5 — The Contractor Performance Score 🏆

Just like officials have an Accountability Score, every contractor has a **Performance Score** that determines what contracts they can bid on.

#### Score Mechanics

```
Starting Score: 70 / 100

GAINS:
  +10  Phase completed on time
  +5   Citizen satisfaction rating ≥ 4/5
  +15  Retention payment released (work lasted 90 days)
  +5   Material quality check passed
  +3   Zero re-complaints within 90 days

LOSSES:
  -20  Phase not completed by deadline
  -30  Abandonment (walked off mid-project)
  -40  Ghost work (payment released but no real work found)
  -25  Failed citizen verification (community says work not done)
  -15  Materials substitution detected (quoted Grade A, used Grade C)
  -10  QR code tampered with / GPS coordinates spoofed
  -50  BLACKLISTED (score drops to 0, cannot bid for 3 years)
```

#### Score-Based Access Tiers

```
Score 85–100  → Tier A: Can bid on contracts up to ₹1 crore
Score 70–84   → Tier B: Can bid on contracts up to ₹25 lakh
Score 50–69   → Tier C: Can bid on contracts up to ₹5 lakh
Score 30–49   → Restricted: Only petty works under ₹50,000
Score Below 30 → Suspended: Cannot bid until reviewed
Score = 0     → BLACKLISTED: Cannot bid for 3 years
```

#### Public Contractor Card (visible to everyone)

```
╔═══════════════════════════════════════════════╗
║  SAMADHAN VERIFIED CONTRACTOR                    ║
║  Sharma & Sons Civil Works                    ║
║  VCR-JH-00847  |  Category: CIVIL            ║
║  Tier: B  |  Jurisdiction: Ranchi District    ║
╠═══════════════════════════════════════════════╣
║  Performance Score:  78 / 100  ████████░░    ║
║  Contracts Won:      31                       ║
║  Completed On Time:  23  (74%)                ║
║  Avg Citizen Rating: 3.8 / 5                  ║
║  Quality Flags:      2                        ║
║  Blacklisted:        NO                       ║
╠═══════════════════════════════════════════════╣
║  Recent Work:                                 ║
║  ✅ Drain repair, Ward 7       Aug 2026        ║
║  ✅ Road patch, MG Road        Jul 2026        ║
║  ⚠️ Pipe work, Lalpur          Jun 2026        ║
║     (Delayed 12 days, -20 pts)                ║
╚═══════════════════════════════════════════════╝
```

---

### 10.4 The Transparency Engine Workflow — End to End

```
CITIZEN FILES COMPLAINT
         │
         ▼
AI ANALYSIS + ROUTING (existing SAMADHAN engine)
         │
         ▼
OFFICIAL VIEWS COMPLAINT
         │
         ▼
OFFICIAL CREATES WORK ORDER
  ├── Scope of work (text + photos)
  ├── Bill of Quantities
  ├── AI-estimated market rate
  └── Phase breakdown
         │
         ▼
SYSTEM CHECKS WORK VALUE
  ├── < ₹10k → Skip tender, direct assign
  └── > ₹10k → Mandatory tender process
         │
         ▼
TENDER PUBLISHED (PUBLIC)
  Citizens can see it immediately
  Duration locked by system (cannot be shortened)
         │
         ▼
BIDS RECEIVED (SEALED)
  Contractors submit independently
  System detects duplicate IPs / collusion signals
         │
         ▼
BIDS REVEALED (AUTOMATED at deadline)
  All bids public simultaneously
  AI flags anomalies
         │
         ▼
CONTRACT AWARDED
  Official selects contractor
  Must choose L1 OR document deviation (public)
  Deviation notifies tier above
         │
         ▼
CONTRACT SIGNED (digital)
  Phase schedule confirmed
  Payment schedule locked
  QR code generated for site
         │
         ┌────────────────────────────────────────┐
         │         PHASE EXECUTION LOOP            │
         │                                        │
         │  Contractor marks phase complete       │
         │           │                            │
         │           ▼                            │
         │  Uploads geotagged photos              │
         │  (GPS must be within 200m of site)     │
         │           │                            │
         │           ▼                            │
         │  Field Engineer dispatched             │
         │  Inspects site physically              │
         │  Signs off on SAMADHAN app                │
         │           │                            │
         │           ▼                            │
         │  Community notified (5 nearby          │
         │  citizens scan QR / get push notif)    │
         │  Rate: Is work actually done?          │
         │           │                            │
         │     ┌─────┴──────┐                    │
         │    YES           NO                   │
         │     │             │                   │
         │     ▼             ▼                   │
         │  Payment       Phase rejected         │
         │  Released      Contractor must redo   │
         │  (milestone)   Score penalty applies  │
         │                                        │
         │  Repeat for each phase                 │
         └────────────────────────────────────────┘
                      │
                      ▼ (after final phase)
         90-DAY RETENTION PERIOD
         System monitors for re-complaints
         about same issue at same location
                      │
             ┌────────┴──────────┐
         No re-complaint      Re-complaint filed
             │                    │
             ▼                    ▼
         Final 10%            Retention withheld
         released             Contractor score -20
                              Issue reassigned
                              (contractor liability)
                      │
                      ▼
         COMPLAINT FULLY RESOLVED
         Full audit trail publicly accessible
         forever in the Public Ledger
```

---

### 10.5 Public Transparency Dashboard (No Login Needed)

Any citizen, journalist, RTI activist, or opposition politician can visit SAMADHAN's public dashboard and see:

### Ward-Level Finance Tracker
```
WARD 7 — RANCHI EAST
Month: August 2026

  Total Complaints Filed:        127
  Work Orders Created:            43
  Total Funds Committed:      ₹28.4 lakh
  Total Funds Released:       ₹11.2 lakh
  Funds Pending Milestone:    ₹17.2 lakh

  Active Contracts:               18
  Completed This Month:           11
  Abandoned/Flagged:               2  ← CLICKABLE

  Most Spent Category:    Roads (₹9.1 lakh)
  Avg Work Quality Score: 3.6 / 5
  Contractor Diversity:   7 unique contractors
```

### Anomaly Alerts Feed (Public)
```
🚨 ALERT — Aug 14, 2026
   Contractor VCR-JH-00201 won 8 of last 10 tenders in Ward 3
   Above 65% threshold — under review

⚠️  ALERT — Aug 12, 2026
   Bid for WO-2891 (Road repair, ₹1.2L) was 91% above AI market rate
   All 3 bids within 4% of each other — possible collusion flagged
   Referred to District Collector for review

✅ RESOLVED — Aug 10, 2026
   Contractor VCR-JH-00103 debarred for 6 months
   Reason: Ghost work on WO-2756 (funds released, no work found)
```

### The "Show Me the Money" Feature

Any citizen can type in a complaint number and see the complete financial trail:

```
Complaint #C-2847  →  Work Order WO-2847  →  Contract awarded ₹79,500
  └── Phase 0: ₹7,950 released → Aug 14, 09:14 AM
  └── Phase 1: ₹19,875 released → Aug 16, 02:30 PM  ← TODAY
  └── Phase 2: PENDING (₹19,875 locked)
  └── Phase 3: LOCKED (₹23,850)
  └── Phase 4: LOCKED — 90 day retention (₹7,950)

Every rupee accounted for. Click any phase to see verification photos.
```

---

### 10.5 Anti-Fraud Mechanisms Summary

| Fraud Type | SAMADHAN's Prevention | What Happens if Caught |
|-----------|-------------------|----------------------|
| Inflated quotation | AI market rate shown alongside every bid | Bid publicly flagged, auditor notified |
| Single-vendor tendering | System blocks contract creation if < 3 bids | Official cannot proceed, tier above notified |
| Bid rigging / cartel | AI collusion detection (bids within 3%, same IP) | All bids voided, re-tender mandatory |
| Contract splitting | System detects multiple WOs for same location | Auto-merged, full tender required |
| Ghost work | GPS-verified photos + community verification required | Payment blocked, contractor blacklisted |
| Payment before work | Phase-locked payments — system won't release without sign-off | Technically impossible to bypass |
| Recycled photos | GPS metadata of photo must match site location | Photo rejected if GPS doesn't match |
| Fake completion | 90-day retention + community re-rating | Retention withheld, complaint reopened |
| Relationship-based award | Official-contractor relationship flag | Deviation logged publicly, escalated |
| Shell companies | GST + director + address cross-checks | Registration rejected |
| Quality substitution | Material grade documented at each phase | Contractor score penalised, engineer liable |

---

### 10.6 New Data Models Required

### ContractorProfile
```
id, legal_name, gst_number, pan_number, category[ ],
license_number, license_valid_until, tier (A/B/C),
jurisdiction[ ], performance_score, contracts_completed,
contracts_defaulted, active_contracts, blacklisted,
blacklist_reason, bank_account_verified, documents[ ],
registered_at, verified_by_official_id
```

### WorkOrder
```
id, complaint_id (FK), created_by_official_id,
scope_of_work, bill_of_quantities{ },
ai_market_rate_estimate, approved_budget,
phases[ ] → { phase_num, description, value,
              status, deadline, verified_by,
              photos[ ], citizen_votes{ } },
status (DRAFT/TENDERING/AWARDED/IN_PROGRESS/COMPLETE),
created_at, awarded_at
```

### Tender
```
id, work_order_id (FK), published_at, closes_at,
minimum_bids_required, bids[ ] → { contractor_id,
    amount, phase_breakdown{ }, timeline_days,
    submitted_at, ip_hash },
ai_flags[ ], awarded_to_contractor_id,
awarded_by_official_id, award_reason (if deviation from L1)
```

### PublicLedgerEntry
```
id (append-only, sequential), timestamp (immutable),
action_type, actor_id, actor_role, complaint_id,
work_order_id, amount_inr, hash (SHA-256 of previous
entry + this entry content → chain integrity)
```

### ContractorPerformanceLog
```
id, contractor_id (FK), work_order_id (FK),
event_type, score_change, new_score, reason, logged_at
```

---

### 10.7 How This Changes SAMADHAN's Value Proposition

Before the Transparency Engine, SAMADHAN was:
> *"A better way to file and track complaints"*

After the Transparency Engine, SAMADHAN becomes:
> *"The only platform where citizens can watch every rupee of their tax money from the moment a complaint is filed to the moment the work is verified — and hold both officials AND contractors accountable if it disappears."*

This is no longer a grievance portal. **This is a civic financial accountability operating system.**

### Impact on Revenue Model

The Transparency Engine dramatically strengthens every revenue stream:

| Revenue Stream | How Transparency Engine Helps |
|---------------|------------------------------|
| Government SaaS | States WANT to show they have this — political optics are huge |
| CAG / Audit integration | Auditors pay for API access to the public ledger |
| RTI reduction | Govt saves crores on RTI responses — all data already public |
| World Bank / UNDP grants | "Digital public expenditure tracking" is a core grant category |
| Anti-corruption NGOs | CSO partnerships for monitoring and reporting |
| Media partnerships | News organisations pay for bulk data access / alerts |

### The Political Reality

A Chief Minister or MLA who deploys SAMADHAN with the Transparency Engine can say:

> *"Every rupee spent on civic works in my constituency is visible to every citizen on their phone. No contractor can run away with government money. No official can give a contract to their nephew. The public ledger shows every bid, every payment, every phase — forever. Try that with any other state."*

That is an election-winning statement. And it is exactly what SAMADHAN delivers.

---

## 11. What Makes SAMADHAN Unique

The civic tech space is crowded with complaint portals, but SAMADHAN is the only platform that fundamentally shifts power to the citizen through verification and transparency.

**The 7 Genuine Differentiators:**
1. **Citizen-Mandated Closure:** The official cannot unilaterally close a ticket; only the citizen's YES vote can mark an issue as fully resolved.
2. **Community Verification:** Replaces centralized validation by requiring 5 GPS-verified citizens to confirm an issue before it enters an official's queue.
3. **Automated Escalation with Halving Deadlines:** Missed SLAs trigger automatic escalation to higher tiers with an increasingly tighter timeframe.
4. **Public Accountability Scoreboard:** Gamifies government performance by publicly ranking officials based on resolution rates and false closures.
5. **Phase-Wise Transparency Engine:** Publishes every contractor bid, phase payment, and milestone completion to a permanent public ledger.
6. **AI DPR Generation for MPLADS:** Clusters unresolved, chronic local complaints to propose macro infrastructure projects directly to MPs for their constituent funds.
7. **Anti-Fake-Ticket Authenticity Stack:** Integrates live GPS geofencing and Gemini Vision AI to authenticate photos and filter out duplicates and spam instantly.

**Comparison Table:**

| Feature | CPGRAMS | Swachhata App | FixMyStreet | SAMADHAN |
|---------|---------|---------------|-------------|-------|
| Official can close ticket unilaterally | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Citizen verification required for closure | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Publicly ranks official performance | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Live tender & contractor tracking | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Auto-escalates to higher authorities | ❌ No | ❌ No | ❌ No | ✅ Yes |

**The Single Pitch Line:**
*SAMADHAN is not a grievance portal; it is an accountability operating system that forces resolution by putting the ticket closure button exclusively in the hands of the citizen.*

---

## 12. Revenue Model

SAMADHAN's architecture provides massive value not just to citizens but to government administration, oversight bodies, and corporate partners. The revenue model leverages this ecosystem.

| Revenue Stream | Description |
|----------------|-------------|
| **B2G SaaS Licensing** | A core subscription model for state governments and large municipal corporations to license the SAMADHAN platform, customized for their jurisdictions. |
| **Implementation + AMC** | Onboarding fees for initial database seeding, custom integrations with existing state SSO portals, and an Annual Maintenance Contract for support. |
| **Civic Data Intelligence Reports** | Monetizing the macro-analytics dashboard by offering deep-dive civic health reports, predictive infrastructure failure models, and ward-wise trend analysis to policy institutes and urban planning departments. |
| **Corporate CSR Ward Adoption** | Corporations can sponsor or "adopt" a ward through CSR funds. The Transparency Engine tracks these funds transparently, allowing corporations to fund projects clustered by citizen complaints. |
| **White-label Licensing** | Licensing the underlying software engine (minus the SAMADHAN branding) to specialized civic bodies, Smart City SPVs, or international municipal organizations. |
| **MPLADS DPR Facilitation Fee** | A minor transaction or facilitation fee attached to the seamless end-to-end generation and management of Development Project Reports (DPRs) that result in authorized MPLADS expenditure. |

**SIH Pitch Paragraph:**
SAMADHAN's financial sustainability is rooted in its ability to save state governments millions of rupees lost to contractor fraud and duplicate efforts. By adopting our B2G SaaS and AMC model, governments can dramatically reduce RTI requests and streamline their civic expenditure. The true upside lies in data intelligence and CSR integration, ensuring that as the user base scales, SAMADHAN creates a self-sustaining ecosystem of funded, transparent local development.

---

## 13. Current Build Status

### 13.1 Backend — What Is Built
| Component | Status | File |
|-----------|--------|------|
| MongoDB custom ORM adapter | ✅ Complete | `backend/database.py` |
| Citizen OTP login (mock OTP: 123456) | ✅ Working | `backend/routes/auth.py` |
| Official email/password login | ✅ Working | `backend/routes/auth.py` |
| Official registration / signup | ✅ Working | `backend/routes/auth.py` |
| Complaint creation (CRUD) | ✅ Working | `backend/routes/complaints.py` |
| Complaint status updates | ✅ Working | `backend/routes/complaints.py` |
| Community upvoting | ✅ Working | `backend/routes/complaints.py` |
| Gemini AI complaint analysis | ✅ Working | `backend/services/gemini_service.py` |
| Keyword fallback classifier | ✅ Working | `backend/services/gemini_service.py` |
| Auto-routing by criticality | ✅ Working | `backend/services/routing.py` |
| Resolution submission (with evidence) | ✅ Working | `backend/routes/resolution.py` |
| Citizen YES/NO verification | ✅ Working | `backend/routes/resolution.py` |
| False closure detection | ✅ Working | `backend/routes/resolution.py` |
| Auto-escalation deadline sweep | ✅ Working | `backend/services/escalation.py` |
| WebSocket connection manager | ✅ Built | `backend/main.py` |
| Database seed data | ✅ Working | `backend/seed_data.py` |
| Docker multi-stage build | ✅ Complete | `Dockerfile` |
| `.env.example` template | ✅ Complete | `.env.example` |

### Frontend (React 19 + Vite)

| Component | Status | File |
|-----------|--------|------|
| Landing / Portal page | ✅ Working | `src/pages/Portal.jsx` |
| Citizen login (OTP flow) | ✅ Working | `src/pages/CitizenLogin.jsx` |
| Official login (email/password) | ✅ Working | `src/pages/OfficialLogin.jsx` |
| Official dashboard (real API data) | ✅ Working | `src/pages/OfficialDashboard.jsx` |
| Complaint detail view | ✅ Working | `src/pages/ComplaintDetail.jsx` |
| MLA dashboard (real API data) | ✅ Working | `src/pages/MlaDashboard.jsx` |
| MP Overview (real API data) | ✅ Working | `src/pages/MpOverview.jsx` |
| MLA Accountability Scoreboard | ✅ Working | `src/pages/MpMlaScoreboard.jsx` |
| Escalations view | ⚠️ Partial | `src/pages/Escalations.jsx` — uses mock data |
| Constituency Map | ⚠️ Partial | `src/pages/Constituency.jsx` — static CSS, not Leaflet |
| LiveMap Leaflet component | ✅ Built | `src/components/map/LiveMap.jsx` — NOT wired in |
| Notification Bell (WebSocket) | ✅ Built | `src/components/NotificationBell.jsx` |
| Toast notification system | ✅ Built | `src/components/Toast.jsx` |
| Citizen Home page | 🔴 Placeholder | `src/pages/CitizenHome.jsx` — "Under Construction" |
| Citizen Report (voice-to-text) | ⚠️ Partial | `src/pages/CitizenReport.jsx` — fake typing animation |
| Citizen Issues view | ✅ Working | `src/pages/CitizenIssues.jsx` |
| Citizen Analytics | 🔴 Placeholder | `src/pages/CitizenAnalytics.jsx` — "Under Construction" |
| MP Priority Ranker | ⚠️ Partial | `src/pages/MpPriorityRanker.jsx` — hardcoded data |
| Official Analytics (DPR view) | ⚠️ Partial | `src/pages/Analytics.jsx` — hardcoded mock projects |
| Auth Guard (route protection) | 🔴 Missing | `src/services/authGuard.jsx` — exists but not applied |
| Role-based layouts | ✅ Working | `CitizenLayout`, `MlaLayout`, `MpLayout`, `OfficialLayout` |

---

### 13.2 What Still Needs to Be Built

Organized by priority. Items marked 🔴 CRITICAL will cause demo failures if not fixed.

---

### CRITICAL BUGS (Must fix first — these will crash or silently break the app)

#### BUG-01 — SQLAlchemy import crash 🔴
- **Files:** `backend/services/escalation.py`, `backend/services/routing.py`
- **Problem:** Both files import `from sqlalchemy.orm import Session` — a relational DB ORM. SAMADHAN uses MongoDB. This will crash the backend on startup.
- **Fix:** Remove the import. Replace `Session` type hint with the MongoDB session adapter from `backend/database.py`.

#### BUG-02 — .env variables never loaded 🔴
- **File:** `backend/main.py`
- **Problem:** `python-dotenv` is in `requirements.txt` but `load_dotenv()` is never called. This means `GEMINI_API_KEY` is always `None`. The AI engine falls back to keyword rules silently.
- **Fix:** Add `from dotenv import load_dotenv; load_dotenv()` at the very top of `main.py`.

#### BUG-03 — WebSocket broadcast never fires 🔴
- **File:** `backend/routes/complaints.py`
- **Problem:** The WebSocket connection manager exists in `main.py` but is never called after a complaint is created or updated. The live map and notification bell are permanently dead as a result.
- **Fix:** After `create_complaint()` succeeds, call `request.app.state.notify_clients("NEW_COMPLAINT", {...})`.

#### BUG-04 — No auth guard on any route 🔴
- **File:** `src/App.jsx`
- **Problem:** Any person can navigate directly to `/mla/dashboard` or `/mp/overview` in the URL bar without being logged in.
- **Fix:** Wrap all protected route groups in `<AuthGuard requiredRole="MLA">` etc. in App.jsx.

---

### HIGH PRIORITY — Complete Core Features

#### FEAT-01 — Wire LiveMap into Constituency.jsx
- The `<LiveMap />` Leaflet component is already built in `src/components/map/LiveMap.jsx`.
- `Constituency.jsx` currently uses a hand-drawn CSS "map" with fake static pins.
- **Action:** Replace the static map div with `<LiveMap />`. Wire the sidebar panel to show real complaint data on pin click.

#### FEAT-02 — Real Voice-to-Text in CitizenReport.jsx
- Currently uses a fake typing animation that does not actually transcribe speech.
- **Action:** Implement `window.SpeechRecognition` (Web Speech API). Fallback to text input on unsupported browsers.
- **Bonus:** Add `lang="hi-IN"` for Hindi support — massive demo differentiator.

#### FEAT-03 — Complete CitizenHome.jsx
- Currently shows "Under Construction".
- **Needs:**
  - Welcome banner with citizen's name and ward
  - Quick stats: complaints filed, resolved, pending
  - Recent activity feed
  - Quick action cards: File Report, View My Issues, Edit Profile
  - Top complaints in their ward (community upvote leaderboard)

#### FEAT-04 — Complete CitizenAnalytics.jsx
- Currently shows "Under Construction".
- **Needs:**
  - Personal complaint timeline (filed vs resolved over time)
  - Ward performance vs other wards
  - Average resolution time on their complaints
  - Reward points history
  - Verification summary (how many false closures they caught)

#### FEAT-05 — Replace Mock Data in Escalations.jsx
- Currently imports from `mockComplaints.js`.
- **Action:** Replace with `api.getComplaints({ status: 'ESCALATED' })` call.

#### FEAT-06 — Replace Mock Data in Analytics.jsx and MpPriorityRanker.jsx
- Both use hardcoded project cards.
- **Action:** Build `GET /api/projects` backend endpoint. Wire both pages to fetch from it.
- **Action:** Build `POST /api/projects/generate` — AI generates DPR from clustered complaints.

---

### MEDIUM PRIORITY — Polish & Hardening

#### FEAT-07 — Real JWT Authentication
- Currently backend issues fake string tokens with no expiry or validation.
- **Action:** Use `python-jose` to generate real JWT tokens. Add `get_current_user` dependency on protected routes.
- **Action:** Hash passwords with `bcrypt` instead of plaintext comparison.

#### FEAT-08 — Ward Councillor and Local Body Tier
- Currently only MLA, MP, Collector, Ministry roles exist in the backend.
- **Action:** Add `WARD_COUNCILLOR` and `GRAM_PANCHAYAT` roles to the officials model.
- These become Tier 1 responders — complaints are routed here FIRST before MLAs.

#### FEAT-09 — Mobile Responsive Design
- Judges will likely open SAMADHAN on a phone during the presentation.
- **Action:** Add `@media` breakpoints in `index.css` for 768px (tablet) and 480px (mobile).
- Citizen portal (filing reports, checking status) must work perfectly on mobile.
- Official dashboards can be tablet-first with a collapsible sidebar.

#### FEAT-10 — File Upload for Photos
- Resolution submission requires photo evidence but no upload endpoint exists.
- **Action:** Add `POST /api/upload` endpoint. Store locally or on Cloudinary.
- Citizens also need to be able to attach photos when filing the original complaint.

#### FEAT-11 — 404 Page
- No catch-all route. Invalid URLs show a blank white screen.
- **Action:** Add `<Route path="*" element={<NotFound />} />` in App.jsx.
- Build `NotFound.jsx` with glitch animation matching SAMADHAN's dark theme.

---

### BONUS (Win-boosters if time allows)

| Feature | Why It Matters |
|---------|---------------|
| Hindi voice input (`lang="hi-IN"`) | Shows inclusivity — key SIH criterion |
| Real SMS OTP via MSG91 / Twilio | Replaces hardcoded `123456` — more credible demo |
| Public transparency dashboard (no login) | Citizens and press can see district-wide performance without logging in |
| Heatmap overlay on constituency map | Visual cluster of problem zones — stunning for demo |
| PDF export of resolution reports | MPs and Collectors can download formal reports |
| Push notifications (PWA) | Citizens get notified when their complaint status changes |
| MPLADS fund allocation suggestion | AI maps top complaint clusters to budget line items the MP can authorize |

---

## 14. Open Design Questions

### Q1 — Ward Councillor as First Responder?
### Q1 — Ward Councillor as First Responder?
**Question:** Should complaints first go to Ward Councillors (urban) / Sarpanch (rural) before MLAs, or go directly to MLAs?

**Argument for Councillor-first:** They are closest to the problem, have local staff, and MLAs should not manage individual potholes.

**Argument against:** Councillors have the least accountability; many wards have inactive councillors. Routing to them first may delay escalation to someone who can actually act.

**Current SAMADHAN behavior:** Routes to MLA as Tier 1. Ward Councillor is planned but not built.

**Recommendation:** Add Ward Councillor as Tier 1A with a short deadline (48h). If no action, auto-escalates to MLA. This matches real-world governance structure.

---

### Q2 — Verification Timeout Behavior
**Question:** If a citizen does not verify within 48 hours, should the complaint be auto-resolved or remain pending?

**Current SAMADHAN behavior:** Auto-resolves (benefit of the doubt to official).

**Alternative:** Remain pending until citizen responds — creates a better incentive for officials to follow up with citizens directly.

**Risk of auto-resolve:** Opens a loophole where officials wait for citizens to forget and auto-resolve happens.

**Recommendation:** Auto-resolve after 72h (not 48h), but require at least 2 reminder notifications before auto-resolving.

---

### Q3 — Public vs Private Complaint Data
**Question:** Should complaint locations and descriptions be publicly visible (like FixMyStreet) or private to the citizen and assigned officials?

**Argument for public:** Transparency builds trust; community can upvote and verify; press can monitor.

**Argument for private:** Privacy of citizens who may be reporting sensitive issues (domestic issues, caste-based discrimination, etc.); fear of retaliation in small communities.

**Recommendation:** Complaint TYPE and location are public. Citizen identity and contact information are private (shown only to the assigned official after formal assignment).

---

### Q4 — MPLADS Integration Depth
**Question:** Should SAMADHAN just suggest MPLADS-eligible projects, or actually integrate with the MPLADS portal?

MPLADS (Member of Parliament Local Area Development Scheme) gives each MP ₹5 crore/year for local development. SAMADHAN can AI-generate project proposals based on complaint clusters, but actual fund release requires integration with the Ministry of Statistics and PI portal.

**Recommendation for SIH:** Show AI-generated DPR as a downloadable PDF; actual MPLADS portal integration is a Phase 2 feature.

---

### Q5 — What Happens to Habitual False-Closure Officials?
**Question:** If an official accumulates, say, 5 false closure penalties, what happens beyond score reduction?

**Options:**
- Alert sent to their supervisor (District Collector / MLA)
- Account temporarily suspended pending review
- Public "Red Flag" badge on their profile visible to all
- Automatic escalation of ALL their future complaints to higher tier

**Recommendation:** Three strikes system:
- Strike 1: Score penalty + supervisor alert
- Strike 2: Score penalty × 2 + mandatory review flag
- Strike 3: All complaints auto-escalated to next tier; account under review

---

*Last updated: August 2026 | Team H2K | SIH25031 — Government of Jharkhand*

---

---

# SECTION 15 — BUSINESS MODEL, CONTRACTOR PORTAL & COMPANY OPERATIONS

> **Scope note:** The AI cost estimation feature (generating repair cost estimates at ticket-filing time) is noted as a future scalability idea only. It is NOT part of the MVP. The platform's core focus remains the problem statement: SIH25031 — Crowdsourced Civic Issue Reporting and Resolution System.

---

## 15.1 Business Model — How SAMADHAN Makes Money

SAMADHAN operates on three partner relationships. Only two of them pay.

```
┌─────────────────────────────────────────────────────────────────┐
│  GOVERNMENT   →  Pays SAMADHAN    →  Gets accountability platform  │
│  CONTRACTOR   →  Pays SAMADHAN    →  Gets verified work pipeline   │
│  CITIZEN      →  Always Free   →  Gets civic power              │
└─────────────────────────────────────────────────────────────────┘
```

---

### REVENUE STREAM 1 — Government SaaS License (Primary)

Government pays annually per district. Each district = one licensing unit.

```
Pricing model (per district/year):
  Tier 1 city district (pop. > 10 lakh):   ₹15 lakh/year
  Tier 2 district (pop. 5–10 lakh):        ₹10 lakh/year
  Tier 3 / rural district (< 5 lakh):      ₹6 lakh/year

Jharkhand:
  24 districts × avg ₹8 lakh = ₹1.92 crore ARR
  (1 state alone, Year 1 target)

Scale:
  All India 800 districts × avg ₹8 lakh = ₹640 crore ARR potential
```

**Why the government pays:**
- Demonstrates accountability to citizens before elections
- Satisfies Digital India compliance requirements
- Reduces RTI (Right to Information) load — data already public
- Qualifies for Smart City Mission and AMRUT funding with digital grievance proof
- Performance data justifies budget allocation for infrastructure

**How to acquire the first government client (Go-to-Market):**
```
STEP 1 → Win SIH 2024 (Government of Jharkhand PS)
         → Jharkhand government gives a pilot district free

STEP 2 → Run 6-month pilot with measurable outcomes
         → Track: complaints filed, resolved, false closures caught
         → Publish district health report

STEP 3 → Pilot data = sales pitch
         → Convert pilot to paid SaaS contract (AMC)
         → Expand to other Jharkhand districts

STEP 4 → Use Jharkhand as reference to pitch other states
         → Bihar, UP, Odisha have similar governance structures

STEP 5 → White-label the platform for other states
         → State pays SAMADHAN, launches as their own branded app
```

---

### REVENUE STREAM 2 — Contractor Registration Fee (Early Revenue)

Every contractor who wants to receive work orders through SAMADHAN pays an annual registration fee to be listed in the Verified Contractor Registry.

```
Tier C (small contractors, up to ₹5L contracts):  ₹3,000/year
Tier B (medium contractors, up to ₹25L):           ₹8,000/year
Tier A (large contractors, up to ₹1 crore):        ₹20,000/year

Why contractors pay:
  → Direct pipeline of government work orders in their dashboard
  → No middlemen, no bribing officials to get visibility
  → Verified badge increases their win rate
  → One-time verification effort, renewable annually

Ranchi Municipal Corp alone: ~200 registered contractors
  200 × avg ₹8,000 = ₹16 lakh/year from one city
```

**Registration fee is non-negotiable and publicly listed.** No official can waive it in exchange for a favour. The published rate is the rate.

---

### REVENUE STREAM 3 — Platform Fee on Work Orders (Scalable)

Once volume is established: a 1% platform facilitation fee on every work order awarded through SAMADHAN. Deducted automatically from Phase 0 payment release.

```
Example calculation:
  Ranchi district: 500 complaints/month with work orders
  Average work order value: ₹50,000
  Monthly contract value via SAMADHAN: ₹2.5 crore
  SAMADHAN 1% fee: ₹2.5 lakh/month
  Annual from Ranchi alone: ₹30 lakh

  At scale (24 districts):
  ₹30 lakh × 24 = ₹7.2 crore/year

  This grows automatically as the platform succeeds.
  More resolved complaints = more revenue for SAMADHAN.
  SAMADHAN's financial incentive = platform working well.
```

The platform fee is paid by the contractor, deducted before payment reaches their bank account. Citizens never pay. Government pays only the annual license.

---

### REVENUE STREAM 4 — Civic Data Intelligence Reports

Quarterly district governance reports sold to:

| Buyer | Report Content | Price |
|-------|---------------|-------|
| State Planning Dept | Which 20 districts need priority infrastructure spend | ₹5–15 lakh/report |
| MPs / MLAs | Constituency civic health score vs peers | ₹1–2 lakh/quarter |
| Smart City SPVs | Real-time complaint density for city planning | ₹10–25 lakh/year |
| World Bank / UNDP | Governance quality research dataset | USD 50k+ grants |
| Journalists / NGOs | Public interest rate (discounted/free) | ₹0–50,000 |

Data is generated as a byproduct of the platform running. Packaging it as reports is a near-zero-cost, high-margin business.

---

### REVENUE STREAM 5 — White-Label Licensing (Year 3+)

Other state governments buy SAMADHAN's platform and launch it under their own brand:
- "Kerala CivicLink" powered by SAMADHAN
- "UP Jan Suvidha" powered by SAMADHAN
- Bangladesh, Nepal, Sri Lanka (same administrative challenges)

White-label fee: ₹50–2 crore one-time setup + annual license.

---

### Partnership Structure Summary

```
WITH GOVERNMENT:
  1. Sign MoU for free pilot (6 months)
  2. SAMADHAN provides full platform + onboarding support
  3. Government provides: official accounts, contractor data migration
  4. After pilot: convert to paid SaaS AMC (3-year contract)
  5. Performance KPIs written into contract
     (if resolution rates don't improve → partial refund clause)

WITH CONTRACTORS:
  1. Government onboards contractors into the registry
  2. Contractors register, pay annual fee, get verified
  3. Platform fee deducted automatically from work order payments
  4. Contractors who perform well get priority notifications
  5. Contractors can upgrade tier to access higher-value contracts

WITH CITIZENS:
  1. Always free. No subscription. No in-app purchases.
  2. Citizens are the quality control mechanism, not customers.
  3. High citizen engagement = higher platform value = stronger
     government and contractor contract negotiations.
```

---

## 15.2 Contractor Portal — Full Design

Contractors are a distinct user role on SAMADHAN with their own login and dashboard. This is non-negotiable for the Transparency Engine to function.

**Why contractors must be on the platform:**
Without a contractor portal, work orders are communicated via WhatsApp, phone calls, or handwritten notes. That is exactly the corruption channel SAMADHAN is designed to eliminate. Every contractor interaction — quote submission, phase completion, payment receipt — must happen inside SAMADHAN's audited system.

### Contractor User Role

```
ContractorProfile {
  company_name, gst_number, pan_number
  login_email, login_password (hashed)
  category[ ]         → [CIVIL, ELECTRICAL, PLUMBING, SANITATION...]
  tier                → A / B / C
  jurisdiction[ ]     → districts and wards they can work in
  workforce_count     → current available workers
  equipment_list[ ]   → JCB, roller, dumper, drilling rig etc.
  max_active_contracts → capacity limit
  performance_score   → 0–100
  bank_account        → verified, for payment release
  license_documents[ ]→ uploaded by government official
  license_expiry      → auto-flagged 30 days before
  status              → ACTIVE / WARNING / SUSPENDED / BLACKLISTED
}
```

### Contractor Dashboard

```
SAMADHAN CONTRACTOR PORTAL
Kumar Civil Works  |  VCR-JH-00847  |  Tier B  |  Ranchi District

  Performance Score:  78 / 100   ████████░░
  Active Contracts:   3   (Max capacity: 5)
  Completed (total):  23   |  Avg Citizen Rating: 3.8★
  Pending Payments:   ₹47,250 (Phase 3 of WO-2847)

  ── NEW WORK ORDERS IN YOUR CATEGORY ──────────────────────────
  
  📍 WO-3041  Pothole repair, Ward 7        [SUBMIT QUOTE →]
     Category: CIVIL | Posted: 28 min ago
     2 other contractors have quoted
  
  📍 WO-3038  Drain unblocking, Ward 12     [SUBMIT QUOTE →]
     Category: CIVIL | Posted: 2h ago
     4 other contractors have quoted. Deadline: 6h remaining.
  
  ── MY ACTIVE CONTRACTS ────────────────────────────────────────
  
  WO-2891  Road resurfacing, Ward 3   Phase 2 of 5  [UPLOAD PHOTOS]
           Next payment: ₹19,875 (on Phase 3 approval)
  
  WO-2847  Pipe repair, Station Rd    Phase 3 of 5  [UPLOAD PHOTOS]
           Field engineer assigned. Awaiting their visit.
  
  WO-2801  Footpath, MG Road          Phase 5 of 5  COMPLETE ✅
           Retention period: 67 days remaining
           Retention payment: ₹7,950 locked until day 90
```

### What Contractors See and Can Do

```
CAN SEE:
  → New work orders in their category and jurisdiction
  → How many other contractors have already quoted
  → Their own quote history and outcomes
  → Phase-by-phase payment status
  → Their performance score and what's affecting it
  → Community verification results on their completed work
  → Feedback notes from field engineers

CAN DO:
  → Submit quotes with phase-wise cost breakdown
  → Upload geotagged, timestamped photos for each phase
  → Mark phases as complete (triggers engineer verification)
  → Message field engineer through the platform (no WhatsApp)
  → Download payment receipts

CANNOT DO:
  → See other contractors' quotes before the official decides
  → Edit a submitted quote after submission
  → See which official will make the decision
  → Contact the official directly through SAMADHAN
    (all communication is via the work order thread, logged)
```

### Government Contractor Management Panel

Officials at Municipal Commissioner / BDO level have a registry management panel:

```
CONTRACTOR REGISTRY — Ranchi District
[+ ADD NEW CONTRACTOR]   [BULK IMPORT CSV]   [EXPORT REPORT]

Filter: Category ▼  Tier ▼  Status ▼  Jurisdiction ▼

Contractor              Category   Tier  Score  Active  Capacity  Status
───────────────────────────────────────────────────────────────────────
Kumar Civil Works       CIVIL      B     85/100   3      5 max   ✅ Active
Sharma & Sons           CIVIL      B     78/100   4      5 max   ✅ Active
City Electrical Ltd     ELEC       A     91/100   2      8 max   ✅ Active
Ranchi Plumbing Co.     PLUMB      C     62/100   1      3 max   ⚠️ Warning
FastBuild Infra         CIVIL      A     45/100   0      —       🚫 Suspended
```

**Workforce & Capacity Tracking:**
- Each contractor declares: "I have 8 workers available this month"
- System tracks: "You currently have 4 active contracts consuming ~6 workers"
- If contractor bids for a new work order but workforce appears insufficient → FLAG shown to official
- This prevents contractors from winning contracts they cannot physically execute

---

## 15.3 UI Design Principles — Simple Enough for Anyone

> **Design for the most constrained user.** The person using SAMADHAN may be a daily-wage worker with a ₹5,000 JioPhone, 2G connectivity, limited literacy, and Hindi as their only language. If the app works for them, it works for everyone else.

---

### The 7 Non-Negotiable UI Rules

#### Rule 1 — One Action Per Screen
Every screen has exactly ONE primary action. No screen has more than 2 buttons above the fold.

```
BAD:  Home screen with 8 cards, 5 menu items, 3 banners
GOOD: Home screen → big green "REPORT PROBLEM" button
      Everything else is secondary, below the fold
```

#### Rule 2 — Voice First, Typing Second
The complaint filing screen opens the microphone by default. The citizen speaks the problem. AI transcribes, translates, and categorizes. Typing is the fallback for users who prefer it.

```
Citizen speaks (Hindi):
"नल से पानी नहीं आ रहा है स्टेशन रोड पर"
         ↓
AI: Category = Water Supply
    Sub-category = No water supply
    Location = Station Road (cross-ref GPS)
    Description = "No water supply on Station Road"
         ↓
Citizen confirms: [✅ हाँ, यही समस्या है]
```

#### Rule 3 — Camera First, Text Second
The primary input for a complaint is a photo. Everything else is auto-filled:
- Category → Gemini Vision detects from photo
- Location → GPS auto-tagged
- Description → AI generates from photo + category

Citizen flow: Open app → Take photo → Confirm → Done.

#### Rule 4 — Status is a Colour, Not Text
Citizens understand colours instinctively. Replace status labels with visual indicators:

```
🔴 Red dot   = No action taken / Overdue
🟡 Yellow    = In progress
🟢 Green     = Resolved / Verified
⚪ Grey      = Pending community verification
🔵 Blue      = Escalated to higher authority
```

No complex status strings like "PENDING_COMMUNITY_VERIFICATION" visible to citizens.

#### Rule 5 — Works on 2G, Offline-Capable
- File a complaint fully offline → syncs when connection returns
- Photos compressed to max 500KB before upload
- No heavy animations on complaint list screens
- APK size under 20MB
- Minimum supported: Android 8.0 (API level 26) — covers 90%+ of Indian users
- Text-only fallback mode for extremely slow connections

#### Rule 6 — No English Required
- App detects phone language on first launch
- Hindi by default for Jharkhand
- All AI-generated text (categories, descriptions) output in chosen language
- All official status updates translated automatically
- Future: Santali, Bengali, Odia (other Jharkhand languages)

#### Rule 7 — Large Tap Targets, High Contrast
- Minimum button height: 48dp (finger-friendly)
- Minimum font size: 16sp for body, 14sp minimum anywhere
- Dark background with white text (already the SAMADHAN theme — excellent for outdoor/sunlight readability)
- No gesture-only interactions — every action has a visible button

---

### The Ideal Citizen Filing Flow — 3 Taps

```
TAP 1  →  Open SAMADHAN
          Home screen shows: [REPORT A PROBLEM] in large green

TAP 2  →  Camera opens
          Citizen takes photo of the problem

TAP 3  →  AI shows:
          Category detected: Water Supply
          Location: Station Road, Ward 7 (GPS confirmed)
          "Is this your problem?"   [✅ YES, SUBMIT]  [Edit]

          Citizen taps YES

───────────────────────────────────
COMPLAINT SUBMITTED. Done.
Complaint #C-3041 is now live.
5 nearby citizens will be asked to verify.
You will get an SMS when it is assigned.
───────────────────────────────────

Total time from opening the app: < 60 seconds
Total taps required: 3
English required: 0 words
```

---

### Contractor and Official UI — Dashboard-First

For officials and contractors, the experience is more data-rich but still disciplined:
- Sidebar navigation with maximum 5 items (not 12)
- Most important number (unresolved complaints / pending quotes) shown at top in large type
- One-click action on each item in the queue
- No pagination — infinite scroll with lazy load
- Keyboard shortcuts for desktop power users

---

## 15.4 Company Operations — Running SAMADHAN with Zero Corruption

The biggest threat to SAMADHAN is not a competitor. It is SAMADHAN itself getting corrupted — a government pressuring data removal, a contractor bribing an employee, an official manipulating scores.

The company structure and operations must make corruption technically impossible or immediately visible.

---

### Operational Principle 1 — The Algorithm is Public

How complaint criticality is scored, how escalation triggers, how contractor scores change — all published in a public technical document. Any citizen, journalist, or researcher can read it.

If a score seems wrong, anyone can challenge it with the formula. No black box.

---

### Operational Principle 2 — Immutable Audit Log

The Public Ledger (Section 10) is append-only by technical architecture. Even SAMADHAN's own engineers cannot edit or delete a past entry. The database schema enforces this.

No government can pressure SAMADHAN to "remove" a complaint from history. The data cannot be changed — only a new entry can be appended (e.g., "Complaint archived by court order — original data preserved").

---

### Operational Principle 3 — Government Cannot Access Citizen Data

Officials see:
- Complaint counts and locations ✅
- Verification status ✅
- Their own accountability scores ✅

Officials cannot see:
- Which individual citizen filed a complaint ❌
- A citizen's trust score or filing history ❌
- Community verification votes tied to individuals ❌

This prevents victimisation of vocal citizens by officials they have filed complaints against.

---

### Operational Principle 4 — No Single Point of Shutdown

SAMADHAN's data is hosted on cloud infrastructure (Google Cloud / Firebase), not on any state government server. A state government cannot unilaterally shut down the platform or demand data deletion.

If a government terminates their SaaS contract, citizens can still access their historical complaint data for 12 months (data portability guarantee in every contract).

---

### Operational Principle 5 — Independent Oversight Board

SAMADHAN the company has an advisory board with read-only platform access:

```
SAMADHAN OVERSIGHT BOARD (proposed):
  1 seat → Civil society org (e.g., Janaagraha, PRAJA Foundation)
  1 seat → Journalist / RTI activist
  1 seat → Technical expert (cybersecurity / data ethics)
  1 seat → Academic researcher (governance / public policy)
  1 seat → Government representative (observer, non-voting)

Board publishes:
  → Quarterly Transparency Report (platform metrics, issues flagged)
  → Annual Algorithm Audit (verify scoring formula not gamed)
  → Incident Reports (any manipulation attempt and SAMADHAN's response)
```

---

### Operational Principle 6 — Whistleblower Channel

Any official, contractor, SAMADHAN employee, or citizen can report platform manipulation anonymously.

```
Reports go to:  Independent Oversight Board (not SAMADHAN management)
Response SLA:   72 hours acknowledgement, 30 days investigation
Outcome:        Published in next Transparency Report
Protection:     Whistleblower identity protected by platform encryption
```

---

### Operational Principle 7 — Pricing is Non-Negotiable

Contractor registration rates and government license fees are published publicly on SAMADHAN's website. No official can "arrange a discount" for a contractor they favour. No government can negotiate a deal that isn't available to all.

Contracts with government include a **Most Favoured Nation clause**: if SAMADHAN ever charges a lower rate to any government, all existing contracts automatically get that rate.

---

### Operational Principle 8 — Revenue Aligned with Mission

SAMADHAN earns more money when:
- More complaints are filed (more citizens using platform)
- More complaints are actually resolved (platform fee on work orders)
- More states adopt the platform (white-label)

SAMADHAN earns less money when:
- Citizens stop using the platform (because complaints aren't resolved)
- Contractors abandon work (platform fee lost on failed work orders)
- Government cancels contract (because platform isn't delivering)

**The financial incentives are perfectly aligned with the mission.** SAMADHAN cannot profit from a broken system. This is the structural answer to "how do we ensure the platform stays honest."

---

### Future Scalability Note — AI Cost Estimation

The idea of generating an AI cost estimate at complaint-filing time (based on complaint photos, category, and state Schedule of Rates) is noted as a future scalability feature.

**Why not for MVP:**
- Accurate cost estimation requires granular, district-level SOR data
- Gemini Vision estimation of repair scope from photos has error margins that could mislead citizens
- Only contractors have the domain expertise to price accurately
- The MVP's existing contractor quote vs AI market rate comparison (using category-level benchmarks) is sufficient for transparency

**When to build it (Year 2+):**
- Once SAMADHAN has 12+ months of historical work order data
- Train a model on: complaint photo → contractor quote → actual cost → outcome
- The real-world data becomes the training set for accurate estimation
- This is the moment AI cost estimation becomes genuinely reliable

---

*Section 15 added: August 2026 | Team H2K | SAMADHAN v1.0*
*Business model, contractor portal, UI principles, and company operations for SIH25031*

---

---

# SECTION 16 — DEPLOYMENT ARCHITECTURE
## Web · Android · iOS — One Codebase, Three Platforms

---

## 16.1 Platform Strategy

SAMADHAN targets three platforms from day one using a single React codebase. No separate app development required.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CITIZEN / OFFICIAL                           │
│         Web Browser   │   Android   │   iOS                    │
└────────────┬──────────┴──────┬──────┴────────┬─────────────────┘
             │                 │               │
             ▼                 ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FIREBASE HOSTING                               │
│          React / Vite build (same code, all platforms)         │
│          Web → direct browser                                   │
│          Android → Capacitor wrapper → APK                     │
│          iOS → PWA (Add to Home Screen for SIH demo)           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS API calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GOOGLE CLOUD RUN                               │
│          FastAPI backend — Docker container                     │
│          All 5 engines running here                             │
│          WebSocket support (HTTP/2)                             │
│          Auto-scales to zero when idle → ₹0 when not used      │
│          Free tier: 2 million requests/month                    │
└──────┬──────────────────┬───────────────────┬───────────────────┘
       │                  │                   │
       ▼                  ▼                   ▼
┌────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  MongoDB   │   │   Gemini API    │   │ Firebase Storage │
│   Atlas    │   │ (AI engine)     │   │ (photos/docs)   │
│  Free 512M │   │  Google Cloud   │   │   Free 5GB      │
└────────────┘   └─────────────────┘   └─────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                  FIREBASE SERVICES                              │
│  Auth (Phone OTP) │ FCM (push notifications) │ Analytics       │
│  Free: 10,000 SMS/month                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 16.2 Why This Stack

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend hosting | Firebase Hosting | Free, CDN-backed, instant deploy |
| Backend hosting | Google Cloud Run | Supports long-running processes (escalation engine), WebSockets, Python, scales to zero |
| Why NOT Firebase Functions | — | Functions timeout at 9 minutes — escalation sweep loop runs indefinitely |
| Phone OTP auth | Firebase Auth | Built-in, 10,000 SMS/month free, replaces custom OTP code |
| Photo storage | Firebase Storage | Direct upload from mobile, free 5GB |
| Push notifications | FCM | Free, works on both Android and iOS |
| Database | MongoDB Atlas | Existing codebase, free 512MB, no migration needed for MVP |
| Android app | Capacitor | Wraps existing React app — no React Native rewrite |
| iOS for demo | PWA | No Apple Developer account needed for SIH demo |

---

## 16.3 Android + iOS — No Separate Codebase

Capacitor converts the existing React/Vite app into a native Android APK:

```
npm run build            → generates dist/ folder
npx cap sync             → copies dist/ into Android project
Android Studio build     → generates debug APK
Share APK directly       → sideload on any Android phone
                           (no Play Store needed for SIH demo)
```

**Native features added via Capacitor plugins:**
- `@capacitor/camera` — better than browser camera for complaint photos
- `@capacitor/geolocation` — more accurate GPS than browser API
- `@capacitor/push-notifications` — FCM integration for real-time alerts
- `@capacitor/share` — share complaint links (drives the 5-person verification user acquisition)

**iOS strategy for SIH demo:**
Add PWA manifest to React app → judges can tap "Add to Home Screen" on iPhone → behaves like a native app. No App Store, no Apple Developer account required.

---

## 16.4 Deployment Cost for SIH — ₹0

| Service | Free Tier | SAMADHAN Usage |
|---------|-----------|-------------|
| Firebase Hosting | 10GB storage, 360MB/day | React build ~5MB total |
| Firebase Auth (SMS OTP) | 10,000 SMS/month | Well within demo usage |
| Firebase Storage | 5GB | Complaint photos |
| Firebase Cloud Messaging | Unlimited | Push notifications |
| Google Cloud Run | 2M requests/month | Backend API calls |
| MongoDB Atlas | 512MB | Complaints, users, officials |
| Gemini API | Free tier | AI classification |
| **Total** | **₹0/month** | **For SIH demo and early pilot** |

---

## 16.5 Deployment Phases

```
PHASE 1 — Backend live on Cloud Run
  → Fix 4 critical bugs
  → Write Dockerfile for FastAPI app
  → Deploy to Cloud Run → get HTTPS URL

PHASE 2 — Firebase Auth
  → Replace custom OTP with Firebase Phone Auth
  → More reliable, no SMS infrastructure to maintain

PHASE 3 — Frontend on Firebase Hosting
  → npm run build → firebase deploy
  → Live at https://samadhan-h2k.web.app

PHASE 4 — Android APK via Capacitor
  → 2-3 hours of setup
  → Debug APK shareable immediately for testing

PHASE 5 — Firebase Storage + FCM
  → Wire photo upload for complaints
  → Push notifications for citizen and official alerts
```

---

## 16.6 Decisions Log (Conversations → Architecture)

The following design decisions were made during team discussions and are recorded here for reference:

| Decision | What Was Decided | Reason |
|----------|-----------------|--------|
| AI cost estimation at filing | NOT for MVP — future scalability | Only contractors accurately know costs; AI estimation would mislead citizens until we have real training data |
| Contractor portal | YES — must be on platform | Without digital contractor login, work order communication falls back to WhatsApp and phone calls, recreating the corruption channel |
| Firebase vs pure custom backend | Hybrid: Firebase for auth/storage/FCM + Cloud Run for FastAPI | Firebase cannot run long-running processes (escalation engine) |
| iOS strategy | PWA for SIH demo, Capacitor native later | Avoids Apple Developer account cost and App Store review for competition |
| Database | Keep MongoDB Atlas, not migrate to Firestore | No migration effort needed for MVP; existing codebase works |
| Community 5-person verification | In design, simplified for MVP | Full GPS-enforced verification is post-MVP; MVP uses simple upvote threshold |
| Aadhaar verification | Post-MVP | UIDAI API integration requires regulatory approval; phone OTP sufficient for SIH |
| Ticket limits | Level 0: 2/month, Level 1: 4/month, Level 2: 10/month | Per month, not per day. Unlimited upvotes for all levels |

---

*Section 16 added: August 2026 | Team H2K | SAMADHAN v1.0*
