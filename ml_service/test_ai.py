import os
import base64
import requests
from rush_predictor import RushPredictor
from face_analyzer import FaceAnalyzer

def test_rush_prediction():
    print("\n--- Testing Rush Prediction (ML) ---")
    predictor = RushPredictor()
    
    # Test different scenarios
    scenarios = [
        {"day": 0, "hour": 10, "label": "Monday Morning (9-5)"},
        {"day": 5, "hour": 14, "label": "Saturday Afternoon (Peak)"},
        {"day": 2, "hour": 22, "label": "Wednesday Night (Closed/Late)"}
    ]
    
    for s in scenarios:
        prediction = predictor.predict(day=s['day'], hour=s['hour'])
        print(f"{s['label']}: Predicted {prediction} customers.")

def test_face_analysis_logic():
    print("\n--- Testing Face Analysis Logic ---")
    analyzer = FaceAnalyzer()
    
    # Since we need an actual image for MediaPipe, we'll check if a test image exists
    test_image_path = 'test_face.jpg' # You can place a sample image here
    
    if os.path.exists(test_image_path):
        with open(test_image_path, "rb") as f:
            image_bytes = f.read()
        
        success, metrics, data, error = analyzer.analyze_face(image_bytes)
        if success:
            print(f"Success: Tracked {metrics['points_tracked']} landmarks.")
            print(f"Latency: {metrics['processing_latency_ms']}ms")
        else:
            print(f"Analysis Failed: {error}")
    else:
        print("Note: Skipping image test because 'test_face.jpg' was not found.")
        print("Tip: You can test this live via the frontend or by uploading a file.")

def test_api_endpoints():
    print("\n--- Checking API Services ---")
    services = [
        {"name": "ML Service (Flask/FastAPI)", "url": "http://localhost:5000/health"},
        {"name": "Backend (Node.js)", "url": "http://localhost:3000/api/barbers"}
    ]
    
    for s in services:
        try:
            response = requests.get(s['url'], timeout=2)
            if response.status_code == 200:
                print(f"[ONLINE] {s['name']}")
            else:
                print(f"[ERROR] {s['name']} returned {response.status_code}")
        except:
            print(f"[OFFLINE] {s['name']} (Is it running?)")

if __name__ == "__main__":
    test_rush_prediction()
    test_face_analysis_logic()
    test_api_endpoints()
