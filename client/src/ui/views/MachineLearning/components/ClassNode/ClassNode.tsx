/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useRef } from 'react';
import {
    Handle,
    Position,
  } from 'reactflow';
import './index.css';

interface ClassNodeProps {
  data: {
    id: number;
    name: string;
    onDelete?: (id: string) => void;
    images?: string[];
    onUpload?: (nodeId: string, files: FileList) => void;
    onDeleteImage?: (nodeId: string, imageIndex: number) => void;
  };
  id: string;
}

const ClassNode: React.FC<ClassNodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [className, setClassName] = useState(data.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClassName(e.target.value);
  }, []);

  const handleNameSubmit = useCallback((e:any) => {
    setIsEditing(false);
    if(e.target.value.length > 0){
      console.log(88888);
      
      data.name = e.target.value;
    }
    console.log(data);
    
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit(e);
    }
  }, [handleNameSubmit]);

  const handleDelete = useCallback(() => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  }, [data.onDelete, id]);

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
        <button className="delete-button" onClick={handleDelete}>
          🗑️
        </button>
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
          </div>
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
    </div>
  );
};

export default ClassNode;