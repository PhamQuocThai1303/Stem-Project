import cv2
import numpy as np
from tensorflow.keras.models import load_model

class EmotionDetector:
    EMOTIONS = ["angry", "disgust", "fear", "happy", "sad", "surprised", "neutral"]
    EMOTION_COLORS = {
        "angry": (0, 0, 255),      # Red
        "disgust": (0, 255, 0),    # Green  
        "fear": (0, 0, 0),         # Black
        "happy": (255, 255, 0),    # Yellow
        "sad": (255, 0, 0),        # Blue
        "surprised": (0, 255, 255), # Cyan
        "neutral": (255, 255, 255)  # White
    }

    def __init__(self):
        # Load face detection model
        prototxt_path = "models/face_detection/deploy.prototxt.txt"
        caffemodel_path = "models/face_detection/res10_300x300_ssd_iter_140000.caffemodel"
        self.face_detector = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)
        
        # Load emotion classification model
        self.emotion_classifier = load_model("models/trained_model/mini_xception.0.65-119.hdf5")

    def preprocess_face(self, face):
        """Preprocess face for emotion detection"""
        # Convert to grayscale
        gray_face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        
        # Resize to 48x48 which is the input size for the model
        gray_face = cv2.resize(gray_face, (48, 48))
        
        # Normalize pixel values
        gray_face = gray_face.astype('float32') / 255.0
        
        # Add batch and channel dimensions
        gray_face = np.expand_dims(gray_face, axis=0)
        gray_face = np.expand_dims(gray_face, axis=-1)
        
        return gray_face

    def detect_emotion(self, frame):
        """Detect faces and their emotions in the frame"""
        if frame is None:
            return []
            
        (h, w) = frame.shape[:2]
        
        # Prepare input blob for face detection
        blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0,
                                   (300, 300), (104.0, 177.0, 123.0))
        self.face_detector.setInput(blob)
        detections = self.face_detector.forward()
        
        results = []
        
        # Process each face detection
        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            
            if confidence < 0.5:  # Increased confidence threshold
                continue
                
            # Get face coordinates
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            
            # Ensure coordinates are within frame bounds
            startX = max(0, startX)
            startY = max(0, startY)
            endX = min(w, endX)
            endY = min(h, endY)
            
            # Extract face ROI
            face = frame[startY:endY, startX:endX]
            
            if face.size == 0:
                continue
                
            try:
                # Preprocess face for emotion detection
                processed_face = self.preprocess_face(face)
                
                # Predict emotion
                emotion_prediction = self.emotion_classifier.predict(processed_face)[0]
                emotion_idx = np.argmax(emotion_prediction)
                emotion_label = self.EMOTIONS[emotion_idx]
                emotion_confidence = float(emotion_prediction[emotion_idx])
                
                # Get color for this emotion
                emotion_color = self.EMOTION_COLORS[emotion_label]
                
                results.append({
                    "bbox": [int(startX), int(startY), int(endX), int(endY)],
                    "emotion": {
                        "label": emotion_label,
                        "confidence": emotion_confidence,
                        "color": emotion_color
                    }
                })
                
            except Exception as e:
                print(f"Error processing face: {str(e)}")
                continue
        
        return results

# Create singleton instance
detector = EmotionDetector() 