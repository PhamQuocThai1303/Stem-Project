// Code mẫu cho TensorFlow Lite
export const tensorflowLiteCode = `import numpy as np
import tensorflow as tf
import cv2
import json
import os

def load_tflite_model(model_path):
    """Load TFLite model từ file"""
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Không tìm thấy file model: {model_path}")
    
    # Load TFLite model và allocate tensors
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    
    return interpreter

def preprocess_image(image_path, target_size=(224, 224)):
    """Tiền xử lý ảnh từ đường dẫn file"""
    
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Không thể đọc ảnh từ đường dẫn: {image_path}")
    
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, target_size)
    image = image.astype('float32') / 255.0
    image = np.expand_dims(image, axis=0)
    
    return image

def predict_image(interpreter, image, metadata_path):
    """Dự đoán class cho một ảnh sử dụng TFLite model"""
    
    # Get input và output tensors
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], image)
    
    # Run inference
    interpreter.invoke()
    
    # Get output tensor
    predictions = interpreter.get_tensor(output_details[0]['index'])
    
    # Load metadata để lấy tên các class
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    class_names = metadata['class_names']
    
    results = []
    for class_name, confidence in zip(class_names, predictions[0]):
        results.append({
            'class': class_name,
            'confidence': float(confidence * 100)
        })
    
    return results

def main():
    model_path = 'model.tflite'
    metadata_path = 'metadata.json'
    
    try:
        # Load model
        interpreter = load_tflite_model(model_path)
        print("Đã load TFLite model thành công!")
        
        # Nhập đường dẫn ảnh
        image_path = input("Nhập đường dẫn đến ảnh cần dự đoán: ")
        
        # Tiền xử lý ảnh
        processed_image = preprocess_image(image_path)
        
        # Dự đoán
        results = predict_image(interpreter, processed_image, metadata_path)
        
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
    main()`; 