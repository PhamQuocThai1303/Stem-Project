import React, { useState } from 'react';
import './index.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'tensorflow.js' | 'tensorflow' | 'tensorflow-lite'>('tensorflow');
  const [modelType, setModelType] = useState<'keras' | 'savedmodel'>('keras');

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/export-model?format=${selectedFormat}&type=${modelType}`);
      if (!response.ok) throw new Error('Export failed');
      
      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'model.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Export your model to use it in projects.</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="export-modal-tabs">
          <button 
            className={`tab ${selectedFormat === 'tensorflow.js' ? 'active' : ''}`}
            onClick={() => setSelectedFormat('tensorflow.js')}
          >
            Tensorflow.js <span className="info-icon">ⓘ</span>
          </button>
          <button 
            className={`tab ${selectedFormat === 'tensorflow' ? 'active' : ''}`}
            onClick={() => setSelectedFormat('tensorflow')}
          >
            Tensorflow <span className="info-icon">ⓘ</span>
          </button>
          <button 
            className={`tab ${selectedFormat === 'tensorflow-lite' ? 'active' : ''}`}
            onClick={() => setSelectedFormat('tensorflow-lite')}
          >
            Tensorflow Lite <span className="info-icon">ⓘ</span>
          </button>
        </div>

        <div className="export-modal-content">
          <div className="model-type-section">
            <h3>Model conversion type:</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="modelType"
                  checked={modelType === 'keras'}
                  onChange={() => setModelType('keras')}
                />
                Keras
              </label>
              <label>
                <input
                  type="radio"
                  name="modelType"
                  checked={modelType === 'savedmodel'}
                  onChange={() => setModelType('savedmodel')}
                />
                Savedmodel
              </label>
            </div>
          </div>

          <div className="description">
            {selectedFormat === 'tensorflow' && modelType === 'keras' && (
              <p>Converts your model to a keras .h5 model. Note the conversion happens in the cloud, but your training data is not being uploaded, only your trained model.</p>
            )}
          </div>

          <div className="code-section">
            <div className="code-tabs">
              <button className="code-tab active">Keras</button>
              <button className="code-tab">OpenCV Keras</button>
              <a href="#" className="github-link">
                Contribute on Github
              </a>
            </div>
            <div className="code-content">
              <pre>
                <code>
{`from keras.models import load_model  # TensorFlow is required for Keras to work
from PIL import Image, ImageOps  # Install pillow instead of PIL
import numpy as np

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
model = load_model("keras_Model.h5", compile=False)

# Load the labels
class_names = open("labels.txt", "r").readlines()

# Create the array of the right shape to feed into the keras model
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
`}
                </code>
              </pre>
              <button className="copy-button">Copy</button>
            </div>
          </div>

          <button className="download-button" onClick={handleDownload}>
            Download my model
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 