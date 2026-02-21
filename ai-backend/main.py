from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from app.models import EmergencyRequest, EmergencyResponse
from app.services.rule_classifier import classify_rule_based
from app.services.gemini_service import get_gemini_response
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite frontend default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ai/emergency-assistant", response_model=EmergencyResponse)
async def emergency_assistant(request: EmergencyRequest):
    # 1. Try Rule-based classification first
    rule_response = classify_rule_based(request.message)
    
    if rule_response:
        print(f"Rule-based match for: {request.message}")
        return rule_response
        
    # 2. Fallback to Gemini
    print(f"Calling Gemini for: {request.message}")
    ai_response = get_gemini_response(request.message)
    
    
    # 3. SAFETY GUARD: Enforce SOS Rule
    # "recommend_sos" can ONLY be true if "severity_level" is "high"
    if ai_response.severity_level != "high":
        ai_response.recommend_sos = False
        
    # 4. FINAL INCIDENT TYPE CHECK
    # High severity must NEVER be paired with "other".
    if ai_response.severity_level == "high" and ai_response.classification == "other":
        # Downgrade to medium to prevent SOS on unknown incidents
        ai_response.severity_level = "medium"
        ai_response.recommend_sos = False
        
    return ai_response

@app.get("/")
def read_root():
    return {"message": "Emergency AI Assistant is running"}
