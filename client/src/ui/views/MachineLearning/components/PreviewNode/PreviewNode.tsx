import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Handle,
    Position,
  } from 'reactflow';
import Webcam from 'react-webcam';
import ProgressBar from '../ProgressBar';
import './index.css';
import { useTranslation } from 'react-i18next';
import { BsUpload } from 'react-icons/bs';

interface PreviewNodeProps {
  data: {
    openModal: (isOpen: boolean) => void;
  };
}

const PreviewNode: React.FC<PreviewNodeProps> = ({ data }) => {
  const [isInputOn, setIsInputOn] = useState(false);
  const [inputType, setInputType] = useState<'webcam' | 'file'>('webcam');
  const webcamRef = useRef<Webcam>(null);
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {t} = useTranslation()

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop webcam
    if (webcamRef.current?.stream) {
      const track = webcamRef.current.stream.getTracks()[0];
      track.stop();
    }
  }, []);

  // WebSocket setup
  // useEffect(() => {
  //   if (isInputOn && inputType === 'webcam') {
  //     const newWs = new WebSocket('ws://localhost:3000/ws/predict');
  //     wsRef.current = newWs;

  //     newWs.onopen = () => {
  //       console.log('WebSocket connected');
  //     };

  //     newWs.onmessage = (event) => {
  //       const predictions = JSON.parse(event.data);
  //       setPredictions(predictions);
  //     };

  //     newWs.onerror = (error) => {
  //       console.error('WebSocket error:', error);
  //     };

  //     return () => {
  //       if (wsRef.current) {
  //         wsRef.current.close();
  //         wsRef.current = null;
  //       }
  //     };
  //   }
  // }, [isInputOn, inputType]);

  const captureAndPredict = useCallback(() => {
    if (isInputOn && webcamRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        wsRef.current.send(imageSrc);
      }
    }
  }, [isInputOn]);

  // Setup capture interval with lower FPS
  useEffect(() => {
    if (isInputOn && inputType === 'webcam') {
      // Increase interval to 1000ms (1 FPS) to reduce load
      intervalRef.current = setInterval(captureAndPredict, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isInputOn, inputType, captureAndPredict]);

  // Add debounce to prevent rapid WebSocket messages
  const debouncedCapture = useCallback(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setTimeout(() => {
      captureAndPredict();
    }, 500);
  }, [captureAndPredict]);

  // Update WebSocket message handler to use debounced capture
  useEffect(() => {
    if (isInputOn && inputType === 'webcam') {
      const newWs = new WebSocket('ws://localhost:3000/ws/predict');
      wsRef.current = newWs;

      newWs.onopen = () => {
        console.log('WebSocket connected');
        debouncedCapture();
      };

      newWs.onmessage = (event) => {
        const predictions = JSON.parse(event.data);
        setPredictions(predictions);
        debouncedCapture(); // Trigger next capture after receiving response
      };

      newWs.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [isInputOn, inputType, debouncedCapture]);

  // Component unmount cleanup
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const toggleInput = useCallback(() => {
    if (!isInputOn) {
      setIsInputOn(true);
    } else if (isInputOn) {
      cleanup();
      setIsInputOn(false);
      setPredictions({});
      setUploadedImage(null);
    }
  }, [isInputOn, cleanup]);

  const handleInputTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'webcam' | 'file';
    cleanup();
    setInputType(newType);
    setIsInputOn(false);
    setPredictions({});
    setUploadedImage(null);
  }, [cleanup]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setUploadedImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const predictImage = useCallback(async () => {
    if (uploadedImage) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/predict-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: uploadedImage })
        });

        if (!response.ok) {
          throw new Error('Prediction failed');
        }

        const result = await response.json();
        setPredictions(result.predictions);
      } catch (error) {
        console.error('Prediction error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [uploadedImage]);

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="preview-node">
      <Handle type="target" position={Position.Left} />
      <div className="preview-header">
        <h3>{t("Preview")}</h3>
        <button 
          className="export-button"
          onClick={() => data?.openModal(true)}
        >
          {t("Export Model")}
        </button>
      </div>
      <div className="preview-content">
        <div className="input-controls">
          <div className="input-row">
            <span>{t("Input")}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isInputOn}
                onChange={toggleInput}
              />
              <span className="slider round"></span>
            </label>
            <span className="input-status">{isInputOn ? 'ON' : 'OFF'}</span>
          </div>
          <select 
            value={inputType}
            onChange={handleInputTypeChange}
            className="input-type-select"
          >
            <option value="webcam">Webcam</option>
            <option value="file">File</option>
          </select>
        </div>

        <div className="preview-window">
          {isInputOn && inputType === 'webcam' && (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="webcam-preview"
              mirrored={true}
            />
          )}
          {isInputOn && inputType === 'file' && (
            <div className="file-upload-container">
              {uploadedImage ? (
                <>
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="uploaded-image" 
                  />
                  <div className="file-action-buttons">
                    <button 
                      onClick={triggerFileInput} 
                      className="upload-button"
                    >
                      {t("Change Image")}
                    </button>
                    <button 
                      onClick={predictImage} 
                      className="predict-button"
                      disabled={isLoading}
                    >
                      {isLoading ? t("Processing...") : t("Predict")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="file-upload-placeholder" onClick={triggerFileInput}>
                  <BsUpload size={32} />
                  <p>{t("Click to upload an image")}</p>
                  <p className="file-format-hint">{t("(JPEG, PNG, WebP)")}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        <div className="output-section">
          <h6>{t("Output")}</h6>
          <div className="predictions">
            {Object.entries(predictions).map(([className, confidence]) => (
              <ProgressBar
                key={className}
                label={className}
                percentage={confidence}
                color={'#ff8800' }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewNode;