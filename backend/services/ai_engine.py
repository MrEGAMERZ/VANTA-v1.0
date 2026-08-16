import os
import json
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("samadhan-ai")

# Check for Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = None

if GEMINI_API_KEY:
    try:
        from google import genai
        # Initialize Google GenAI SDK client
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Successfully initialized Gemini GenAI Client")
    except Exception as e:
        logger.error(f"Failed to initialize GenAI client: {e}")

def local_fallback_analyze(text: str) -> Dict[str, Any]:
    """Fallback rule-based categorization and criticality engine if API is missing."""
    text_lower = text.lower()
    
    # 1. Classification
    category = "Roads"
    sub_category = "Potholes"
    
    if any(k in text_lower for k in ["water", "leak", "pipe", "flooding", "flood", "sewage", "drain"]):
        category = "Water"
        sub_category = "Drainage Overflow" if "sewage" in text_lower or "drain" in text_lower else "Water Line Burst"
    elif any(k in text_lower for k in ["light", "streetlight", "electricity", "pole", "power", "blackout"]):
        category = "Electrical"
        sub_category = "Streetlight Outage"
    elif any(k in text_lower for k in ["garbage", "trash", "waste", "dump"]):
        category = "Sanitation"
        sub_category = "Garbage Accumulation"
    elif any(k in text_lower for k in ["health", "hospital", "doctor", "ambulance", "clinic"]):
        category = "Health"
        sub_category = "Primary Health Center"
    elif any(k in text_lower for k in ["school", "education", "classroom", "teacher"]):
        category = "Education"
        sub_category = "School Facility"

    # 2. Criticality Scoring
    score = 30
    level = "ROUTINE"
    
    # Check immediate danger
    if any(k in text_lower for k in ["collapsed", "fire", "flood", "gas leak", "burst", "emergency", "fissure", "accident"]):
        score = 85
        level = "CRITICAL"
        if "flood" in text_lower or "burst" in text_lower:
            score = 95
            level = "CATASTROPHIC"
    elif any(k in text_lower for k in ["crack", "broken", "danger", "contamination", "leak", "blackout"]):
        score = 65
        level = "HIGH"
    elif any(k in text_lower for k in ["overflow", "delay", "pothole", "blocked"]):
        score = 45
        level = "ELEVATED"
    elif any(k in text_lower for k in ["garbage", "trash", "clean"]):
        score = 35
        level = "MODERATE"

    return {
        "category": category,
        "sub_category": sub_category,
        "score": score,
        "level": level,
        "reasoning": "Analyzed via Local Heuristics Engine (matching safety keywords).",
        "language": "en" if not any(ord(char) > 127 for char in text) else "kn"
    }

def analyze_complaint_ai(text: str) -> Dict[str, Any]:
    """Analyzes a complaint using Gemini API or falls back to local rules."""
    if not client:
        return local_fallback_analyze(text)
        
    try:
        prompt = f"""
        You are a government administrative AI. Analyze the citizen complaint below.
        
        COMPLAINT: {text}
        
        Provide the analysis in strict JSON format containing:
        - "translated_text": The English translation if not in English, else original.
        - "language": Detected language code (e.g. "en", "kn", "hi").
        - "category": Categorize into one of: ["Water", "Roads", "Electrical", "Sanitation", "Health", "Education", "Infrastructure"].
        - "sub_category": Specific issue type (e.g. "Water Line Burst", "Potholes", "Streetlight Outage", "Garbage Dump").
        - "score": A score from 0 to 100 based on danger, safety, and health risks.
        - "level": One of ["ROUTINE", "MODERATE", "ELEVATED", "HIGH", "CRITICAL", "CATASTROPHIC"] matching the score brackets (0-20: ROUTINE, 21-40: MODERATE, 41-60: ELEVATED, 61-80: HIGH, 81-95: CRITICAL, 96-100: CATASTROPHIC).
        - "reasoning": Brief explanation of the score.
        
        Output only valid JSON:
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        
        clean_text = response.text.strip()
        # strip markdown code blocks if any
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        data = json.loads(clean_text.strip())
        return data
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}. Falling back to local analyzer.")
        return local_fallback_analyze(text)

def calculate_stars_rating(score: int, upvotes: int = 0) -> int:
    """Calculate star priority rating (1 to 5 stars)."""
    base_stars = 1
    if score >= 90:
        base_stars = 5
    elif score >= 70:
        base_stars = 4
    elif score >= 50:
        base_stars = 3
    elif score >= 30:
        base_stars = 2
        
    # Bump stars based on upvotes: every 25 upvotes = +1 star (max 5)
    upvote_bump = upvotes // 25
    final_stars = min(5, base_stars + upvote_bump)
    return max(1, final_stars)
