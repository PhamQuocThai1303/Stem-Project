// Code mẫu cho TensorFlow
export const tensorflowImageCode = `import tensorflow as tf
import numpy as np
import cv2
import json
import os
from PIL import Image

def preprocess_image(image_path, target_size=(224, 224)):
    """Tiền xử lý ảnh từ đường dẫn file"""
    
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Không thể đọc ảnh từ đường dẫn: {image_path}")
    
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    image = cv2.resize(image, target_size)
    
    image = image.astype('float32') / 255.0
    
    return image

def load_model_and_metadata(model_path, metadata_path):
    """Load model và metadata từ file"""
    
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
    
    processed_image = preprocess_image(image_path)
    
    processed_image = np.expand_dims(processed_image, axis=0)
    
    predictions = model.predict(processed_image)
    
    class_names = metadata['class_names']
    
    results = []
    for class_name, confidence in zip(class_names, predictions[0]):
        results.append({
            'class': class_name,
            'confidence': float(confidence * 100)
        })
    
    return results

def main():
    model_path = 'model.h5'
    metadata_path = 'metadata.json'
    
    try:
        model, metadata = load_model_and_metadata(model_path, metadata_path)
        print("Đã load model và metadata thành công!")
        
        image_path = input("Nhập đường dẫn đến ảnh cần dự đoán: ")
        
        results = predict_image(model, metadata, image_path)
        
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

export const tensorflowRealtimeCode = `import numpy as np
import cv2
import json
import os
from PIL import Image
import tensorflow as tf
import time

def preprocess_image(image, target_size=(224, 224)):
    """Tiền xử lý ảnh từ frame camera"""
    
    # Chuyển đổi từ BGR sang RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Resize ảnh
    image = cv2.resize(image, target_size)
    
    # Chuẩn hóa giá trị pixel
    image = image.astype('float32') / 255.0
    
    return image

def load_model_and_metadata():
    """Load model và metadata"""
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'model.h5')
    metadata_path = os.path.join(current_dir, 'metadata.json')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Không tìm thấy file model tại: {model_path}")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Không tìm thấy file metadata tại: {metadata_path}")
    
    # Load model
    model = tf.keras.models.load_model(model_path)
    
    # Load metadata
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    return model, metadata

def predict_frame(model, metadata, frame):
    """Dự đoán class cho một frame từ camera"""
    
    processed_image = preprocess_image(frame)
    processed_image = np.expand_dims(processed_image, axis=0)
    
    predictions = model.predict(processed_image, verbose=0)
    
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
        print("Đang load model và metadata...")
        model, metadata = load_model_and_metadata()
        print("Đã load model và metadata thành công!")
        print(f"Các class có thể dự đoán: {', '.join(metadata['class_names'])}")
        
        # Khởi tạo camera
        cap = cv2.VideoCapture(0) 
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("\nĐang chạy dự đoán realtime...")
        print("Nhấn 'q' để thoát")
        
        last_prediction_time = 0
        prediction_interval = 0.1  # Thời gian giữa các lần dự đoán (giây)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Không thể đọc frame từ camera")
                break
            
            current_time = time.time()
            
            if current_time - last_prediction_time >= prediction_interval:
                results = predict_frame(model, metadata, frame)
                last_prediction_time = current_time
            
            frame = draw_predictions(frame, results)
            
            cv2.imshow('Prediction', frame)
            
            # Thoát nếu nhấn 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
    except Exception as e:
        print(f"Có lỗi xảy ra: {str(e)}")
    finally:
        # Giải phóng tài nguyên
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()`; 