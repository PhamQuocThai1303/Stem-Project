import cv2
import numpy as np
import tensorflow as tf
import keras
from keras import layers, models
from keras.optimizers import Adam

class EmotionDetector:
    def __init__(self):
        self.emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.model = self._build_model()
        
    def _build_model(self):
        inputs = layers.Input(shape=(48, 48, 1))
        
        # First Convolutional Block
        x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.25)(x)
        
        # Second Convolutional Block
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.25)(x)
        
        # Third Convolutional Block
        x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.25)(x)
        
        # Dense Layers
        x = layers.Flatten()(x)
        x = layers.Dense(1024, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.5)(x)
        x = layers.Dense(512, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.5)(x)
        
        # Output Layer
        outputs = layers.Dense(len(self.emotions), activation='softmax')(x)
        
        # Create model
        model = models.Model(inputs=inputs, outputs=outputs)
        
        # Compile model with modern optimizer settings
        optimizer = Adam(learning_rate=0.001)
        model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Load pre-trained weights if available
        try:
            model.load_weights('server/emotion_model_weights.h5')
            print("Loaded model weights successfully")
        except Exception as e:
            print(f"No pre-trained weights found. Model will need to be trained. Error: {str(e)}")
        
        return model

    def preprocess_face(self, face_img):
        # Resize to 48x48
        face_img = cv2.resize(face_img, (48, 48))
        # Convert to grayscale if not already
        if len(face_img.shape) == 3:
            face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
        # Normalize
        face_img = face_img.astype('float32') / 255.0
        # Reshape for model input
        face_img = np.expand_dims(face_img, axis=-1)
        face_img = np.expand_dims(face_img, axis=0)
        return face_img

    def detect_emotion(self, frame):
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces using cascade classifier
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        results = []
        for (x, y, w, h) in faces:
            try:
                # Extract and preprocess face ROI
                face_roi = gray[y:y+h, x:x+w]
                processed_face = self.preprocess_face(face_roi)
                
                # Get prediction
                prediction = self.model.predict(processed_face, verbose=0)[0]
                emotion_idx = np.argmax(prediction)
                emotion = self.emotions[emotion_idx]
                confidence = float(prediction[emotion_idx])
                
                # Draw rectangle and text
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(
                    frame, 
                    f"{emotion}: {confidence:.2f}", 
                    (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.9,
                    (0, 255, 0),
                    2
                )
                
                # Add result to list
                results.append({
                    "emotion": emotion,
                    "confidence": confidence,
                    "position": {
                        "x": int(x),
                        "y": int(y),
                        "width": int(w),
                        "height": int(h)
                    }
                })
                
            except Exception as e:
                print(f"Error processing face ROI: {str(e)}")
                continue
        
        return frame, results

# Create singleton instance
detector = EmotionDetector() 