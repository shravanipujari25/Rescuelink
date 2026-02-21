from app.models import EmergencyResponse

def classify_rule_based(message: str) -> EmergencyResponse | None:
    message_lower = message.lower()
    
    # 1. HIGH-RISK / DISASTER CHECK (Priority)
    # If ANY high-risk keyword is found, return strict High Severity + Correct Classification immediately.
    
    # Priority: Fire > Flood > Earthquake > Medical > Landslide
    # We check specific phrases first to avoid generic "trapped" matching the wrong thing.
    
    high_risk_patterns = {
        "fire": ["explosion", "gas leak", "fire spreading", "warehouse fire", "factory", "building on fire"],
        "flood": ["water rising rapidly", "entire area flooded", "bridge collapsed", "roof"], 
        "earthquake": ["building collapsed", "debris", "cracks in walls", "rubble", "structure failed"], 
        "medical": ["mass casualty", "multiple injured", "severe bleeding", "unconscious", "not breathing", "heart attack", "chest pain", "heart beating fast"],
        "landslide": ["mudslide", "rocks falling", "landslide"]
    }
    
    # Check "trapped" + context separately if needed, or rely on specific combinations above.
    # If message has "trapped", we need to know WHERE. 
    # But for now, let's keep the high risk patterns specific.
    # Add "drowning" to flood high risk?
    
    high_risk_patterns["flood"].append("drowning")
    high_risk_patterns["flood"].append("stuck in water")
    
    high_risk_patterns["earthquake"].append("trapped under")
    high_risk_patterns["earthquake"].append("trapped in")
    
    # Global check
    for category, patterns in high_risk_patterns.items():
        if any(pattern in message_lower for pattern in patterns):
            return EmergencyResponse(
                classification=category,
                severity_level="high",
                recommend_sos=True,
                guidance=get_guidance(category)
            )
            
    # Generic "trapped" without context?
    # If "people trapped" is the ONLY info, we might default to Earthquake (collapse) or Fire?
    # But let's check standard first.

    # 2. STANDARD CATEGORY CHECK (Medium/Low)
    # Only if no high-risk disaster was found.
    
    classification = "other"
    detected = False
    
    category_keywords = {
        "fire": ["fire", "smoke", "burning", "flames", "candle", "gas leak", "explosion", "spark"],
        "medical": [
            "medical", "injury", "pain", "breathing", "stroke", "cut", "burn", "headache", 
            "dizziness", "scratch", "hurts", "doctor", "ambulance", "bleeding", "blood", 
            "accident", "heart", "chest", "pulse", "dizzy", "sick", "nauseous", "broken", 
            "bone", "fall", "fell", "hit", "unconscious", "choking", "poison"
        ],
        "flood": ["flood", "water", "leak", "puddle", "rain", "river", "drown"],
        "earthquake": ["earthquake", "shaking", "ground moving", "tremor", "quake", "aftershock"],
        "landslide": ["landslide", "mudslide", "rockfall"],
        "platform": ["how to", "use", "website", "what is", "help", "hello", "hi", "hey", "contact", "number", "phone", "call", "helpline", "sos", "volunteer", "ngo", "admin", "data", "privacy", "track", "rescue", "status"]
    }

    for category, words in category_keywords.items():
        if any(word in message_lower for word in words):
            classification = category
            detected = True
            break
            
    if classification == "platform" and detected:
        # Check if specifically asking for contacts
        contact_keywords = ["contact", "number", "phone", "call", "helpline"]
        if any(k in message_lower for k in contact_keywords):
            return EmergencyResponse(
                classification="platform",
                severity_level="low",
                sentiment="calm",
                urgency_score=1,
                recommend_sos=False,
                explanation="Providing emergency contact numbers.",
                guidance=[
                    "Emergency Services (National): 112",
                    "Police: 100",
                    "Ambulance: 102",
                    "Fire: 101",
                    "Disaster Management: 108"
                ]
            )
            
        # SOS specific questions
        sos_keywords = ["send sos", "how to sos", "press sos", "what is sos", "trigger sos"]
        if any(k in message_lower for k in sos_keywords):
            return EmergencyResponse(
                classification="platform",
                severity_level="low",
                sentiment="curious",
                urgency_score=2,
                recommend_sos=False,
                explanation="Explaining how to use the SOS feature.",
                guidance=[
                    "Click the large red 'SOS' button on your dashboard.",
                    "Fill in the emergency type and description.",
                    "Ensure location permissions are enabled.",
                    "Verified Volunteers and NGOs will receive your alert instantly.",
                    "You can track rescue status on your dashboard."
                ]
            )

        # Volunteer/NGO questions
        role_keywords = ["become volunteer", "verification", "join ngo", "accept tasks"]
        if any(k in message_lower for k in role_keywords):
            return EmergencyResponse(
                classification="platform",
                severity_level="low",
                sentiment="curious",
                urgency_score=2,
                recommend_sos=False,
                explanation="Explaining volunteer and NGO recruitment.",
                guidance=[
                    "Sign up with the 'Volunteer' or 'NGO' role.",
                    "Complete your profile and wait for Admin verification.",
                    "Once verified, you will see active SOS requests near you.",
                    "Admins manually screen every responder for community safety."
                ]
            )

        return EmergencyResponse(
            classification="platform",
            severity_level="low",
            sentiment="calm",
            urgency_score=1,
            recommend_sos=False,
            explanation="Welcome message and main features overview.",
            guidance=[
                "Welcome to GeoGuard!",
                "1. Use the 'Send SOS' button for immediate help.",
                "2. Visit 'Donations' to support ongoing relief.",
                "3. Check your Dashboard for active emergency updates.",
                "4. Live tracking starts only when you trigger an SOS."
            ]
        )

    if detected:
        # Check for High Severity escalation within identified category
        # This handles cases where user says "Flood... trapped" (Step 1 might miss if "trapped" wasn't in flood list)
        
        escalation_keywords = ["trapped", "emergency", "help", "critical", "dying", "accident", "dying", "panicking", "scared"]
        if any(k in message_lower for k in escalation_keywords):
             # If category is identified and has generic escalation words, UPGRADE?
             # User said: "Flood... people trapped" -> High.
             # My step 1 check missed "people trapped" for flood (I removed it).
             # So we need to catch it here.
             
             # If "trapped" is present, it's almost always High.
             if "trapped" in message_lower:
                 sentiment = "panicked" if "panick" in message_lower or "scared" in message_lower else "anxious"
                 return EmergencyResponse(
                    classification=classification,
                    severity_level="high",
                    sentiment=sentiment,
                    urgency_score=9,
                    recommend_sos=True,
                    explanation=f"Detected high severity {classification} situation with signs of distress.",
                    guidance=get_guidance(classification)
                )

    if not detected:
        # One last check for generic high risk that implies a category?
        # e.g. "people trapped" -> likely earthquake/collapse if no other context?
        if "trapped" in message_lower or "collapsed" in message_lower:
             return EmergencyResponse(
                classification="earthquake", # Assuming entrapment implies structural issue/collapse default
                severity_level="high",
                sentiment="scared",
                urgency_score=10,
                recommend_sos=True,
                explanation="Entrapment detected. Recommending immediate SOS.",
                guidance=get_guidance("earthquake")
            )
        return None

    # 3. DETERMINE SPECIFIC LOW SEVERITY
    # Default matches are Medium. Downgrade to Low if specific keywords match.
    
    severity_level = "medium"
    
    low_risk_patterns = {
        "fire": ["candle", "match", "tiny", "controlled"],
        "medical": ["scratch", "headache", "dizziness", "small cut", "mild", "hello"],
        "flood": ["puddle", "drip", "leak"]
    }
    
    if classification in low_risk_patterns:
        if any(word in message_lower for word in low_risk_patterns[classification]):
            severity_level = "low"

    # 4. FINAL RESPONSE
    return EmergencyResponse(
        classification=classification,
        severity_level=severity_level,
        sentiment="calm",
        urgency_score=4 if severity_level == "medium" else 2,
        recommend_sos=False, # Medium/Low never triggers SOS
        explanation=f"Detected a {severity_level} severity {classification} incident.",
        guidance=get_guidance(classification)
    )

def get_guidance(classification):
    guidance_map = {
        "flood": [
            "Get to higher ground immediately.",
            "Avoid walking or driving through flood waters.",
            "Disconnect electrical appliances if safe to do so."
        ],
        "fire": [
            "Evacuate immediately. Stay low to the ground.",
            "Do not use elevators.",
            "Check doors for heat before opening."
        ],
        "medical": [
            "Keep the person calm and still.",
            "Check for severe bleeding and apply pressure if necessary.",
            "Immediately contact medical emergency services."
        ],
        "earthquake": [
            "Drop, Cover, and Hold On.",
            "Stay away from windows and heavy furniture.",
            "If outdoors, stay away from buildings and power lines."
        ],
        "landslide": [
            "Move away from the path of the landslide immediately.",
            "Curl into a tight ball and protect your head.",
            "Stay alert for unusual sounds like trees cracking."
        ],
        "other": [
            "I'm here to help with your emergencies.",
            "You can report an issue or use the chatbot for guidance.",
            "If you're in immediate danger, please trigger an SOS."
        ]
    }
    return guidance_map.get(classification, guidance_map["other"])
