import React, { useState } from 'react';
import './index.css';
import { initialExport, ExportFormat } from './initialExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState(initialExport[0].format);
  const [modelType, setModelType] = useState(initialExport[0].type[0]);

  if (!isOpen) return null;

  const selectedExport = initialExport.find(exp => exp.format === selectedFormat) as ExportFormat;

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Export your model to use it in projects.</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="export-modal-tabs">
          {initialExport.map(exp => (
            <button 
              key={exp.format}
              className={`tab ${selectedFormat === exp.format ? 'active' : ''}`}
              onClick={() => {
                setSelectedFormat(exp.format);
                setModelType(exp.type[0]);
              }}
            >
              {exp.format} <span className="info-icon">ⓘ</span>
            </button>
          ))}
        </div>

        <div className="export-modal-content">
          {selectedExport.type.length > 1 && (
            <div className="model-type-section">
              <h3>Model conversion type:</h3>
              <div className="radio-group">
                {selectedExport.type.map(type => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="modelType"
                      checked={modelType === type}
                      onChange={() => setModelType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="description">
            <p>{selectedExport.description}</p>
          </div>

          {selectedExport.code && (
            <div className="code-section">
              <div className="code-content">
                <pre>
                  <code>{selectedExport.code}</code>
                </pre>
                <button 
                  className="copy-button"
                  onClick={() => navigator.clipboard.writeText(selectedExport.code)}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <button className="download-button">
            Download my model
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 