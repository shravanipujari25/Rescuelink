from pydantic import BaseModel
from typing import List, Optional, Literal

class EmergencyRequest(BaseModel):
    message: str

class EmergencyResponse(BaseModel):
    classification: Literal["medical", "flood", "fire", "earthquake", "landslide", "platform", "other"]
    severity_level: Literal["low", "medium", "high"]
    sentiment: Optional[str] = "calm"
    urgency_score: Optional[int] = 0
    guidance: List[str]
    recommend_sos: bool
    explanation: Optional[str] = ""
