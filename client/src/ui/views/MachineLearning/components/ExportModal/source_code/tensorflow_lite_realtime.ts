// Code mẫu cho TensorFlow Lite Realtime
export const tensorflowLiteRealtimeCode = `import numpy as np
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

def preprocess_frame(frame, target_size=(224, 224)):
    """Tiền xử lý frame từ camera"""
    
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = cv2.resize(frame, target_size)
    frame = frame.astype('float32') / 255.0
    frame = np.expand_dims(frame, axis=0)
    
    return frame

def predict_frame(interpreter, frame, metadata_path):
    """Dự đoán class cho một frame sử dụng TFLite model"""
    
    # Get input và output tensors
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], frame)
    
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
        
        # Khởi tạo camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise Exception("Không thể mở camera")
        
        print("Đã khởi tạo camera thành công! Nhấn 'q' để thoát.")
        
        while True:
            # Đọc frame từ camera
            ret, frame = cap.read()
            if not ret:
                print("Không thể đọc frame từ camera")
                break
            
            # Tiền xử lý frame
            processed_frame = preprocess_frame(frame)
            
            # Dự đoán
            results = predict_frame(interpreter, processed_frame, metadata_path)
            
            # Hiển thị kết quả lên frame
            for i, result in enumerate(results):
                text = f"{result['class']}: {result['confidence']:.2f}%"
                cv2.putText(frame, text, (10, 30 + i * 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            
            # Hiển thị frame
            cv2.imshow('Real-time Prediction', frame)
            
            # Thoát nếu nhấn 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Giải phóng tài nguyên
        cap.release()
        cv2.destroyAllWindows()
            
    except Exception as e:
        print(f"Có lỗi xảy ra: {str(e)}")

if __name__ == "__main__":
    main()`; 