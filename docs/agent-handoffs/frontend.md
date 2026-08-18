# Frontend Handoff - VANTA

## 1. Frontend Architecture
The frontend is built as a single-page application (SPA) using React 19 and Vite.
Routing is handled via React Router v7 (`react-router-dom`).
State management is currently localized using standard React hooks (`useState`, `useEffect`) and context (e.g., `ToastProvider`). No global state management library like Redux or Zustand is present.

## 2. Features Implemented
- Portal landing page (`Portal.jsx`)
- Role-based login for Citizens (`CitizenLogin.jsx`) and Officials (`OfficialLogin.jsx`)
- Dedicated layouts and dashboards for different roles (Citizen, Official, MLA, MP)
- Complaint detail views with AI diagnostics and timeline tracking
- Constituency oversight and escalation views for Officials
- Live Map visualization with Leaflet
- Real-time notification bell using WebSockets

## 3. Components Changed
*(No components were changed in this inspection phase. I only inspected existing code.)*

## 4. API Dependencies
- Fetch API is used to communicate with the backend.
- Base URL automatically resolves based on environment (`VITE_API_URL`) or falls back to `http://localhost:8000/api` or window origin.
- JWT-based authentication via `localStorage` ('user_token').

## 5. API Contracts Expected
The `src/services/api.js` defines several expected endpoints:
- Auth: `/auth/citizen/request-otp`, `/auth/citizen/verify-otp`, `/auth/official/login`, `/auth/official/register`
- Complaints: `/complaints` (GET/POST), `/complaints/:id`, `/complaints/:id/status`, `/complaints/:id/upvote`, `/complaints/:id/resolve`, `/complaints/:id/verify`
- Map: `/map/pins`, `/map/heatmap`
- Officials/Scoreboard: `/officials/scoreboard`, `/officials`, `/officials/:id`
- Admin: `/admin/run-escalation`
- Projects: `/projects`
- Profiles: `/auth/citizen/:id`, `/auth/citizen/profile`, `/auth/official/profile`

## 6. AI Data Consumed
The frontend consumes AI diagnostic data within the complaint views (e.g., `ComplaintDetail.jsx`). It displays:
- AI Classification (`sub_category` or `aiDiagnostics.type`)
- Probability/Confidence (`criticality_score` or `aiDiagnostics.probability`)
- Risk Assessment (`criticality_level` or `aiDiagnostics.risk`)

## 7. WebSocket Events Consumed
A WebSocket connection is maintained at `${WS_URL}/map` within `NotificationBell.jsx` (and potentially `LiveMap.jsx` and `CitizenIssues.jsx`).
Events consumed:
- `NEW_COMPLAINT`: Triggers a warning notification for newly registered grievances.
- `STATUS_CHANGE`: Alerts when a ticket status updates (e.g., to RESOLVED or ESCALATED).
- `ESCALATION_SWEEP`: Triggers an error notification when breached tickets are reallocated up the tier chain.

## 8. Files Changed
*(None during this task. Inspection only.)*

## 9. Files Intentionally Untouched
All files in the repository.

## 10. Known Issues
- State is heavily reliant on local storage (`vanta_notifications`, `user_token`) without robust global synchronization.
- Mock data fallbacks (`mockComplaints.js`) are used when DB/API fetching fails, which could obscure genuine backend disconnects.

## 11. Backend Dependencies
The frontend relies heavily on the backend for:
- Providing the unified REST API (`/api/*`)
- Emitting real-time WebSocket events for notifications and map updates
- Executing business logic for SLAs, escalations, and AI classification

## 12. Next Recommended Frontend Tasks
- Consolidate common UI components (buttons, cards, badges) into a unified design system folder to reduce duplicate CSS (currently many duplicated styles in `*.css` files).
- Add robust error handling boundaries to prevent the application from crashing if the backend contract changes unexpectedly.
- Ensure all hardcoded mock fallbacks are properly gated so they aren't accidentally triggered in production if the DB is empty.

---
**FRONTEND STATUS:**
READY
*Reasoning*: The existing frontend is well-structured, functional, and accurately separated by role. The routing, API layer, and WebSocket integrations are in place and understood. I am ready to begin specific UI feature tasks without needing to rewrite the existing architecture.
