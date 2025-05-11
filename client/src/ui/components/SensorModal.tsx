import React from 'react';
import './SensorModal.css';

interface SensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorValues: {
    temperature?: number;
    humidity?: number;
    distance?: number;
    [key: string]: number | undefined;
  };
  isConnected: boolean;
}

const SensorModal: React.FC<SensorModalProps> = ({ isOpen, onClose, sensorValues, isConnected }) => {
  if (!isOpen) return null;

  return (
    <div className="sensor-modal-overlay" onClick={() => onClose()}>
      <div className="sensor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sensor-modal-header">
          <h3>Giá trị cảm biến</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="sensor-modal-content">
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Đã kết nối' : 'Mất kết nối'}</span>
          </div>
          
          <div className="sensor-values">
            {sensorValues.temperature !== undefined && (
              <div className="sensor-value">
                <span className="sensor-label">Nhiệt độ:</span>
                <span className="sensor-reading">{sensorValues.temperature} °C</span>
              </div>
            )}
            
            {sensorValues.humidity !== undefined && (
              <div className="sensor-value">
                <span className="sensor-label">Độ ẩm:</span>
                <span className="sensor-reading">{sensorValues.humidity} %</span>
              </div>
            )}
            
            {sensorValues.distance !== undefined && (
              <div className="sensor-value">
                <span className="sensor-label">Khoảng cách:</span>
                <span className="sensor-reading">{sensorValues.distance} cm</span>
              </div>
            )}

            {Object.entries(sensorValues)
              .filter(([key]) => !['temperature', 'humidity', 'distance'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="sensor-value">
                  <span className="sensor-label">{key}:</span>
                  <span className="sensor-reading">{value}</span>
                </div>
              ))}
              
            {Object.keys(sensorValues).length === 0 && (
              <div className="no-data">Không có dữ liệu cảm biến</div>
            )}
          </div>
        </div>
        <div className="sensor-modal-footer">
          <button className="close-modal-button" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default SensorModal; 