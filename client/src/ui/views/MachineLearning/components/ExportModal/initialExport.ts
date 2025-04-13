import { tensorflowImageCode, tensorflowRealtimeCode } from './source_code/tensorflow';
import { tensorflowLiteCode } from './source_code/tensorflow_lite';
import { tensorflowLiteRealtimeCode } from './source_code/tensorflow_lite_realtime';

export interface ExportFormat {
    format: string;
    type: string[];
    modelName: string;
    description: string;
    code_rt?: string;
    code_image?: string;
}

export const initialExport: ExportFormat[] = [
    {
        format: 'tensorflow',
        type: ['keras', 'savedmodel'],
        modelName: 'model.h5',
        description: 'Export your model to TensorFlow format. You can choose between Keras (.h5) or SavedModel format.',
        code_rt: tensorflowRealtimeCode,
        code_image: tensorflowImageCode
    },
    {
        format: 'tensorflow-lite',
        type: ['download'],
        modelName: 'model.tflite',
        description: 'Export your model to TensorFlow Lite format for mobile and edge devices.',
        code_rt: tensorflowLiteRealtimeCode,
        code_image: tensorflowLiteCode
    },
    {
        format: "Raspberry Pi",
        type: ["download"],
        description: "Export your model for Raspberry Pi deployment. This will download a zip file containing model.h5, metadata.json, and raspberry_predict.py for real-time prediction.",
        modelName: "raspberry_pi_files.zip",
        code_rt: `# Extract the zip file on your Raspberry Pi
# Install required packages
pip install opencv-python tensorflow pillow numpy

# Run the prediction script
python raspberry_predict.py`
    }
]
