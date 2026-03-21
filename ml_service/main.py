from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
from face_analyzer import FaceAnalyzer
import uvicorn

app = FastAPI(title="AI Face Analysis API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = FaceAnalyzer()

class ImageRequest(BaseModel):
    image: str # Base64 string

@app.post("/api/analyze-face")
async def analyze_face_endpoint(request: ImageRequest = None, file: UploadFile = File(None)):
    """
    POST /api/analyze-face
    Accepts: JSON with base64 'image' string OR multipart/form-data 'file'
    """
    image_bytes = None

    # 1. Handle Multipart File Upload
    if file:
        image_bytes = await file.read()
    
    # 2. Handle Base64 encoded string from JSON body
    elif request and request.image:
        try:
            # Handle data:image/jpeg;base64,... prefix if present
            header, encoded = request.image.split(",", 1) if "," in request.image else (None, request.image)
            image_bytes = base64.b64decode(encoded)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image provided. Send a 'file' or a JSON with 'image' (base64).")

    # 3. Process with FaceAnalyzer
    success, metrics, data, error = analyzer.analyze_face(image_bytes)

    # 4. Return structured response to match frontend UI state
    if not success:
        return {
            "success": False,
            "metrics": metrics or {
                "points_tracked": 0,
                "processing_latency_ms": 0,
                "face_confidence": "None"
            },
            "data": None,
            "error": error
        }

    return {
        "success": True,
        "metrics": metrics,
        "data": data
    }

# Instructions for running the server:
# 1. Install dependencies: pip install -r requirements.txt
# 2. Run server: uvicorn main:app --host 0.0.0.0 --port 5000 --reload

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
