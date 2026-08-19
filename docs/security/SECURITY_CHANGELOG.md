# VANTA Security Changelog

## [1.0.1] - 2026-08-18

### Fixed
- **Authentication:** Removed hardcoded fallback password ("password") in JWT handler. Enforced `SECRET_KEY` load from environment variables securely.
- **BOLA/IDOR:** Fixed citizen and official profile update endpoints to strictly enforce `get_current_user` verification, blocking unauthorized profile overwrites.
- **Authorization:** Secured complaint submission, upvoting, and status updates by authenticating requests and enforcing ownership validation.
- **Privilege Escalation:** Added server-side validation to official registration to ensure requested roles are in an allowed list (`["MLA", "COLLECTOR", "MP", "MINISTRY"]`).
- **Input Validation:** Enforced Pydantic constraints across all data schemas (length checks, lat/lng boundary limits) to block buffer payloads and DoS.
- **Data Exposure:** Implemented PII redaction (`to_safe_dict`) to strip `citizen_id`, exact coordinates, and phone numbers from public WebSocket channels and public API requests.
- **File Uploads:** Enforced MIME type and file extension allowlists, and set a hard 5MB limit for attachments.
- **Network Security:** Deployed comprehensive SecurityHeadersMiddleware containing Strict-Transport-Security (HSTS), X-Frame-Options, Content-Security-Policy (CSP), and nosniff headers.
- **Abuse Prevention:** Implemented a basic 60-second sliding window Rate Limiter to deter brute-forcing and bot spam.
- **AI Prompt Injection:** Isolated user input inside `<COMPLAINT>` delimiters, neutralizing malicious system instruction overrides.

### Removed
- **Insecure Defaults:** Removed default "password" values from SQLAlchemy/Mock ORM definitions for the Official schema.
