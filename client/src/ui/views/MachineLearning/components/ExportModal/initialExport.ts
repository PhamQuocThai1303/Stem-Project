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
        code: `from tensorflow.keras.models import load_model
import numpy as np

# Load the model
model = load_model('model.h5')

# Prepare your input data
input_data = np.array([[...your input data...]])

# Make predictions
predictions = model.predict(input_data)`
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
