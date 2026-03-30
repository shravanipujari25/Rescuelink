import numpy as np
import pandas as pd
import os

def generate_disaster_dataset(num_records=30000):
    np.random.seed(42)
    
    # 1. Base generation
    temp = np.random.uniform(-10, 50, num_records)
    humidity = np.random.uniform(10, 100, num_records)
    wind_speed = np.random.uniform(0, 120, num_records) # Increased in hurricane scenarios later
    precip = np.random.uniform(0, 50, num_records) # Normal is low
    river_level = np.random.uniform(0, 5, num_records) # Normal is low
    soil_moisture = np.random.uniform(10, 80, num_records)
    seismic = np.random.uniform(0.1, 3.0, num_records) # Normal is very low
    pressure = np.random.uniform(980, 1030, num_records)
    
    labels = ["Normal"] * num_records
    
    # Intentionally inject disasters (about 40% of the dataset will be some disaster)
    for i in range(num_records):
        rand = np.random.random()
        
        # 10% Earthquake
        if 0.0 <= rand < 0.10:
            labels[i] = "Earthquake"
            seismic[i] = np.random.uniform(5.5, 9.5)
            
        # 10% Flood
        elif 0.10 <= rand < 0.20:
            labels[i] = "Flood"
            precip[i] = np.random.uniform(100, 300)
            river_level[i] = np.random.uniform(8, 15)
            soil_moisture[i] = np.random.uniform(85, 100)
            
        # 10% Wildfire
        elif 0.20 <= rand < 0.30:
            labels[i] = "Wildfire"
            temp[i] = np.random.uniform(35, 50)
            humidity[i] = np.random.uniform(5, 25)
            soil_moisture[i] = np.random.uniform(0, 15)
            wind_speed[i] = np.random.uniform(30, 80)
            
        # 10% Hurricane
        elif 0.30 <= rand < 0.40:
            labels[i] = "Hurricane"
            wind_speed[i] = np.random.uniform(120, 250)
            precip[i] = np.random.uniform(150, 400)
            pressure[i] = np.random.uniform(900, 960)
            
    # Combine into DataFrame
    df = pd.DataFrame({
        "Temperature": temp,
        "Humidity": humidity,
        "Wind_Speed": wind_speed,
        "Precipitation": precip,
        "River_Water_Level": river_level,
        "Soil_Moisture": soil_moisture,
        "Seismic_Activity": seismic,
        "Atmospheric_Pressure": pressure,
        "Disaster_Type": labels
    })
    
    # Shuffle dataset
    df = df.sample(frac=1).reset_index(drop=True)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "disaster_data.csv")
    df.to_csv(output_path, index=False)
    print(f"✅ Generated {num_records} records of disaster data at {output_path}")

if __name__ == "__main__":
    generate_disaster_dataset(30000)
