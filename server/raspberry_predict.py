import numpy as np
import cv2
import json
import os
from PIL import Image
import tflite_runtime.interpreter as tflite
import time
from picamera2 import Picamera2

def preprocess_image(image, target_size=(224, 224)):
    
    # Chuyển đổi từ BGR sang RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Resize ảnh
    image = cv2.resize(image, target_size)
    
    # Chuẩn hóa giá trị pixel và chuyển sang float32
    image = (image.astype('float32') - 127.5) / 127.5
    
    return image

def load_model_and_metadata():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'model.tflite')
        metadata_path = os.path.join(current_dir, 'metadata.json')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Không tìm thấy file model tại: {model_path}")
        if not os.path.exists(metadata_path):
            raise FileNotFoundError(f"Không tìm thấy file metadata tại: {metadata_path}")
        
        # Load model
        interpreter = tflite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print("Input details:", input_details)
        print("Output details:", output_details)
        
        # Load metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            
        print("Metadata:", metadata)
        
        return interpreter, input_details, output_details, metadata
        
    except Exception as e:
        print(f"Lỗi khi load model và metadata: {str(e)}")
        raise

def predict_frame(interpreter, input_details, output_details, metadata, frame):
    try:
        processed_image = preprocess_image(frame)
        
        # Reshape để phù hợp với input shape của model
        input_shape = input_details[0]['shape']
        processed_image = np.expand_dims(processed_image, axis=0)
        processed_image = processed_image.astype(input_details[0]['dtype'])
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], processed_image)
        
        # Run inference
        interpreter.invoke()
        
        # Get output tensor
        predictions = interpreter.get_tensor(output_details[0]['index'])
        
        class_names = metadata['class_names']
        
        results = []
        for class_name, confidence in zip(class_names, predictions[0]):
            results.append({
                'class': class_name,
                'confidence': float(confidence * 100)
            })
        
        return results
        
    except Exception as e:
        print(f"Lỗi khi dự đoán: {str(e)}")
        return []

def draw_predictions(frame, results):
    try:
        height, width = frame.shape[:2]
        cv2.rectangle(frame, (10, 10), (width-10, height-10), (0, 255, 0), 2)
        
        # Vẽ kết quả dự đoán
        y_offset = 40
        for result in results:
            text = f"{result['class']}: {result['confidence']:.1f}%"
            (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(frame, (10, y_offset-text_height-5), (10+text_width+10, y_offset+5), (0, 0, 0), -1)
            cv2.putText(frame, text, (15, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            y_offset += 30
        
        return frame
        
    except Exception as e:
        print(f"Lỗi khi vẽ kết quả: {str(e)}")
        return frame

def main():
    picam2 = None  
    try:
        print("Đang load model và metadata...")
        interpreter, input_details, output_details, metadata = load_model_and_metadata()
        print("Đã load model và metadata thành công!")
        print(f"Các class có thể dự đoán: {', '.join(metadata['class_names'])}")
        
        # Khởi tạo camera
        picam2 = Picamera2()
        preview_config = picam2.create_preview_configuration(main={"size": (640, 480)})
        picam2.configure(preview_config)
        picam2.start()
        
        print("\nĐang chạy dự đoán realtime...")
        print("Nhấn 'q' để thoát")
        
        last_prediction_time = 0
        prediction_interval = 0.1  # Thời gian giữa các lần dự đoán (giây)
        results = [] 
        
        while True:
            frame = picam2.capture_array()
            frame = cv2.rotate(frame, cv2.ROTATE_180)  # Xoay frame 180 độ
            
            current_time = time.time()
            
            # Dự đoán mỗi prediction_interval giây
            if current_time - last_prediction_time >= prediction_interval:
                results = predict_frame(interpreter, input_details, output_details, metadata, frame)
                last_prediction_time = current_time
            
            frame = draw_predictions(frame, results)
            
            cv2.imshow('Raspberry Pi Prediction', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
    except Exception as e:
        print(f"Có lỗi xảy ra: {str(e)}")
    finally:
        # Giải phóng tài nguyên
        if picam2 is not None:
            picam2.stop()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main() 