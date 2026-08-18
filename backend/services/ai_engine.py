import os
import json
import re
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("samadhan-ai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = None

if GEMINI_API_KEY:
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Successfully initialized Gemini GenAI Client")
    except Exception as e:
        logger.error(f"Failed to initialize GenAI client: {e}")

CATEGORY_RULES: list[tuple[list[str], str, str]] = [
    (["water", "leak", "pipe", "flooding", "flood", "sewage", "drain", "tap", "water supply"],
     "Water", "Drainage Overflow"),
    (["light", "streetlight", "electricity", "pole", "power", "blackout", "transformer"],
     "Electrical", "Streetlight Outage"),
    (["garbage", "trash", "waste", "dump", "swachh", "clean"],
     "Sanitation", "Garbage Accumulation"),
    (["health", "hospital", "doctor", "ambulance", "clinic", "medicine"],
     "Health", "Primary Health Center"),
    (["school", "education", "classroom", "teacher", "college"],
     "Education", "School Facility"),
    (["road", "pothole", "pavement", "sidewalk", "asphalt", "sinkhole", "tar"],
     "Roads", "Potholes"),
    (["bridge", "building", "construction", "collapse", "infrastructure", "dam"],
     "Infrastructure", "Structural Damage"),
]

CRITICALITY_KEYWORDS: list[tuple[list[str], int, str]] = [
    (["collapsed", "fire", "gas leak", "burst", "emergency", "fissure", "accident",
      "electrocution", "building collapse", "dam breach"], 85, "CRITICAL"),
    (["flood", "flooded", "inundated", "submerged"], 95, "CATASTROPHIC"),
    (["crack", "broken", "danger", "contamination", "leak", "blackout",
      "contaminated", "chemical"], 65, "HIGH"),
    (["overflow", "delay", "pothole", "blocked", "clogged", "stagnant"], 45, "ELEVATED"),
    (["garbage", "trash", "clean", "dusty", "dirty"], 35, "MODERATE"),
]


def _detect_language(text: str) -> str:
    has_cyrillic = any("\u0400" <= ch <= "\u04ff" for ch in text)
    if has_cyrillic:
        return "ru"

    devanagari_count = sum(1 for ch in text if "\u0900" <= ch <= "\u097F")
    kannada_count = sum(1 for ch in text if "\u0C80" <= ch <= "\u0CFF")
    total_indic = devanagari_count + kannada_count

    if total_indic == 0:
        return "en"

    if kannada_count > devanagari_count:
        return "kn"
    if devanagari_count > 0:
        return "hi"
    return "en"


def local_fallback_analyze(text: str) -> Dict[str, Any]:
    text_lower = text.lower()

    category = "Roads"
    sub_category = "General Road Issue"

    for keywords, cat, sub_cat in CATEGORY_RULES:
        if any(kw in text_lower for kw in keywords):
            category = cat
            sub_category = sub_cat
            if "sewage" in text_lower or "drain" in text_lower or "clog" in text_lower:
                sub_category = "Drainage Overflow"
            elif "pipe" in text_lower or "burst" in text_lower:
                sub_category = "Water Line Burst"
            elif "tap" in text_lower or "supply" in text_lower:
                sub_category = "Water Supply Disruption"
            break

    score = 30
    level = "ROUTINE"

    for keywords, kw_score, kw_level in CRITICALITY_KEYWORDS:
        if any(kw in text_lower for kw in keywords):
            if kw_score > score:
                score = kw_score
                level = kw_level

    if any(kw in text_lower for kw in ["near school", "school", "children", "hospital"]):
        score = min(100, score + 10)
        if score >= 81:
            level = "CRITICAL"
        elif score >= 61:
            level = "HIGH"

    if any(kw in text_lower for kw in ["ward 7", "ward 8"]):
        score = min(100, score + 5)

    language = _detect_language(text)

    return {
        "category": category,
        "sub_category": sub_category,
        "score": score,
        "level": level,
        "reasoning": "Analyzed via Local Heuristics Engine (keyword matching + safety heuristics).",
        "language": language,
    }


def analyze_complaint_ai(text: str) -> Dict[str, Any]:
    if not client:
        return local_fallback_analyze(text)

    try:
        prompt = f"""You are a government administrative AI analyzing a citizen complaint.
Analyze the complaint below and return ONLY valid JSON (no markdown, no explanation).

COMPLAINT:
{text}

Return exactly this JSON structure:
{{
  "translated_text": "<English translation if not in English, else original text>",
  "language": "<ISO 639-1 code: en, kn, hi, ta, te, etc.>",
  "category": "<one of: Water, Roads, Electrical, Sanitation, Health, Education, Infrastructure>",
  "sub_category": "<specific issue, e.g. Water Line Burst, Potholes, Streetlight Outage>",
  "score": <integer 0-100 based on danger/health/safety risk>,
  "level": "<ROUTINE|MODERATE|ELEVATED|HIGH|CRITICAL|CATASTROPHIC matching score brackets>",
  "reasoning": "<brief 1-2 sentence explanation of the score>"
}}

Score brackets: 0-20 ROUTINE, 21-40 MODERATE, 41-60 ELEVATED, 61-80 HIGH, 81-95 CRITICAL, 96-100 CATASTROPHIC."""

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
            contents=prompt,
        )

        clean_text = response.text.strip()
        clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text)
        clean_text = re.sub(r"\s*```$", "", clean_text)

        data = json.loads(clean_text.strip())

        required_keys = {"translated_text", "language", "category", "sub_category", "score", "level"}
        if not required_keys.issubset(data.keys()):
            raise ValueError(f"Missing keys in AI response: {required_keys - data.keys()}")

        return data
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}. Falling back to local analyzer.")
        return local_fallback_analyze(text)


def calculate_stars_rating(score: int, upvotes: int = 0) -> int:
    base_stars = 1
    if score >= 90:
        base_stars = 5
    elif score >= 70:
        base_stars = 4
    elif score >= 50:
        base_stars = 3
    elif score >= 30:
        base_stars = 2

    upvote_bump = min(upvotes // 25, 5 - base_stars)
    return max(1, min(5, base_stars + upvote_bump))
