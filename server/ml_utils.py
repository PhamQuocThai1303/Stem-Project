import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import cv2
import base64
import io
from PIL import Image
import os
import json

def preprocess_image(image_data, target_size=(224, 224)):
    """Tiền xử lý ảnh từ base64 string hoặc numpy array"""
    if isinstance(image_data, str) and image_data.startswith('data:image'):
        # Xử lý base64 string
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        image = image.resize(target_size)
        image = np.array(image)
    else:
        # Xử lý numpy array
        image = cv2.resize(image_data, target_size)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    image = image.astype('float32') / 255.0
    return image

def create_model(num_classes):
    """Tạo model CNN đơn giản"""
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

class ModelTrainer:
    def __init__(self):
        self.model = None
        self.class_names = []
    
    def prepare_data(self, class_data):
        """Chuẩn bị dữ liệu training từ class_data"""
        X = []
        y = []
        self.class_names = [cls['name'] for cls in class_data]
        
        for class_idx, class_info in enumerate(class_data):
            for image in class_info['images']:
                processed_image = preprocess_image(image)
                X.append(processed_image)
                y.append(class_idx)
        
        X = np.array(X)
        y = tf.keras.utils.to_categorical(y, num_classes=len(self.class_names))
        
        return X, y
    
    def train(self, class_data, epochs=10):
        """Train model với dữ liệu từ các class"""
        X, y = self.prepare_data(class_data)
        
        self.model = create_model(len(self.class_names))
        history = self.model.fit(
            X, y,
            epochs=epochs,
            validation_split=0.2,
            batch_size=32
        )
        
        return history.history
    
    def predict(self, image):
        """Dự đoán class cho một ảnh"""
        if self.model is None:
            raise ValueError("Model chưa được train")
        
        processed_image = preprocess_image(image)
        processed_image = np.expand_dims(processed_image, axis=0)
        
        predictions = self.model.predict(processed_image)
        return {
            name: float(pred) * 100 
            for name, pred in zip(self.class_names, predictions[0])
        }
    
    def export_model(self):
        """Export model sang định dạng SavedModel"""
        if self.model is None:
            raise ValueError("Model chưa được train")
        
        # Tạo thư mục nếu chưa tồn tại
        export_path = "exported_model"
        if not os.path.exists(export_path):
            os.makedirs(export_path)
        
        # Lưu model dưới dạng SavedModel
        model_path = os.path.join(export_path, "saved_model")
        tf.saved_model.save(self.model, model_path)
        
        # Lưu metadata (class names và thông tin khác)
        metadata = {
            "class_names": self.class_names,
            "input_shape": [224, 224, 3],
            "preprocessing": "normalize_0_1"
        }
        
        metadata_path = os.path.join(export_path, "metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        
        return export_path