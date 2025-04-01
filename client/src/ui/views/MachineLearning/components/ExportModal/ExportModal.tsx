import React, { useState } from 'react';
import './index.css';
import { initialExport, ExportFormat } from './initialExport';
import { FaRaspberryPi } from 'react-icons/fa';
import { toast } from "react-toastify";
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState(initialExport[0].format);
  const [modelType, setModelType] = useState(initialExport[0].type[0]);

  if (!isOpen) return null;

  const selectedExport = initialExport.find(exp => exp.format === selectedFormat) as ExportFormat;

  const handleExportModel = async (modelType: string, selectedFormat: string) => {
    try {
      if (selectedFormat === "Raspberry Pi") {
        const response = await fetch('http://localhost:3000/api/export-to-pi', {
          method: 'POST',
        });
        if (!response.ok) {
          toast.error("Export model cho Raspberry Pi thất bại");
          throw new Error('Export failed');
        }
        toast.success("Export model cho Raspberry Pi thành công");
        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'raspberry_pi_files.zip';
        // document.body.appendChild(a);
        // a.click();
        // window.URL.revokeObjectURL(url);
        // document.body.removeChild(a);
      } else {
        const response = await fetch(`http://localhost:3000/api/export-model?format=${selectedFormat}&type=${modelType}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Export failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
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
          {initialExport.map(exp => (
            <button 
              key={exp.format}
              className={`tab ${selectedFormat === exp.format ? 'active' : ''}`}
              onClick={() => {
                setSelectedFormat(exp.format);
                setModelType(exp.type[0]);
              }}
            >
              {exp.format === "Raspberry Pi" ? (
                <>
                  <FaRaspberryPi /> Raspberry Pi
                </>
              ) : (
                <>
                  {exp.format} <span className="info-icon">ⓘ</span>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="export-modal-content">
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
              <button 
                className="download-button" 
                onClick={() => handleExportModel(modelType, selectedFormat)}
              >
                {selectedFormat === "Raspberry Pi" ? "Import to Pi" : "Download my model"}
              </button>
            </div>
          </div>

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
                  onClick={() => navigator.clipboard.writeText(selectedExport.code || '')}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 