import os
import joblib
import pandas as pd
from app.models import PredictionRequest, PredictionResponse

class PredictionService:
    def __init__(self):
        self.model = None
        self.columns = None
        self._load_model()

    def _load_model(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "disaster_model.pkl")
        columns_path = os.path.join(base_dir, "disaster_model_columns.pkl")
        
        if os.path.exists(model_path) and os.path.exists(columns_path):
            self.model = joblib.load(model_path)
            self.columns = joblib.load(columns_path)
            print(f"✅ Prediction model loaded successfully from {model_path}")
        else:
            print("⚠️ Warning: Model or columns file not found. Predictions will not work.")

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        if not self.model or not self.columns:
            # Try to reload just in case it was generated recently
            self._load_model()
            if not self.model or not self.columns:
                raise RuntimeError("Model is not loaded. Train the model first.")

        # Create DataFrame directly from Pydantic model dump
        data = req.model_dump()
        df = pd.DataFrame([data])
        
        # Ensure column order matches training
        df = df[self.columns]
        
        # Predict
        prediction = self.model.predict(df)[0]
        prob_array = self.model.predict_proba(df)[0]
        
        # Map probabilities back to classes
        classes = self.model.classes_
        probabilities = {cls: float(prob) for cls, prob in zip(classes, prob_array)}
        
        return PredictionResponse(
            predicted_disaster=prediction,
            probabilities=probabilities
        )

# Singleton instance
prediction_service = PredictionService()
