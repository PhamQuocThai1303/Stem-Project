import tensorflow as tf
import numpy as np
import cv2
import json
import os
from PIL import Image

def preprocess_image(image_path, target_size=(224, 224)):
    """Tiền xử lý ảnh từ đường dẫn file"""
    # Đọc ảnh
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Không thể đọc ảnh từ đường dẫn: {image_path}")
    
    # Chuyển đổi từ BGR sang RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Resize ảnh
    image = cv2.resize(image, target_size)
    
    # Chuẩn hóa giá trị pixel
    image = image.astype('float32') / 255.0
    
    return image

def load_model_and_metadata(model_path, metadata_path):
    """Load model và metadata từ file"""
    # Kiểm tra file tồn tại
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Không tìm thấy file model: {model_path}")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Không tìm thấy file metadata: {metadata_path}")
    
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Load metadata
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    return model, metadata

def predict_image(model, metadata, image_path):
    """Dự đoán class cho một ảnh"""
    # Tiền xử lý ảnh
    processed_image = preprocess_image(image_path)
    
    # Thêm batch dimension
    processed_image = np.expand_dims(processed_image, axis=0)
    
    # Dự đoán
    predictions = model.predict(processed_image)
    
    # Lấy tên các class từ metadata
    class_names = metadata['class_names']
    
    # Tạo kết quả dự đoán
    results = []
    for class_name, confidence in zip(class_names, predictions[0]):
        results.append({
            'class': class_name,
            'confidence': float(confidence * 100)  # Chuyển đổi sang phần trăm
        })
    
    # Sắp xếp kết quả theo confidence giảm dần
    results.sort(key=lambda x: x['confidence'], reverse=True)
    
    return results

def main():
    # Đường dẫn đến model và metadata
    model_path = 'best_model.h5'
    metadata_path = 'metadata.json'
    
    try:
        # Load model và metadata
        model, metadata = load_model_and_metadata(model_path, metadata_path)
        print("Đã load model và metadata thành công!")
        
        # Nhập đường dẫn ảnh từ người dùng
        image_path = input("Nhập đường dẫn đến ảnh cần dự đoán: ")
        
        # Thực hiện dự đoán
        results = predict_image(model, metadata, image_path)
        
        # In kết quả
        print("\nKết quả dự đoán:")
        print("-" * 40)
        for result in results:
            print(f"Class: {result['class']}")
            print(f"Confidence: {result['confidence']:.2f}%")
            print("-" * 40)
            
    except Exception as e:
        print(f"Có lỗi xảy ra: {str(e)}")

if __name__ == "__main__":
    main() 