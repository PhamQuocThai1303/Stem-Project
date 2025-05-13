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
from datetime import datetime
from pathlib import Path
import psutil
import time
from create_training_report import create_training_report

def preprocess_image(image_data, target_size=(224, 224)): # Tiền xử lý ảnh
    if isinstance(image_data, str) and image_data.startswith('data:image'):

        # Xử lý base64 string
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        image = image.resize(target_size)
        image = np.array(image)
    else:
        # Xử lý ảnh từ camera
        image = cv2.resize(image_data, target_size)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # preprocess_input của MobileNetV2
    image = preprocess_input(image)
    return image

def create_model(num_classes, learning_rate):
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
    base_model.trainable = False 
    
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
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

class PerformanceCallback(tf.keras.callbacks.Callback):
    def __init__(self):
        super(PerformanceCallback, self).__init__()
        self.batch_times = []
        self.memory_usage = []
        self.process = psutil.Process(os.getpid())
    
    def on_batch_begin(self, batch, logs=None):
        self.batch_start_time = time.time()
    
    def on_batch_end(self, batch, logs=None):
        # Measure batch time (latency)
        batch_time = time.time() - self.batch_start_time
        self.batch_times.append(batch_time)
        
        # Measure memory usage
        memory_info = self.process.memory_info()
        memory_mb = memory_info.rss / 1024 / 1024  # Convert to MB
        self.memory_usage.append(memory_mb)
    
    def get_performance_stats(self):
        avg_latency = np.mean(self.batch_times) * 1000  
        max_latency = np.max(self.batch_times) * 1000
        avg_memory = np.mean(self.memory_usage)
        max_memory = np.max(self.memory_usage)
        
        return {
            'average_latency_ms': float(avg_latency),
            'max_latency_ms': float(max_latency),
            'average_memory_mb': float(avg_memory),
            'max_memory_mb': float(max_memory)
        }

