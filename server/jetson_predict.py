import numpy as np
import tensorflow as tf
import cv2
import json
import os
import time
from pathlib import Path

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

def draw_predictions(frame, results):
    """Vẽ kết quả dự đoán lên frame"""
    
    height, width = frame.shape[:2]
    cv2.rectangle(frame, (10, 10), (width-10, height-10), (0, 255, 0), 2)
    
    y_offset = 40
    for result in results:
        text = f"{result['class']}: {result['confidence']:.1f}%"
        # Vẽ background cho text
        (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
        cv2.rectangle(frame, (10, y_offset-text_height-5), (10+text_width+10, y_offset+5), (0, 0, 0), -1)
        # Vẽ text
        cv2.putText(frame, text, (15, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        y_offset += 30
    
    return frame

def main():
    try:
        # Lấy đường dẫn thư mục hiện tại
        current_dir = Path(__file__).parent
        model_path = current_dir / "model.tflite"
        metadata_path = current_dir / "metadata.json"
        
        print("Đang load model và metadata...")
        interpreter = load_tflite_model(str(model_path))
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            
        print("Đã load model và metadata thành công!")
        print(f"Các class có thể dự đoán: {', '.join(metadata['class_names'])}")
        
        # Khởi tạo camera
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        if not cap.isOpened():
            raise Exception("Không thể mở camera")
            
        print("Đã khởi tạo camera thành công! Nhấn 'q' để thoát.")
        
        # Biến để tính FPS
        frame_count = 0
        start_time = time.time()
        fps = 0
        
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
            
            # Vẽ kết quả lên frame
            frame = draw_predictions(frame, results)
            
            # Tính và hiển thị FPS
            frame_count += 1
            if frame_count >= 30:  # Cập nhật FPS mỗi 30 frame
                end_time = time.time()
                fps = frame_count / (end_time - start_time)
                frame_count = 0
                start_time = time.time()
            
            # Hiển thị FPS
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, frame.shape[0] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Hiển thị frame
            cv2.imshow('Jetson Real-time Prediction', frame)
            
            # Thoát nếu nhấn 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        # Giải phóng tài nguyên
        cap.release()
        cv2.destroyAllWindows()
            
    except Exception as e:
        print(f"Có lỗi xảy ra: {str(e)}")

if __name__ == "__main__":
    main() 