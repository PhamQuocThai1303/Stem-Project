import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Charts from './Charts';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  trainingHistory: {
    // accuracyPerClass: Array<{
    //   class: string;
    //   accuracy: number;
    //   samples: number;
    // }>;
    // confusionMatrix: number[][];
    loss: number[];
    accuracy: number[];
    val_loss: number[];
    val_accuracy: number[];
    lr: number[];
  };
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, trainingHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="training-sidebar">
      <div className="sidebar-header">
        <h2>Under the hood</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <div className="sidebar-content">
        <p className="sidebar-description">
          Dưới đây là một số biểu đồ có thể giúp bạn hiểu mô hình của bạn đang hoạt động như thế nào.
          <br /><br />
        </p>

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