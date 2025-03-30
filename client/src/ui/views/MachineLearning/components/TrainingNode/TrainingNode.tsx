/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import { BsBarChartLine } from 'react-icons/bs';
import './TrainingNode.css';

interface TrainingNodeProps {
  data: {
    classNodes: Array<{
      id: string;
      data: {
        id: number;
        name: string;
        images: string[];
      };
    }>;
    openSideBar: (isOpen: boolean) => void;
    setTrainingHistory: (trainingHistory: any) => void;
  };
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
//   trainingHistory: {
//     accuracyPerClass: Array<{
//       class: string;
//       accuracy: number;
//       samples: number;
//     }>;
//     confusionMatrix: number[][];
//     accuracyPerEpoch: {
//       acc: number[];
//       testAcc: number[];
//     };
//     lossPerEpoch: {
//       loss: number[];
//       testLoss: number[];
//     };
//   };
// }

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="tooltip-content">
          {content}
        </div>
      )}
    </div>
  );
};

const HELP_TEXTS = {
  epochs: `Một epoch nghĩa là mỗi mẫu trong tập dữ liệu huấn luyện đã được đưa qua mô hình ít nhất một lần. 
  
Ví dụ, nếu bạn đặt epochs là 50, điều này có nghĩa là mô hình sẽ xử lý toàn bộ tập dữ liệu 50 lần. Thông thường, số epoch càng lớn, mô hình càng học tốt hơn.

Bạn có thể điều chỉnh (thường là tăng) con số này cho đến khi đạt được kết quả dự đoán tốt với mô hình của bạn.`,

  batchSize: `Batch là một tập hợp các mẫu được sử dụng trong một lần huấn luyện. 

Ví dụ, nếu bạn có 80 hình ảnh và chọn batch size là 16, dữ liệu sẽ được chia thành 80 / 16 = 5 batch. Khi cả 5 batch đã được đưa qua mô hình, một epoch sẽ hoàn thành.

Bạn có thể giữ nguyên giá trị này để có kết quả huấn luyện tốt.`,

  learningRate: `Hãy cẩn thận khi điều chỉnh con số này! 

Ngay cả những thay đổi nhỏ cũng có thể ảnh hưởng lớn đến khả năng học của mô hình.`
};

const TrainingNode: React.FC<TrainingNodeProps> = ({ data }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.001);
  

  const batchSizeOptions = [16, 32, 64, 128, 256];

  const handleTrainModel = useCallback(async () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setProgress(0);

    try {
      const trainingData = {
        classes: data.classNodes.map(node => ({
          name: node.data.name,
          images: node.data.images
        })),
        epochs,
        batchSize,
        learningRate
      };

      const response = await fetch('http://localhost:3000/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingData)
      });

      if (!response.ok) throw new Error('Training failed');

      const result = await response.json();
      data.setTrainingHistory(result.history);
      console.log('Training completed:', result);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
      setProgress(100);
    }
  }, [data.classNodes, isTraining, epochs, batchSize, learningRate]);

  const resetDefaults = () => {
    setEpochs(50);
    setBatchSize(16);
    setLearningRate(0.001);
  };

  return (
    <>
      <div className="training-node">
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
        <h3>Training</h3>
        <button 
          className="train-model-button"
          onClick={handleTrainModel}
          disabled={isTraining}
        >
          {isTraining ? 'Training...' : 'Train Model'}
        </button>

        <div className="advanced-section">
          <button 
            className="advanced-toggle"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <span className="advanced-text">Advanced</span>
            {isAdvancedOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {isAdvancedOpen && (
            <div className="advanced-content">
              <div className="parameter-row">
                <label>Epochs:</label>
                <div className="parameter-input">
                  <input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <div className="spinner-buttons">
                    <button onClick={() => setEpochs(prev => prev + 1)}>▲</button>
                    <button onClick={() => setEpochs(prev => Math.max(1, prev - 1))}>▼</button>
                  </div>
                </div>
                <Tooltip content={HELP_TEXTS.epochs}>
                  <FaQuestionCircle className="help-icon" />
                </Tooltip>
              </div>

              <div className="parameter-row">
                <label>Batch Size:</label>
                <div className="parameter-input">
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                  >
                    {batchSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <Tooltip content={HELP_TEXTS.batchSize}>
                  <FaQuestionCircle className="help-icon" />
                </Tooltip>
              </div>

              <div className="parameter-row">
                <label>Learning Rate:</label>
                <div className="parameter-input">
                  <input
                    type="number"
                    step="0.001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                  />
                  <div className="spinner-buttons">
                    <button onClick={() => setLearningRate(prev => prev + 0.001)}>▲</button>
                    <button onClick={() => setLearningRate(prev => Math.max(0.001, prev - 0.001))}>▼</button>
                  </div>
                </div>
                <Tooltip content={HELP_TEXTS.learningRate}>
                  <FaQuestionCircle className="help-icon" />
                </Tooltip>
              </div>

              <div className="advanced-footer">
                <button className="reset-button" onClick={resetDefaults}>
                  <BiReset /> Đặt lại mặc định
                </button>
                <button 
                  className="under-hood-button"
                  onClick={() => data.openSideBar(true)}
                >
                  <BsBarChartLine /> Chi tiết kỹ thuật
                </button>
              </div>
            </div>
          )}
        </div>

        {isTraining && (
          <div className="training-progress">
            <div 
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TrainingNode;