from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import time
from face_analyzer import FaceAnalyzer

app = Flask(__name__)

# Production-ready CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}})

analyzer = FaceAnalyzer()

@app.route('/api/analyze-face', methods=['POST'])
def analyze_face_endpoint():
    """
    Production-ready endpoint for AI Face Analysis.
    Expects JSON body: { "image": "base64_string" }
    """
    start_time = time.time()
    data = request.json
    
    if not data or 'image' not in data:
        return jsonify({
            "success": False, 
            "error": "Missing 'image' key in request body",
            "metrics": {"points_tracked": 0, "processing_latency_ms": 0, "face_confidence": "None"}
        }), 400
    
    try:
        # Handle data:image/jpeg;base64,... prefix
        encoded_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(encoded_data)
        
        # Process with optimized analyzer
        success, metrics, result_data, error = analyzer.analyze_face(image_bytes)
        
        # Calculate full response latency
        total_latency = int((time.time() - start_time) * 1000)
        if metrics:
            metrics['processing_latency_ms'] = total_latency

        if not success:
            return jsonify({
                "success": False,
                "error": error or "Face analysis failed",
                "metrics": metrics or {"points_tracked": 0, "processing_latency_ms": total_latency, "face_confidence": "None"}
            }), 200 # Return 200 for "valid" application error states if desired, or 400. 200 is safer for some frontends.

        # Add shape and recommendations to the response as requested in the latest prompt
        shape_info, _ = analyzer.classify_shape(image_bytes)
        if shape_info:
            result_data['shape_info'] = shape_info

        return jsonify({
            "success": True,
            "metrics": metrics,
            "data": result_data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal Server Error: {str(e)}",
            "metrics": {"points_tracked": 0, "processing_latency_ms": int((time.time() - start_time) * 1000), "face_confidence": "None"}
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "AI Face Analysis"}), 200

if __name__ == '__main__':
    # Use gunicorn or similar for real production, but for local/Render uvicorn/flask is fine.
    app.run(host='0.0.0.0', port=5000, threaded=True)
