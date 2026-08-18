# VANTA AI Engineering Handoff

**AI STATUS: READY**

## 1. AI Architecture
The AI layer is architected into four primary engines that execute chronologically throughout the complaint lifecycle:
1. **AI Analysis Engine** (`ai_engine.py`): Real-time triage, classification, and vision processing.
2. **Star Rating Engine** (integrated into `ai_engine.py`): Priority calculation combining AI severity with community upvotes.
3. **Incident Clustering Engine** (`civic_intelligence_engine.py`): Background grouping of semantic/geographic complaints.
4. **DPR Generation Engine** (`dpr_engine.py`): Automatic generation of Development Project Reports based on clusters.

The system uses an Abstract Factory pattern (`ai_provider.py`) to decouple the application from specific LLM providers.

## 2. Models / Providers
- **Primary Model**: Google Gemini (`gemini-2.5-flash`).
- **Provider Interface**: `AIProvider` base class.
- **Local Fallback**: `MockProvider` (deterministic heuristic rules) activates if the Gemini API key is missing or the API rate-limits/fails.

## 3. AI Contracts
**Input (Frontend -> Backend)**:
- `text_content` (str)
- `photo_urls` (array of str)

**Output (Backend AI -> DB/Frontend)**:
```json
{
  "category": "Water",
  "sub_category": "Line Burst",
  "criticality_score": 85,
  "criticality_level": "CRITICAL",
  "risk_flags": ["Flood Risk"],
  "vision_verified": true,
  "confidence_score": 0.95,
  "reasoning": "..."
}
```

## 4. Prompt/Configuration Structure
Prompts are structured with clear context framing ("You are VANTA, a government administrative AI"), exact input data injection, and strict JSON output schemas.
- `ai_engine.py` handles single-complaint triage.
- `civic_intelligence_engine.py` passes arrays of complaints to find systemic links.
- `dpr_engine.py` passes aggregated cluster metadata to generate civil engineering recommendations.

## 5. Classification Behaviour
Maps complaints into 7 primary categories and assigns a severity score (0-100) mapped to tiers (ROUTINE to CATASTROPHIC). Outputs `risk_flags` for immediate danger keywords (e.g. "Live wire").

## 6. Vision Behaviour
Takes `photo_urls` alongside text. The AI verifies if the text description matches the image content. If the text says "massive crater" but the image shows a minor crack, `vision_verified` returns `false`, which flags the complaint as `is_fake_flagged = True` in the database.

## 7. Duplicate Detection
Implemented in `ai_engine.py` as `detect_duplicate()`. It compares the new complaint text against recent complaints in the same ward. Returns the `id` of the duplicate complaint to set `is_duplicate_of`.

## 8. Clustering & 9. Civic Intelligence
Implemented in `civic_intelligence_engine.py`. Sweeps recent (last 30 days) active complaints, groups them by category, and asks the AI to find semantic relationships indicating a single underlying systemic failure (e.g., 5 water complaints on one street).

## 10. DPR (Development Project Reports)
Implemented in `dpr_engine.py`. Takes a "Cluster" from the Civic Intelligence Engine and generates a full project proposal, including `population_affected`, `budget_estimate`, `scheme_eligible`, and a detailed `ai_recommendation` for structural fixes.

## 11. Fallback Behaviour
The system never fails if the AI goes down. The `MockProvider` safely categorizes complaints using simple string matching ("water", "leak", "fire") and guarantees the ticketing pipeline remains operational with 0 dependencies on external APIs.

## 12. AI Limitations
- **Latency**: Complex vision analysis and semantic clustering add latency. For the prototype, these run synchronously on creation, but in production, clustering and duplicate detection should move to async background tasks (e.g., Celery/Redis).
- **Hallucinations**: DPR budget estimates are rough AI guesses and should not be treated as official PWD estimates without human verification.

## 13. Files Changed
- `backend/services/ai_provider.py` [NEW]
- `backend/services/civic_intelligence_engine.py` [NEW]
- `backend/services/dpr_engine.py` [NEW]
- `backend/services/ai_engine.py` [MODIFIED]
- `backend/routes/complaints.py` [MODIFIED]

## 14. Files Untouched
- Frontend entirely untouched.
- Authentication, models, and core routing logic remain intact.
- Escalation engine is untouched.

## 15. Backend Dependencies
- Requires `google-genai` pip package.
- Requires `GEMINI_API_KEY` in `.env`.
- Relies on Backend Engineer to execute the periodic clustering sweep via a cron-job (e.g., APScheduler in `main.py`).

## 16. Frontend Dependencies
- Frontend Engineer must update the complaint detail UI to display the new fields: `risk_flags`, `vision_verified`, `is_fake_flagged`, and `is_duplicate_of`.

## 17. Known Issues
- Currently, duplicate detection and clustering happen synchronously or semi-synchronously. High traffic could cause timeouts.
- Vision analysis passes image URLs to the model; if the URLs are inaccessible (e.g., local storage without tunneling), the vision check will fail or fallback.

AI STATUS:
READY
