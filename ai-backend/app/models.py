from pydantic import BaseModel
from typing import List, Optional, Literal

class EmergencyRequest(BaseModel):
    message: str
    imageBase64: Optional[str] = None

class EmergencyResponse(BaseModel):
    classification: Literal["medical", "flood", "fire", "earthquake", "landslide", "platform", "other"]
    severity_level: Literal["low", "medium", "high"]
    sentiment: Optional[str] = "calm"
    urgency_score: Optional[int] = 0
    guidance: List[str]
    recommend_sos: bool
    explanation: Optional[str] = ""

class TriageResponse(BaseModel):
    disaster_type: Literal["medical", "flood", "fire", "earthquake", "landslide", "platform", "other"]
    injured: bool
    trapped: bool
    severity_score: int  # 1-10 scale
    priority: Literal["low", "medium", "high", "critical"]
    confidence: float
    source: Literal["rules", "gemini"]