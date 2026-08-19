# VANTA Security Architecture & Attack Surface Map

## 1. System Overview

VANTA is a Civic Governance platform connecting Citizens, Officials, and Contractors.
The system uses a React frontend, FastAPI backend, and MongoDB storage, integrated with Google Gemini for AI analysis.

**Trust Boundaries:**
- **Client (Browser/Mobile):** UNTRUSTED. All data originating from the client must be validated and authorized.
- **FastAPI Backend:** TRUSTED. Enforces business logic, RBAC, and data sanitization.
- **MongoDB Database:** TRUSTED. Stores sensitive citizen and official data.
- **Gemini AI Provider:** UNTRUSTED (for execution context). Output must be treated as advice and strictly sanitized before business state changes.

## 2. Attack Surface Map

### A. Frontend (React/Vite)
- **Vectors:** XSS (Cross-Site Scripting), Session Hijacking, Token Theft from LocalStorage, Unsafe routing.
- **Sensitive Data:** Rendered citizen PII, API tokens in local state.

### B. API Gateway (FastAPI Routes)
- **Vectors:** BOLA/IDOR (Broken Object Level Authorization), Mass Assignment, Injection (NoSQL/SQL), Rate Limit Abuse, Unauthenticated access.
- **Key Endpoints:**
  - `/api/auth/*` (Login, OTP, Token issuance)
  - `/api/complaints/*` (Creation, Updates, Resolution, Escalation)
  - `/api/officials/*` (Profiles, assignments)
  - `/api/transparency/*` (Public ledger)
  - `/api/upload/*` (File and image uploads)

### C. Authentication & Authorization
- **Mechanism:** JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Vectors:** Hardcoded `SECRET_KEY`, weak JWT algorithms, brute-force on OTP/Login, insecure fallback password verification (`"password"` bypass).
- **Roles:** CITIZEN, OFFICIAL (with sub-roles: MLA, COLLECTOR, etc.).

### D. Real-Time Telemetry (WebSockets)
- **Path:** `/ws/map`
- **Vectors:** Unauthenticated connection, tenant data leakage (broadcasting private complaint info globally), DoS/Resource Exhaustion.

### E. AI Integrations (Gemini API)
- **Vectors:** Prompt Injection, Data Exfiltration, AI Hallucinated business logic execution.
- **Scope:** Complaint text categorization and photo verification.

### F. File Uploads
- **Path:** `/public/uploads` (Static mount)
- **Vectors:** Malicious executable uploads, path traversal, unauthorized access to private citizen evidence.

### G. Database (MongoDB via Custom ORM)
- **Vectors:** NoSQL Injection (if queries are unsanitized), Exposed connection strings, Lack of field-level encryption for PII.

## 3. Data Flow & Security Perimeters

```
Citizen / Official (Browser)
       │ (HTTPS/WSS)
       ▼
[ Rate Limiter & WAF (Future) ]
       │
       ▼
[ FastAPI Backend ] ──────────────► [ Gemini GenAI API ] (HTTPS)
       │
       ├──► [ JWT Auth & RBAC Middleware ]
       │
       ├──► [ Input Validation (Pydantic) ]
       │
       ▼
[ MongoDB Database ]
```

## 4. Current State Observations
- 🔴 **CRITICAL:** Missing `@Depends(get_current_user)` on multiple endpoints (e.g., `/citizen/{id}`, `/citizen/profile`), allowing unauthenticated BOLA.
- 🔴 **CRITICAL:** Hardcoded JWT secret and fallback bypass in password verification.
- 🔴 **CRITICAL:** Potential for unauthenticated mass file access via static `/public/uploads` mount.
- 🟡 **HIGH:** Missing strict rate limits on OTP/Login endpoints.
- 🟡 **HIGH:** Client-provided roles during Official Registration are trusted without an admin invitation process.
