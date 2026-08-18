import os
import json
import logging
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod

logger = logging.getLogger("vanta-ai-provider")

class AIProvider(ABC):
    """Abstract base class for all AI implementations in VANTA."""
    
    @abstractmethod
    def generate_json(self, prompt: str, image_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        """Generates a structured JSON response based on text and optional images."""
        pass

class GeminiProvider(AIProvider):
    """Google Gemini AI implementation."""
    
    def __init__(self, api_key: str):
        try:
            from google import genai
            self.client = genai.Client(api_key=api_key)
            self.model_name = "gemini-2.5-flash"
            logger.info("Successfully initialized Gemini GenAI Client")
        except Exception as e:
            logger.error(f"Failed to initialize GenAI client: {e}")
            self.client = None

    def generate_json(self, prompt: str, image_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        if not self.client:
            raise Exception("Gemini client not initialized")
            
        try:
            contents = [prompt]
            # Handle images if needed in the future using the client
            # (assuming URL-based images need to be downloaded or passed as parts if supported)
            # For this prototype, we'll assume the prompt contains necessary context or we pass URLs in prompt.
            if image_urls:
                contents.append(f"Image evidence URLs provided: {', '.join(image_urls)}")
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents
            )
            
            clean_text = response.text.strip()
            # Strip markdown code blocks if any
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
                
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            data = json.loads(clean_text.strip())
            return data
        except Exception as e:
            logger.error(f"Gemini API generation failed: {e}")
            raise e

class MockProvider(AIProvider):
    """Deterministic Mock AI for testing or fallback."""
    
    def generate_json(self, prompt: str, image_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        text_lower = prompt.lower()
        
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
            
        # 2. Criticality Scoring
        score = 30
        level = "ROUTINE"
        
        if any(k in text_lower for k in ["collapsed", "fire", "flood", "gas leak", "burst", "emergency"]):
            score = 85
            level = "CRITICAL"
        elif any(k in text_lower for k in ["crack", "broken", "danger", "leak", "blackout"]):
            score = 65
            level = "HIGH"
        
        return {
            "translated_text": prompt,
            "language": "en",
            "category": category,
            "sub_category": sub_category,
            "criticality_score": score,
            "criticality_level": level,
            "risk_flags": ["Local Fallback Used"],
            "vision_verified": False,
            "confidence_score": 0.5,
            "reasoning": "Analyzed via Local Heuristics Engine (API unavailable)."
        }

def get_ai_provider() -> AIProvider:
    """Factory to get the appropriate AI provider."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        return GeminiProvider(api_key=api_key)
    logger.warning("No GEMINI_API_KEY found. Falling back to MockProvider.")
    return MockProvider()
