# VANTA Threat Model

## 1. Overview
This threat model identifies potential threats, attack vectors, and mitigations for the VANTA application. It was conducted following STRIDE methodology to secure the grievance redressal platform.

## 2. Identified Assets
1. **Citizen PII Data:** Names, phone numbers, exact residential or reported coordinates.
2. **Official Credentials:** Passwords for MLAS, Collectors, MPs, Ministry members.
3. **Evidence Assets:** Images, audio files attached to grievances.
4. **Platform Integrity Data:** Votes, status transitions, accountability scores.

## 3. Threat Assessment (STRIDE)

### 3.1. Spoofing
- **Threat:** Attackers impersonating Officials to manipulate accountability scores or falsely resolve complaints.
- **Mitigation:** Strict JWT-based authentication combined with role-based access checks (`get_current_user`).

### 3.2. Tampering
- **Threat:** Citizens upvoting a single complaint infinitely or maliciously changing the status of another citizen's complaint.
- **Mitigation:** Server-side authorization blocks unauthenticated or non-assigned status changes. Unique DB constraints on upvotes prevent multiple votes by the same citizen.

### 3.3. Repudiation
- **Threat:** Officials resolving a complaint but claiming they did not.
- **Mitigation:** Immutable `VerificationLog` and `ResolutionSubmit` audits ensure a tamper-proof trail of who performed what action at what timestamp.

### 3.4. Information Disclosure
- **Threat:** WebSocket broadcasting exact GPS coordinates and citizen phone numbers to unauthenticated map viewers.
- **Mitigation:** `to_safe_dict()` method strips PII (phone, exact lat/lng, resolution photos) before broadcasting over WS channels or returning via public REST endpoints.

### 3.5. Denial of Service
- **Threat:** Mass-uploading of massive files or spamming the grievance creation endpoint to exhaust server resources.
- **Mitigation:** Hard file-size limits (5MB), file extension allowlists, and in-memory rate-limiting middleware (max 100 requests / 60s per IP).

### 3.6. Elevation of Privilege
- **Threat:** Malicious actor submitting `role: ADMIN` during registration to gain super-user access.
- **Mitigation:** Strict allowed roles array `["MLA", "COLLECTOR", "MP", "MINISTRY"]` validation enforced at the `/auth/official/register` endpoint.

## 4. AI-Specific Threats
- **Prompt Injection:** Attackers embedding malicious instructions in complaint descriptions.
- **Mitigation:** The AI integration separates user data from system prompts using explicit `<COMPLAINT>` delimiters, instructing the AI to treat content purely as data.
