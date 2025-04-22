import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Charts from './Charts';
import './Sidebar.css';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  trainingHistory: {
    loss: number[];
    accuracy: number[];
    val_loss: number[];
    val_accuracy: number[];
    lr: number[];
    training_start_time: string;
    training_end_time: string;
    training_time_minutes: number;
    batch_size: number;
    num_classes: number;
    learning_rate: number;
    training_samples: number;
    validation_samples: number;
    epochs: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, trainingHistory }) => {
  const {t} = useTranslation()
  if (!isOpen) return null;
// console.log(trainingHistory);

  // Format dates for display
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Format minutes to minutes and seconds
  const formatTrainingTime = (minutes: number) => {
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  return (
    <div className="training-sidebar">
      <div className="sidebar-header">
        <h2>{t("Result statistics")}</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <div className="sidebar-content">
        <p className="sidebar-description">
          {t("Below are some charts that can help you understand how your model is performing.")}
          <br /><br />
        </p>

        {/* Training Time Information */}
        <div className="training-time-section">
          <h3>{t("Training Time Information")}</h3>
          <div className="training-time-grid">
            <div className="time-info">
              <label>{t("Start Time")}:</label>
              <span>{trainingHistory.training_start_time ? formatDateTime(trainingHistory.training_start_time) : '-'}</span>
            </div>
            <div className="time-info">
              <label>{t("End Time")}:</label>
              <span>{trainingHistory.training_end_time ? formatDateTime(trainingHistory.training_end_time) : '-'}</span>
            </div>
            <div className="time-info">
              <label>{t("Total Training Time")}:</label>
              <span>{trainingHistory.training_time_minutes ? formatTrainingTime(trainingHistory.training_time_minutes) : '-'}</span>
            </div>
          </div>
        </div>

        {/* Training Parameters */}
        <div className="training-params-section">
          <h3>{t("Training Parameters")}</h3>
          <table className="params-table">
            <tbody>
              <tr>
                <td>{t("Batch Size")}</td>
                <td>{trainingHistory.batch_size || '-'}</td>
                <td>{t("Number of Classes")}</td>
                <td>{trainingHistory.num_classes || '-'}</td>
              </tr>
              <tr>
                <td>{t("Learning Rate")}</td>
                <td>{trainingHistory.learning_rate || '-'}</td>
                <td>{t("Epochs")}</td>
                <td>{trainingHistory.epochs || '-'}</td>
              </tr>
              <tr>
                <td>{t("Training Samples")}</td>
                <td>{trainingHistory.training_samples?.toLocaleString() || '-'}</td>
                <td>{t("Validation Samples")}</td>
                <td>{trainingHistory.validation_samples?.toLocaleString() || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* <div className="metrics-section">
          <h3>Độ chính xác theo lớp</h3>
          <table className="accuracy-table">
            <thead>
              <tr>
                <th>LỚP</th>
                <th>ĐỘ CHÍNH XÁC</th>
                <th>SỐ MẪU</th>
              </tr>
            </thead>
            <tbody>
              {trainingHistory.accuracyPerClass.map((item, index) => (
                <tr key={index}>
                  <td>{item.class}</td>
                  <td>{item.accuracy.toFixed(2)}</td>
                  <td>{item.samples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}

        <Charts 
          data={{
            loss: trainingHistory.loss,
            accuracy: trainingHistory.accuracy,
            val_loss: trainingHistory.val_loss,
            val_accuracy: trainingHistory.val_accuracy,
            lr: trainingHistory.lr
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;