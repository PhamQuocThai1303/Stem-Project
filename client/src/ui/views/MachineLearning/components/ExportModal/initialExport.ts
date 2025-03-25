export interface ExportFormat {
    format: string;
    type: string[];
    modelName: string;
    description: string;
    code: string;
}

export const initialExport: ExportFormat[] = [
    {
        format: 'tensorflow.js',
        type: ['download'],
        modelName: 'model.json',
        description: 'Export your model to TensorFlow.js format. This will create a model.json file and a weights.bin file that you can use in your web applications.',
        code: `import * as tf from '@tensorflow/tfjs';

// Load the model
const model = await tf.loadLayersModel('model.json');

// Make predictions
const prediction = model.predict(tf.tensor2d([[...your input data...]]));`
    },
    {
        format: 'tensorflow',
        type: ['keras', 'savedmodel'],
        modelName: 'model.h5',
        description: 'Export your model to TensorFlow format. You can choose between Keras (.h5) or SavedModel format.',
        code: `import tensorflow as tf
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
    main() `
    },
    {
        format: 'tensorflow-lite',
        type: ['download'],
        modelName: 'model.tflite',
        description: 'Export your model to TensorFlow Lite format for mobile and edge devices.',
        code: `import tensorflow as tf

# Load the TFLite model
interpreter = tf.lite.Interpreter(model_path='model.tflite')
interpreter.allocate_tensors()

# Get input and output tensors
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Prepare input data
input_data = np.array([[...your input data...]])

# Set input tensor
interpreter.set_tensor(input_details[0]['index'], input_data)

# Run inference
interpreter.invoke()

# Get output tensor
predictions = interpreter.get_tensor(output_details[0]['index'])`
    }
]
