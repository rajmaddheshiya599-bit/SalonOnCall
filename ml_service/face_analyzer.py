import mediapipe as mp
import numpy as np
import cv2

class FaceAnalyzer:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

    def calculate_distance(self, p1, p2):
        return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

    def classify_shape(self, image_bytes):
        # Convert image bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return None, "Invalid image"

        results = self.face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if not results.multi_face_landmarks:
            return None, "No face detected"

        landmarks = results.multi_face_landmarks[0].landmark

        # Key Landmark Indices
        # 10: Top of forehead
        # 152: Bottom of chin
        # 234, 454: Cheekbones (Left, Right)
        # 54, 284: Forehead width approx
        # 132, 361: Jawline width approx

        face_height = self.calculate_distance(landmarks[10], landmarks[152])
        cheekbone_width = self.calculate_distance(landmarks[234], landmarks[454])
        forehead_width = self.calculate_distance(landmarks[54], landmarks[284])
        jaw_width = self.calculate_distance(landmarks[172], landmarks[397]) # Simplified jaw width

        # Ratios
        height_width_ratio = face_height / cheekbone_width
        jaw_cheek_ratio = jaw_width / cheekbone_width
        forehead_cheek_ratio = forehead_width / cheekbone_width

        shape = "Oval" # Default
        
        # Heuristic Logic for Face Shape Classification
        if height_width_ratio > 1.5:
            shape = "Oval"
        elif height_width_ratio < 1.3 and jaw_cheek_ratio > 0.8:
            shape = "Square"
        elif height_width_ratio < 1.3 and jaw_cheek_ratio < 0.8:
            shape = "Round"
        elif forehead_cheek_ratio > jaw_cheek_ratio and jaw_cheek_ratio < 0.7:
            shape = "Heart"
        elif cheekbone_width > forehead_width and cheekbone_width > jaw_width:
            shape = "Diamond"

        recommendations = self.get_hairstyles(shape)
        
        return {
            "shape": shape,
            "ratios": {
                "height_width": round(height_width_ratio, 2),
                "jaw_cheek": round(jaw_cheek_ratio, 2),
                "forehead_cheek": round(forehead_cheek_ratio, 2)
            },
            "recommendations": recommendations
        }, None

    def analyze_face(self, image_bytes):
        """
        Comprehensive face analysis for the FastAPI endpoint.
        Returns: (success, metrics, data, error)
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return False, None, None, "Invalid image format"

        h, w, _ = image.shape
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        import time
        start_time = time.time()
        results = self.face_mesh.process(rgb_image)
        latency = int((time.time() - start_time) * 1000)

        if not results.multi_face_landmarks:
            return False, {
                "points_tracked": 0,
                "processing_latency_ms": latency,
                "face_confidence": "None"
            }, None, "No face detected"

        landmarks = results.multi_face_landmarks[0].landmark
        
        # Format landmarks
        formatted_landmarks = [{"x": round(l.x, 4), "y": round(l.y, 4), "z": round(l.z, 4)} for l in landmarks]
        
        # Calculate bounding box
        x_coords = [l.x for l in landmarks]
        y_coords = [l.y for l in landmarks]
        x_min, x_max = min(x_coords), max(x_coords)
        y_min, y_max = min(y_coords), max(y_coords)
        
        bounding_box = {
            "x_min": round(x_min, 4),
            "y_min": round(y_min, 4),
            "width": round(x_max - x_min, 4),
            "height": round(y_max - y_min, 4)
        }

        metrics = {
            "points_tracked": len(landmarks),
            "processing_latency_ms": latency,
            "face_confidence": "High" # MediaPipe Face Mesh doesn't provide a direct confidence score per detection in this mode, but success relative to threshold implies High
        }

        data = {
            "landmarks": formatted_landmarks,
            "bounding_box": bounding_box
        }

        return True, metrics, data, None

    def get_hairstyles(self, shape):
        styles = {
            "Oval": ["Fringes", "Long Waves", "Blunt Bob", "Tapered Cut"],
            "Round": ["Pompadour", "Side Part", "Long Bob (Lob)", "Pixie Cut"],
            "Square": ["Undercut", "Quiff", "Side Swept Peaks", "Soft Layers"],
            "Heart": ["Side Swept Fringes", "Long Pixie", "Chin-Length Bob", "Textured Layers"],
            "Diamond": ["Side Part", "Messy Fringe", "Textured Crop", "Slicked Back"]
        }
        return styles.get(shape, ["Classic Cut"])
