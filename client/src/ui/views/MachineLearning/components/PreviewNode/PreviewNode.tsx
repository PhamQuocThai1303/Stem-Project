import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Handle,
    Position,
  } from 'reactflow';
import Webcam from 'react-webcam';
import ProgressBar from '../ProgressBar';
import './index.css';

interface PreviewNodeProps {
  data: {
    classNodes: Array<{ id: string; data: { id: number, name: string } }>;
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

  //     newWs.onmessage = (event) => {
  //       const predictions = JSON.parse(event.data);
  //       setPredictions(predictions);
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

  // Setup capture interval
  useEffect(() => {
    if (isInputOn && inputType === 'webcam') {
      intervalRef.current = setInterval(captureAndPredict, 100);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isInputOn, inputType, captureAndPredict]);

  // Component unmount cleanup
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const toggleInput = useCallback(() => {
    if (!isInputOn && inputType === 'webcam') {
      setIsInputOn(true);
    } else if (isInputOn) {
      cleanup();
      setIsInputOn(false);
    }
  }, [isInputOn, inputType, cleanup]);

  const handleInputTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'webcam' | 'file';
    cleanup();
    setInputType(newType);
    setIsInputOn(false);
  }, [cleanup]);

  return (
    <div className="preview-node">
      <Handle type="target" position={Position.Left} />
      <div className="preview-header">
        <h3>Preview</h3>
        <button 
          className="export-button"
          onClick={() => data?.openModal(true)}
        >
          Export Model
        </button>
      </div>
      <div className="preview-content">
        <div className="input-controls">
          <div className="input-row">
            <span>Input</span>
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
        </div>

        <div className="output-section">
          <h4>Output</h4>
          {/* <div className="predictions">
            {data.classNodes.map((node) => (
              <ProgressBar
                key={node.id}
                className={`Class ${node.data.id}`}
                percentage={predictions[node.data.id] || 0}
                color={node.data.id === 1 ? '#ff8800' : '#ff4477'}
              />
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PreviewNode;