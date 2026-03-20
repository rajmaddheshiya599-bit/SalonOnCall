from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from face_analyzer import FaceAnalyzer
from rush_predictor import RushPredictor
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

analyzer = FaceAnalyzer()
predictor = RushPredictor()

@app.route('/detect-face', methods=['POST'])
def detect_face():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400
    
    # Image is expected as base64 string
    try:
        image_data = base64.b64decode(data['image'].split(',')[1] if ',' in data['image'] else data['image'])
        result, error = analyzer.classify_shape(image_data)
        if error:
            return jsonify({"error": error}), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict-rush', methods=['POST'])
def predict_rush():
    data = request.json
    # Expects day (0-6), hour (0-23), is_holiday (0/1)
    day = data.get('day', datetime.now().weekday())
    hour = data.get('hour', datetime.now().hour)
    is_holiday = data.get('is_holiday', 0)
    
    prediction = predictor.predict(day, hour, is_holiday)
    
    # Map prediction to "Rush level"
    level = "Low"
    if prediction > 8: level = "Very High"
    elif prediction > 5: level = "High"
    elif prediction > 3: level = "Moderate"
    
    return jsonify({
        "predicted_count": prediction,
        "rush_level": level,
        "best_time_to_visit": "High" if level == "Low" else "Normal" # badge logic
    })

@app.route('/train', methods=['GET'])
def train_model():
    msg = predictor.train()
    return jsonify({"message": msg})

if __name__ == '__main__':
    # Initial training
    predictor.train()
    app.run(host='0.0.0.0', port=5000)
