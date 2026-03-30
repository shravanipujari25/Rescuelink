import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

def train_disaster_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "disaster_data.csv")
    
    if not os.path.exists(data_path):
        print(f"❌ Error: Could not find dataset at {data_path}. Please run generate_data.py first.")
        return

    print("Load dataset...")
    df = pd.read_csv(data_path)
    
    # Features and Target
    X = df.drop(columns=["Disaster_Type"])
    y = df["Disaster_Type"]
    
    # Split the data
    print("Splitting data into 80% train, 20% test...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the Random Forest
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n✅ Training Complete. Accuracy: {accuracy * 100:.2f}%")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    service_dir = os.path.join(base_dir, "..", "app", "services")
    os.makedirs(service_dir, exist_ok=True)
    
    model_path = os.path.join(service_dir, "disaster_model.pkl")
    joblib.dump(model, model_path)
    
    # Also save the columns used during training
    columns_path = os.path.join(service_dir, "disaster_model_columns.pkl")
    joblib.dump(list(X.columns), columns_path)
    
    print(f"💾 Model saved to: {model_path}")
    print(f"💾 Columns saved to: {columns_path}")

if __name__ == "__main__":
    train_disaster_model()
