import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import time
from PIL import Image
import io
import json
import base64

class RaspberryPredictor:
    def __init__(self, model_path):
        # Load the trained model
        self.model = load_model(model_path)
        
        # Initialize camera
        self.cap = cv2.VideoCapture(0)  # Use default camera (usually the one connected to Raspberry Pi)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Get class names from the model
        self.class_names = ['class1', 'class2']  # Replace with your actual class names
        
    def preprocess_image(self, image):
        # Resize image to match model input size
        image = cv2.resize(image, (224, 224))
        # Convert to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        # Normalize pixel values
        image = image / 255.0
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        return image
    
    def predict(self, image):
        # Preprocess the image
        processed_image = self.preprocess_image(image)
        
        # Make prediction
        predictions = self.model.predict(processed_image, verbose=0)
        
        # Convert predictions to confidence scores
        confidences = {}
        for i, score in enumerate(predictions[0]):
            confidences[self.class_names[i]] = float(score)
        
        return confidences
    
    def run(self):
        try:
            while True:
                # Capture frame from camera
                ret, frame = self.cap.read()
                if not ret:
                    print("Failed to grab frame")
                    break
                
                # Make prediction
                predictions = self.predict(frame)
                
                # Draw predictions on frame
                y_offset = 30
                for class_name, confidence in predictions.items():
                    text = f"{class_name}: {confidence:.2%}"
                    cv2.putText(frame, text, (10, y_offset), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    y_offset += 30
                
                # Display the frame
                cv2.imshow('Raspberry Pi Prediction', frame)
                
                # Break loop on 'q' press
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                
                # Add small delay to control frame rate
                time.sleep(0.1)
                
        finally:
            # Clean up
            self.cap.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    # Replace with your model path
    MODEL_PATH = "path/to/your/trained/model.h5"
    
    predictor = RaspberryPredictor(MODEL_PATH)
    predictor.run() 