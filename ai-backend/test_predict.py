from app.services.prediction_service import prediction_service
from app.models import PredictionRequest

req_flood = PredictionRequest(
    Temperature=20.0,
    Humidity=95.0,
    Wind_Speed=30.0,
    Precipitation=250.0,
    River_Water_Level=12.0,
    Soil_Moisture=95.0,
    Seismic_Activity=0.5,
    Atmospheric_Pressure=1010.0
)

req_hurricane = PredictionRequest(
    Temperature=28.0,
    Humidity=85.0,
    Wind_Speed=180.0,
    Precipitation=300.0,
    River_Water_Level=8.0,
    Soil_Moisture=70.0,
    Seismic_Activity=1.0,
    Atmospheric_Pressure=920.0
)

print("\n--- Testing Flood Conditions ---")
res = prediction_service.predict(req_flood)
print(f"Predicted: {res.predicted_disaster}")
print(f"Probabilities: {res.probabilities}")

print("\n--- Testing Hurricane Conditions ---")
res2 = prediction_service.predict(req_hurricane)
print(f"Predicted: {res2.predicted_disaster}")
print(f"Probabilities: {res2.probabilities}")
