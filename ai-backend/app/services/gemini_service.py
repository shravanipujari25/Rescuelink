import google.generativeai as genai
import os
import json
import base64
from app.models import EmergencyResponse

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Using gemini-1.5-flash for multimodal capabilities (free tier)
model = genai.GenerativeModel('gemini-1.5-flash')

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
      "recommend_sos": true/false,
      "explanation": "..."
    }}
    """
    
    vision_extra = "If an image is provided, use it to assess the severity, disaster type, and any visible risks." if imageBase64 else ""
    prompt = prompt_template.format(message=message, vision_extra=vision_extra)
    
    try:
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

        response = model.generate_content(content)
        response_text = response.text
        
        # Robust JSON extraction from markdown or raw text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        else:
            # Final safety: strip anything that might be wrapping the JSON
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            
        data = json.loads(response_text)
        return EmergencyResponse(**data)
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return EmergencyResponse(
            classification="other",
            severity_level="medium", 
            sentiment="calm",
            urgency_score=5,
            guidance=[
                "If you are in danger, please move to a safe location immediately and wait for rescuers."
            ],
            recommend_sos=False,
            explanation="AI analysis failed or timed out."
        )