class ModelTrainer:
    def __init__(self):
        self.model = None
        self.class_weights = None
        self.class_names = []
        self.metadata = {}
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
       
        X = []
        y = []
        self.class_names = [cls['name'] for cls in class_data]
        
        # Số lượng mẫu cho mỗi class
        class_counts = [len(cls['images']) for cls in class_data]
        max_samples = max(class_counts)
        
        # Class weights nếu dữ liệu không cân bằng
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
    
    def train(self, class_data, epochs, batch_size, learning_rate):
        X_train, y_train, X_val, y_val = self.prepare_data(class_data)
        
        self.model = create_model(len(self.class_names), learning_rate)
        
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
        
        performance_callback = PerformanceCallback()
        
        start_time = datetime.now()
        
        # Training
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stopping, model_checkpoint, reduce_lr, performance_callback],
            class_weight=self.class_weights,
            verbose=1
        )
        
        end_time = datetime.now()
        training_time = (end_time - start_time).total_seconds() / 60 
        
        performance_stats = performance_callback.get_performance_stats()
        
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
        
        history_dict['training_time_minutes'] = float(training_time)
        history_dict['training_start_time'] = start_time.isoformat()
        history_dict['training_end_time'] = end_time.isoformat()
        history_dict.update(performance_stats)
        
        model_params = {
            'training_samples': len(X_train),
            'validation_samples': len(X_val),
            'num_classes': len(self.class_names),
            'class_names': self.class_names,
            'class_weights': {str(k): float(v) for k, v in self.class_weights.items()},
            'model_architecture': 'MobileNetV2',
            'input_shape': [224, 224, 3],
            'num_layers': len(self.model.layers),
            'learning_rate': float(learning_rate),
            'batch_size': int(batch_size),
            'epochs': int(epochs),
            'early_stopping_patience': 15,
            'reduce_lr_patience': 2,
            'data_augmentation': {
                'rotation_range': 30,
                'width_shift_range': 0.3,
                'height_shift_range': 0.3,
                'horizontal_flip': True,
                'vertical_flip': True,
                'brightness_range': [0.8, 1.2],
                'zoom_range': 0.2
            }
        }

        create_training_report(history_dict, model_params)
        return {
            'history': history_dict,
            'model_params': model_params
        }
    
    def predict(self, frame):
        
        if self.model is None:
            raise ValueError("No model loaded. Please train or load a model first.")
            
        predictions = self.model.predict(frame, verbose=0)[0]
        
        result = {}
        for i, (name, confidence) in enumerate(zip(self.class_names, predictions)):
            result[name] = float(confidence) * 100 
            
        return result

    def export_model(self, format='tensorflow', type='savedmodel'):
        if self.model is None:
            raise ValueError("Model chưa được train")

        # Tạo thư mục tạm thời
        with tempfile.TemporaryDirectory() as temp_dir:
            metadata = {
                "class_names": self.class_names,
                "input_shape": [224, 224, 3],
                "preprocessing": "mobilenet_v2",
                "class_weights": self.class_weights
            }

            if format == 'tensorflow':
                metadata_path = os.path.join(temp_dir, "metadata.json")
                with open(metadata_path, "w") as f:
                    json.dump(metadata, f, indent=2)

                if type == 'keras':
                    model_path = os.path.join(temp_dir, "model.h5")
                    self.model.save(model_path, save_format='h5')
                else:
                    model_path = os.path.join(temp_dir, "saved_model")
                    tf.saved_model.save(self.model, model_path)

            elif format == 'tensorflow.js':
                try:
                    saved_model_path = os.path.join(temp_dir, "saved_model")
                    tf.saved_model.save(self.model, saved_model_path)
                    
                    output_dir = os.path.join(temp_dir, "web_model")
                    os.makedirs(output_dir, exist_ok=True)
                    
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
                        if file != "model.zip": 
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, temp_dir)
                            zipf.write(file_path, arcname)

            # Đọc file zip vào memory
            with open(zip_path, 'rb') as f:
                zip_data = f.read()

        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        temp_zip.write(zip_data)
        temp_zip.close()

        return temp_zip.name

    def export_model_to_pi(self):
        if not self.model:
            raise Exception("Model chưa được train")

        # Tạo thư mục pi_predict nếu chưa tồn tại
        folder_dir = Path(__file__).parent / "pi_predict"
        folder_dir.mkdir(exist_ok=True)

        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        tflite_model = converter.convert()

        model_path = folder_dir / "model.tflite"
        with open(model_path, 'wb') as f:
            f.write(tflite_model)

        metadata_path = folder_dir / "metadata.json"
        metadata = {
            'class_names': self.class_names,
            'input_shape': self.model.input_shape,
            'model_type': 'tensorflow-lite',
            'created_at': datetime.now().isoformat()
        }
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        predict_script_path = folder_dir / "raspberry_predict.py"
        shutil.copy('raspberry_predict.py', predict_script_path)

        return {
            'model_path': str(model_path),
            'metadata_path': str(metadata_path),
            'predict_script_path': str(predict_script_path)
        }

    def export_model_to_jetson(self):
        if not self.model:
            raise Exception("Model chưa được train")

        # Tạo thư mục jetson_predict nếu chưa tồn tại
        folder_dir = Path(__file__).parent / "jetson_predict"
        folder_dir.mkdir(exist_ok=True)

        converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
        
        # Tối ưu cho Jetson
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_ops = [
            tf.lite.OpsSet.TFLITE_BUILTINS,
            tf.lite.OpsSet.SELECT_TF_OPS
        ]
        converter.target_spec.supported_types = [tf.float16]
        
        tflite_model = converter.convert()

        model_path = folder_dir / "model.tflite"
        with open(model_path, 'wb') as f:
            f.write(tflite_model)

        metadata_path = folder_dir / "metadata.json"
        metadata = {
            'class_names': self.class_names,
            'input_shape': self.model.input_shape,
            'model_type': 'tensorflow-lite',
            'device': 'jetson',
            'optimizations': ['DEFAULT', 'FP16'],
            'created_at': datetime.now().isoformat()
        }
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        predict_script_path = folder_dir / "jetson_predict.py"
        shutil.copy('jetson_predict.py', predict_script_path)

        return {
            'model_path': str(model_path),
            'metadata_path': str(metadata_path),
            'predict_script_path': str(predict_script_path)
        }