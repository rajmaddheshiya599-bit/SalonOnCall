import os
from rush_predictor import RushPredictor

def main():
    print("--- SalonOnCall AI Model Trainer ---")
    predictor = RushPredictor()
    
    print("\n[1/3] Checking for training data...")
    if not os.path.exists('bookings_history.csv'):
        print("No history found. Generating synthetic training data...")
        predictor.generate_synthetic_data(n_samples=500)
    else:
        print("Found bookings_history.csv.")

    print("\n[2/3] Starting model training (Linear Regression)...")
    try:
        status = predictor.train()
        print(f"Status: {status}")
    except Exception as e:
        print(f"Error during training: {str(e)}")
        return

    print("\n[3/3] Verifying model...")
    if os.path.exists('rush_model.joblib'):
        print("Success: 'rush_model.joblib' has been created and saved.")
        
        # Test a quick prediction
        test_pred = predictor.predict(day=5, hour=14) # Saturday at 2 PM
        print(f"Test Prediction (Saturday 2PM): {test_pred} expected customers.")
    else:
        print("Error: Model file was not saved.")

if __name__ == "__main__":
    main()
