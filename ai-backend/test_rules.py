from app.services.rule_classifier import classify_rule_based
import sys

def test(message, expected_class, expected_severity, expected_sos):
    print(f"Testing: '{message}'")
    result = classify_rule_based(message)
    if not result:
        if expected_class is None:
             print("  PASS (Returned None as expected)")
             return
        print(f"FAILED: Got None, expected {expected_class}")
        return
        
    print(f"  Got: Class={result.classification}, Severity={result.severity_level}, SOS={result.recommend_sos}")
    
    match_class = result.classification == expected_class
    match_severity = result.severity_level == expected_severity
    match_sos = result.recommend_sos == expected_sos
    
    if match_class and match_severity and match_sos:
        print("  PASS")
    else:
        print(f"  FAILED: Expected Class={expected_class}, Sev={expected_severity}, SOS={expected_sos}")

# Test Cases
print("--- FIRE TESTS ---")
test("There is a fire in the kitchen", "fire", "medium", False)
test("The apartment building is on fire people trapped", "fire", "high", True)
test("I lit a small candle", "fire", "low", False)
test("There was a massive explosion", "fire", "high", True)

print("\n--- MEDICAL TESTS ---")
test("I have a small scratch on my finger", "medical", "low", False)
test("Man unconscious and not breathing", "medical", "high", True)
test("I have a headache", "medical", "low", False)
test("My arm hurts", "medical", "medium", False)

print("\n--- FLOOD TESTS ---")
test("Water leak in the basement", "flood", "low", False)
test("Entire area flooded water rising rapidly", "flood", "high", True)
test("There is a puddle", "flood", "low", False)
test("The street is flooded", "flood", "medium", False)

print("\n--- EARTHQUAKE TESTS ---")
test("I felt an earthquake", "earthquake", "medium", False)
test("Building collapsed and people trapped", "earthquake", "high", True)

print("\n--- OTHER TESTS ---")
test("My cat is stuck in a tree", None, None, None)
test("I feel scared", None, None, None) # Should fallback to Gemini, return medium/other
