/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Handle,
    Position,
  } from 'reactflow';
import WebcamModal from './WebcamModal';
import './index.css';

interface ClassNodeProps {
  data: {
    id: number;
    name: string;
    onDelete?: (id: string) => void;
    images?: string[];
    onUpload?: (nodeId: string, files: FileList) => void;
    onDeleteImage?: (nodeId: string, imageIndex: number) => void;
    onChangeName?: (nodeId: string, newName: string) => void;
    onRemoveAllSamples?: (nodeId: string) => void;
    onDownloadSamples?: (nodeId: string) => void;
  };
  id: string;
}

const ClassNode: React.FC<ClassNodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [className, setClassName] = useState(data.name);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClassName(e.target.value);
  }, []);

  const handleNameSubmit = useCallback((e:any) => {
    setIsEditing(false);
    if(e.target.value.length > 0 && data.onChangeName){
      data.onChangeName(id, e.target.value);
    }
  }, [data.onChangeName, id]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit(e);
    }
  }, [handleNameSubmit]);

  const handleDelete = useCallback(() => {
    if (data.onDelete) {
      data.onDelete(id);
    }
    setIsMenuOpen(false);
  }, [data.onDelete, id]);

  const handleRemoveAllSamples = useCallback(() => {
    if (data.onRemoveAllSamples) {
      data.onRemoveAllSamples(id);
    }
    setIsMenuOpen(false);
  }, [data.onRemoveAllSamples, id]);

  const handleDownloadSamples = useCallback(() => {
    if (data.onDownloadSamples) {
      data.onDownloadSamples(id);
    }
    setIsMenuOpen(false);
  }, [data.onDownloadSamples, id]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && data.onUpload) {
      data.onUpload(id, e.target.files);
    }
  }, [data.onUpload, id]);

  const handleDeleteImage = useCallback((imageIndex: number) => {
    if (data.onDeleteImage) {
      data.onDeleteImage(id, imageIndex);
    }
  }, [data.onDeleteImage, id]);

  const handleWebcamClick = useCallback(() => {
    setIsWebcamOpen(true);
  }, []);

  const handleWebcamClose = useCallback(() => {
    setIsWebcamOpen(false);
  }, []);

  const handleWebcamCapture = useCallback((imageSrc: string) => {
    if (data.onUpload) {
      // Convert base64 to File object
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
          // Create a DataTransfer object to create a valid FileList
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          data.onUpload(id, dataTransfer.files);
        });
    }
  }, [data.onUpload, id]);

  return (
    <div className="class-node">
      <Handle type="source" position={Position.Right} />
      <div className="class-header">
        {isEditing ? (
          <input
            type="text"
            value={className}
            onChange={handleNameChange}
            onBlur={handleNameSubmit}
            onKeyPress={handleKeyPress}
            autoFocus
            className="class-name-input"
          />
        ) : (
          <h3>{className}</h3>
        )}
        <button className="edit-button" onClick={handleEditClick}>
          ✏️
        </button>
        <div className="menu-container" ref={menuRef}>
          <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ⋮
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              <button onClick={handleDelete} className="menu-item">
                Delete Class
              </button>
              <button onClick={handleRemoveAllSamples} className="menu-item">
                Remove All Samples
              </button>
              <button onClick={handleDownloadSamples} className="menu-item">
                Download Samples
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="class-content">
        {data.images && data.images.length > 0 && (
          <p>{data.images.length} Image Samples</p>
        )}
        <div className="samples-container">
          <div className="button-group">
            <button className="sample-button" onClick={handleUploadClick}>
              <span className="upload-icon">⬆️</span>
              <span>Upload</span>
            </button>
            <button className="webcam-button" onClick={handleWebcamClick}>
              <span className="webcam-icon">📷</span>
              <span>Webcam</span>
            </button>
          </div>
          {data.images && data.images.length > 0 && (
            <div className="image-grid">
              {data.images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image} alt={`Sample ${index + 1}`} />
                  <button 
                    className="delete-image-button"
                    onClick={() => handleDeleteImage(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={handleWebcamClose}
        onCapture={handleWebcamCapture}
      />
    </div>
  );
};

export default ClassNode;