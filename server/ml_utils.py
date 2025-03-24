import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import cv2
import base64
import io
from PIL import Image
import os
import json
import shutil
import zipfile
import tempfile
import subprocess
import matplotlib.pyplot as plt

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
    
    # Sử dụng preprocess_input của MobileNetV2
    image = preprocess_input(image)
    return image

def create_model(num_classes):
    """Tạo model dựa trên MobileNetV2"""
    # Data augmentation
    data_augmentation = models.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ])
    
    # Base model (MobileNetV2)
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base model
    
    # Build model
    model = models.Sequential([
        data_augmentation,
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(128, activation='relu'),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

class ModelTrainer:
    def __init__(self):
        self.model = None
        self.class_names = []
        self.datagen = ImageDataGenerator(
            rotation_range=30,
            width_shift_range=0.3,
            height_shift_range=0.3,
            horizontal_flip=True,
            vertical_flip=True,
            fill_mode='nearest',
            brightness_range=[0.8, 1.2],
            zoom_range=0.2
        )
    
    def prepare_data(self, class_data):
        """Chuẩn bị dữ liệu training từ class_data"""
        X = []
        y = []
        self.class_names = [cls['name'] for cls in class_data]
        
        # Tính toán số lượng mẫu cho mỗi class
        class_counts = [len(cls['images']) for cls in class_data]
        max_samples = max(class_counts)
        
        # Tính class weights nếu dữ liệu không cân bằng
        total_samples = sum(class_counts)
        self.class_weights = {
            i: float(total_samples / (len(class_counts) * count))
            for i, count in enumerate(class_counts)
        }
        
        for class_idx, class_info in enumerate(class_data):
            for image in class_info['images']:
                processed_image = preprocess_image(image)
                X.append(processed_image)
                y.append(class_idx)
        
        X = np.array(X)
        y = tf.keras.utils.to_categorical(y, num_classes=len(self.class_names))
        
        # Chia dữ liệu thành training và validation
        indices = np.arange(len(X))
        np.random.shuffle(indices)
        split = int(0.8 * len(X))
        
        X_train = X[indices[:split]]
        y_train = y[indices[:split]]
        X_val = X[indices[split:]]
        y_val = y[indices[split:]]
        
        print(f"Training set: {len(X_train)} images")
        print(f"Validation set: {len(X_val)} images")
        print(f"Number of classes: {len(self.class_names)}")
        
        return X_train, y_train, X_val, y_val
    
    def train(self, class_data, epochs=50):
        """Train model với dữ liệu từ các class"""
        X_train, y_train, X_val, y_val = self.prepare_data(class_data)
        
        self.model = create_model(len(self.class_names))
        
        # Callbacks
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=15,
            restore_best_weights=True,
            verbose=1
        )
        
        model_checkpoint = ModelCheckpoint(
            'best_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        )
        
        reduce_lr = ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=2,
            min_lr=0.00001,
            verbose=1
        )
        
        # Training
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=[early_stopping, model_checkpoint, reduce_lr],
            class_weight=self.class_weights,
            verbose=1
        )
        
        # Plot training history
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'])
        plt.plot(history.history['val_accuracy'])
        plt.title('Model Accuracy')
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='lower right')
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'])
        plt.plot(history.history['val_loss'])
        plt.title('Model Loss')
        plt.ylabel('Loss')
        plt.xlabel('Epoch')
        plt.legend(['Train', 'Validation'], loc='upper right')
        
        plt.tight_layout()
        plt.savefig('training_history.png')
        plt.close()
        
        # Chuyển đổi history thành dict với các giá trị Python native
        history_dict = {}
        for key, values in history.history.items():
            history_dict[key] = [float(val) for val in values]
        
        return history_dict
    
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

    def export_model(self, format='tensorflow', type='savedmodel'):
        """Export model theo format và type được chọn"""
        if self.model is None:
            raise ValueError("Model chưa được train")

        # Tạo thư mục tạm thời
        with tempfile.TemporaryDirectory() as temp_dir:
            # Lưu metadata chung
            metadata = {
                "class_names": self.class_names,
                "input_shape": [224, 224, 3],
                "preprocessing": "mobilenet_v2",
                "class_weights": self.class_weights
            }

            # Export theo format được chọn
            if format == 'tensorflow':
                metadata_path = os.path.join(temp_dir, "metadata.json")
                with open(metadata_path, "w") as f:
                    json.dump(metadata, f, indent=2)

                if type == 'keras':
                    # Export Keras H5
                    model_path = os.path.join(temp_dir, "model.h5")
                    self.model.save(model_path, save_format='h5')
                else:
                    # Export SavedModel
                    model_path = os.path.join(temp_dir, "saved_model")
                    tf.saved_model.save(self.model, model_path)

            elif format == 'tensorflow.js':
                try:
                    # Bước 1: Lưu model dưới dạng SavedModel
                    saved_model_path = os.path.join(temp_dir, "saved_model")
                    tf.saved_model.save(self.model, saved_model_path)
                    
                    # Bước 2: Sử dụng tensorflowjs_converter để chuyển đổi
                    output_dir = os.path.join(temp_dir, "web_model")
                    os.makedirs(output_dir, exist_ok=True)
                    
                    # Chạy lệnh tensorflowjs_converter
                    converter_cmd = [
                        "tensorflowjs_converter",
                        "--input_format=tf_saved_model",
                        "--output_format=tfjs_graph_model",
                        "--signature_name=serving_default",
                        saved_model_path,
                        output_dir
                    ]
                    
                    result = subprocess.run(
                        converter_cmd,
                        capture_output=True,
                        text=True
                    )
                    
                    if result.returncode != 0:
                        raise Exception(f"Conversion failed: {result.stderr}")
                    
                    # Bước 3: Thêm metadata vào model.json
                    model_json_path = os.path.join(output_dir, "model.json")
                    if os.path.exists(model_json_path):
                        with open(model_json_path, 'r') as f:
                            model_json = json.load(f)
                        
                        model_json["metadata"] = metadata
                        
                        with open(model_json_path, 'w') as f:
                            json.dump(model_json, f, indent=2)
                    
                except Exception as e:
                    print(f"Error during TensorFlow.js export: {e}")
                    raise

            elif format == 'tensorflow-lite':
                metadata_path = os.path.join(temp_dir, "metadata.json")
                with open(metadata_path, "w") as f:
                    json.dump(metadata, f, indent=2)

                # Export TensorFlow Lite
                converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
                tflite_model = converter.convert()
                model_path = os.path.join(temp_dir, "model.tflite")
                with open(model_path, 'wb') as f:
                    f.write(tflite_model)

            # Tạo file zip trong thư mục tạm thời
            zip_path = os.path.join(temp_dir, "model.zip")
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        if file != "model.zip":  # Không nén file zip
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, temp_dir)
                            zipf.write(file_path, arcname)

            # Đọc file zip vào memory
            with open(zip_path, 'rb') as f:
                zip_data = f.read()

        # Tạo file zip mới trong thư mục tạm thời của hệ thống
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        temp_zip.write(zip_data)
        temp_zip.close()

        return temp_zip.name