import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Handle,
    Position,
  } from 'reactflow';
import Webcam from 'react-webcam';
import ProgressBar from '../ProgressBar';
import './index.css';
import ExportModal from '../ExportModal/ExportModal';
import { log } from 'console';

interface PreviewNodeProps {
  data: {
    classNodes: Array<{ id: string; data: { id: number, name: string } }>;
  };
}

const PreviewNode: React.FC<PreviewNodeProps> = ({ data }) => {
  const [isInputOn, setIsInputOn] = useState(false);
  const [inputType, setInputType] = useState<'webcam' | 'file'>('webcam');
  const webcamRef = useRef<Webcam>(null);
  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  // console.log(data);
  
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  useEffect(() => {
    if (isInputOn && inputType === 'webcam') {
      const newWs = new WebSocket('ws://localhost:3000/ws/predict');
      setWs(newWs);
  
      return () => {
        newWs.close();
      };
    }
  }, [isInputOn, inputType]);

  const captureAndPredict = useCallback(() => {
    if (isInputOn && webcamRef.current && ws?.readyState === WebSocket.OPEN) {
      const imageSrc = webcamRef.current.getScreenshot();
      ws.send(imageSrc);
    }
  }, [isInputOn, ws]);

  // Thêm WebSocket message handler
useEffect(() => {
  if (ws) {
    ws.onmessage = (event) => {
      const predictions = JSON.parse(event.data);
      setPredictions(predictions);
    };
  }
}, [ws]);

// Capture và gửi ảnh mỗi 100ms
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isInputOn && inputType === 'webcam') {
    interval = setInterval(captureAndPredict, 100);
  }
  return () => {
    if (interval) clearInterval(interval);
  };
}, [isInputOn, inputType, captureAndPredict]);

  const toggleInput = useCallback(() => {
    if (!isInputOn && inputType === 'webcam') {
      // Webcam sẽ tự động bật khi component được render
      setIsInputOn(true);
    } else if (isInputOn && inputType === 'webcam') {
      // Tắt webcam
      if (webcamRef.current?.stream) {
        const track = webcamRef.current.stream.getTracks()[0];
        track.stop();
      }
      setIsInputOn(false);
    }
  }, [isInputOn, inputType]);

  const handleInputTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'webcam' | 'file';
    setInputType(newType);
    if (isInputOn && webcamRef.current?.stream) {
      const track = webcamRef.current.stream.getTracks()[0];
      track.stop();
      setIsInputOn(false);
    }
  }, [isInputOn]);

  // Giả lập dữ liệu predictions cho demo
  React.useEffect(() => {
    if (isInputOn) {
      setPredictions({
        '1': 96,
        '2': 4,
      });
    } else {
      setPredictions({});
    }
  }, [isInputOn]);

  const handleExportModel = useCallback(async () => {
    try {
      window.location.href = 'http://localhost:3000/api/export-model';
    } catch (error) {
      console.error('Export error:', error);
    }
  }, []);

  return (
    <div className="preview-node">
      <Handle type="target" position={Position.Left} />
      <div className="preview-header">
        <h3>Preview</h3>
        <button 
          className="export-button"
          onClick={() =>{
            // handleExportModel();
            setIsExportModalOpen(true)
          } }
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
          <div className="predictions">
            {data.classNodes.map((node) => (
              <ProgressBar
                key={node.id}
                className={`Class ${node.data.id}`}
                percentage={predictions[node.data.id] || 0}
                color={node.data.id === 1 ? '#ff8800' : '#ff4477'}
              />
            ))}
          </div>
        </div>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default PreviewNode;