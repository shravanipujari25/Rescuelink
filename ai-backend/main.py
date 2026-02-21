from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from app.models import EmergencyRequest, EmergencyResponse, TriageResponse
from app.services.rule_classifier import classify_rule_based
from app.services.gemini_service import get_gemini_response
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------
# PRIORITY CALCULATION FUNCTION
# ------------------------------
def calculate_priority(severity_score: int, injured: bool, trapped: bool):
    if severity_score >= 8 or (injured and trapped):
        return "critical"
    if severity_score >= 6:
        return "high"
    if severity_score >= 4:
        return "medium"
    return "low"


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
    if ai_response.severity_level != "high":
        ai_response.recommend_sos = False
        
    # 4. FINAL INCIDENT TYPE CHECK
    if ai_response.severity_level == "high" and ai_response.classification == "other":
        ai_response.severity_level = "medium"
        ai_response.recommend_sos = False
        
    return ai_response

@app.post("/api/ai/triage", response_model=TriageResponse)
async def triage(request: EmergencyRequest):

    message = request.message.lower()

    # Basic injured/trapped detection
    injured = "injured" in message or "hurt" in message
    trapped = "trapped" in message or "stuck" in message

    # 1️⃣ Rule-based first
    rule_response = classify_rule_based(request.message)

    if rule_response:
        severity_score = rule_response.urgency_score or 5

        priority = calculate_priority(severity_score, injured, trapped)

        return TriageResponse(
            disaster_type=rule_response.classification,
            injured=injured,
            trapped=trapped,
            severity_score=severity_score,
            priority=priority,
            confidence=0.9,
            source="rules"
        )

    # 2️⃣ Gemini fallback
    try:
        ai_response = get_gemini_response(request.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Gemini AI failed")

    severity_score = ai_response.urgency_score or 5
    priority = calculate_priority(severity_score, injured, trapped)

    return TriageResponse(
        disaster_type=ai_response.classification,
        injured=injured,
        trapped=trapped,
        severity_score=severity_score,
        priority=priority,
        confidence=0.75,
        source="gemini"
    )


@app.get("/")
def read_root():
    return {"message": "AI Triage Service Running"}