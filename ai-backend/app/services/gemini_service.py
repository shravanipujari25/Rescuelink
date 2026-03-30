import google.generativeai as genai
import os
import json
import base64
from app.models import EmergencyResponse

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is effectively required but missing.")

genai.configure(api_key=GEMINI_API_KEY)

# Using gemini-1.5-flash for multimodal capabilities (free tier)
model = genai.GenerativeModel(
    'gemini-1.5-flash',
    generation_config={"response_mime_type": "application/json"}
)

def get_gemini_response(message: str, imageBase64: str = None) -> EmergencyResponse:
    prompt_template = """
    You are the RescueLink Smart Assistant, an AI expert in disaster management.
    Analyze the following emergency request. {vision_extra}
    
    CRITICAL GOALS:
    1. CLASSIFY: medical, flood, fire, earthquake, landslide, platform, or other.
    2. SEVERITY: low, medium, or high.
    3. SENTIMENT: panicked, scared, anxious, calm, or curious.
    4. URGENCY: Score from 1-10.
    5. GUIDANCE: Provide 3-5 life-saving steps.
    
    User Message: "{message}"
    
    Return ONLY strict JSON:
    {{
      "classification": "...",
      "severity_level": "...",
      "sentiment": "...",
      "urgency_score": 1,
      "guidance": ["Step 1", "Step 2"],
      "recommend_sos": true,
      "explanation": "..."
    }}
    """
    
    vision_extra = "If an image is provided, use it to assess the severity, disaster type, and any visible risks." if imageBase64 else ""
    prompt = prompt_template.format(message=message, vision_extra=vision_extra)
    
    content = [prompt]
    
    if imageBase64:
        # Handle data URL if present
        if "," in imageBase64:
            imageBase64 = imageBase64.split(",")[1]
        
        image_bytes = base64.b64decode(imageBase64)
        content.append({
            "mime_type": "image/jpeg",
            "data": image_bytes
        })
        print("📸 Vision Assisted Analysis running...")

    # Will cleanly throw if external fetch fails (e.g. 503, 401 Auth)
    response = model.generate_content(content)
    
    try:
        data = json.loads(response.text)
        return EmergencyResponse(**data)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Gemini JSON output safely: {e}\nRaw output: {response.text}")
