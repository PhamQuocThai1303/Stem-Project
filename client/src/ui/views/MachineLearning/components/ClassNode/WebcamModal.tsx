import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import './index.css';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

const WebcamModal: React.FC<WebcamModalProps> = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [captureCount, setCaptureCount] = useState(0);

  // Cleanup interval when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
        setIsRecording(false);
        setCaptureCount(0);
      }
    };
  }, [recordingInterval]);

  // Stop recording when modal closes
  useEffect(() => {
    if (!isOpen && recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
      setIsRecording(false);
      setCaptureCount(0);
    }
  }, [isOpen, recordingInterval]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      setIsRecording(false);
    } else {
      // Start recording
      if (!webcamRef.current) return;
      
      setIsRecording(true);
      setCaptureCount(0);
      
      const interval = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            onCapture(imageSrc);
            setCaptureCount(prev => prev + 1);
          }
        }
      }, 300); // Capture every 300ms
      
      setRecordingInterval(interval);
    }
  }, [isRecording, recordingInterval, onCapture]);

  if (!isOpen) return null;

  return (
    <div className="webcam-modal-overlay">
      <div className="webcam-modal">
        <button className="close-button" onClick={onClose}>✕</button>
        <div className="webcam-container">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            mirrored={false}
            className="webcam"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />
          {isRecording && (
            <div className="recording-indicator">
              Recording... ({captureCount} images)
            </div>
          )}
        </div>
        <div className="webcam-controls">
          <button 
            className={isRecording ? "stop-button" : "record-button"}
            onClick={toggleRecording}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebcamModal; 