import google.generativeai as genai
import os
import json
from app.models import EmergencyResponse

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-pro')

def get_gemini_response(message: str) -> EmergencyResponse:
    prompt_template = """
    You are the RescueLink Smart Assistant, an AI expert in disaster management and the RescueLink platform.
    
    CRITICAL GOALS:
    1. DETECT EMOTION: Identify if the user is panicked, scared, angry, or calm.
    2. DETECT URGENCY: Score the urgency from 1-10.
    3. PROVIDE GUIDANCE: For emergencies, give 3-5 clear, life-saving steps.
    4. PLATFORM KNOWLEDGE: Answer questions about SOS, volunteering, NGOs, and donations based on these facts:
       - SOS: Shares live location with verified Volunteers/NGOs.
       - Volunteers/NGOs: Must be verified by Admin before they can see SOS requests.
       - Privacy: Location is ONLY shared during an active SOS and is deleted when resolved.
       - Roles: Citizen (reports), Volunteer (rescues), NGO (coordinates/donates), Admin (manages).
    
    User Input: "{message}"
    
    Return response STRICTLY in JSON format:
    {{
      "classification": "medical | flood | fire | earthquake | landslide | platform | other",
      "severity_level": "low | medium | high",
      "sentiment": "panicked | scared | anxious | calm | curious",
      "urgency_score": 1,
      "guidance": [
         "Step 1...",
         "Step 2..."
      ],
      "recommend_sos": true/false,
      "explanation": "Brief explanation of your assessment"
    }}
    """
    
    prompt = prompt_template.format(message=message)
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Parse JSON from response
        # Sometimes Gemini wraps JSON in markdown code blocks, remove them
        if "```json" in response_text:
            response_text = response_text.replace("```json", "").replace("```", "")
        
        data = json.loads(response_text)
        
        # Validation
        return EmergencyResponse(**data)
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        # Fallback response if Gemini fails
        return EmergencyResponse(
            classification="other",
            severity_level="medium", 
            sentiment="calm",
            urgency_score=5,
            guidance=[
                "I might not have the exact answer, but if you're in danger or need help right now, please send an SOS request from the dashboard so responders in your area can see your location."
            ],
            recommend_sos=False,
            explanation="Service momentarily unavailable."
        )

