import sys
import os
import asyncio

# Ensure backend is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ai_engine import analyze_complaint_ai, detect_duplicate
from services.ai_provider import MockProvider

# Force mock for deterministic testing without API key
import services.ai_engine
services.ai_engine.ai_provider = MockProvider()

def test_engine_1():
    print("--- Test AI Analysis ---")
    text = "Large pothole filled with water near the primary school on Station Road. Cars are swerving to avoid it, almost hitting kids. Please fix."
    photo_urls = ["http://example.com/photo.jpg"]
    
    result = analyze_complaint_ai(text, photo_urls)
    print("Analysis Result:")
    for k, v in result.items():
        print(f"  {k}: {v}")
        
    print("\n--- Test Duplicate Detection ---")
    recent = [
        {"id": "123", "text": "Garbage dump near bus stop"},
        {"id": "124", "text": "Huge crater-like pothole outside Station Road school, very dangerous for children!"}
    ]
    dup_id = detect_duplicate(text, recent)
    print(f"Duplicate of ID: {dup_id}")

if __name__ == "__main__":
    test_engine_1()
