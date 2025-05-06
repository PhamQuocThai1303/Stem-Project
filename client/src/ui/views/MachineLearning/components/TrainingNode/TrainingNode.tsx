/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import { BsBarChartLine } from 'react-icons/bs';
import './TrainingNode.css';
import { useTranslation } from 'react-i18next';

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
  epochs: `Epoch là số lần toàn bộ tập dữ liệu huấn luyện được đưa qua mô hình một lần. 
  
Nếu bạn có 1,000 ảnh huấn luyện, thì 1 epoch nghĩa là mô hình sẽ xem xét toàn bộ 1,000 ảnh đó một lần. Nếu bạn huấn luyện 50 epochs thì mô hình sẽ "học" từ tập huấn luyện đó 50 lần.

Bạn có thể điều chỉnh (thường là tăng) con số này cho đến khi đạt được kết quả dự đoán tốt với mô hình của bạn.`,

  batchSize: `Batch size là số lượng mẫu dữ liệu được đưa vào mô hình cùng lúc trong một lần lan truyền tiến (forward) và lan truyền ngược (backward). 

Ví dụ, nếu bạn có 80 hình ảnh và chọn batch size là 16, dữ liệu sẽ được chia thành 80 / 16 = 5 batch. Khi cả 5 batch đã được đưa qua mô hình, một epoch sẽ hoàn thành.

Bạn có thể giữ nguyên giá trị này để có kết quả huấn luyện tốt.`,

  learningRate: `Learning rate là mức độ thay đổi của trọng số mô hình sau mỗi lần cập nhật, dựa trên độ dốc của hàm mất mát.

  Hãy cẩn thận khi điều chỉnh con số này! 

Learning rate quá nhỏ → học rất chậm, mất nhiều thời gian để hội tụ.
Learning rate quá lớn → có thể làm mô hình dao động và không hội tụ được.
`
};

const TrainingNode: React.FC<TrainingNodeProps> = ({ data }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.001);
  const {t} = useTranslation()

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
      data.setTrainingHistory({...result.history, ...result.model_params});
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
          {isTraining ? t("Training...") : t("Train Model")}
        </button>

        <div className="advanced-section">
          <button 
            className="advanced-toggle"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <span className="advanced-text">{t("Advanced")}</span>
            {isAdvancedOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {isAdvancedOpen && (
            <div className="advanced-content">
              <div className="parameter-row">
                <label>{t("Epochs")}:</label>
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
                <Tooltip content={t(HELP_TEXTS.epochs)}>
                  <FaQuestionCircle className="help-icon" />
                </Tooltip>
              </div>

              <div className="parameter-row">
                <label>{t("Batch Size")}:</label>
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
                <Tooltip content={t(HELP_TEXTS.batchSize)}>
                  <FaQuestionCircle className="help-icon" />
                </Tooltip>
              </div>

              <div className="parameter-row">
                <label>{t("Learning Rate")}:</label>
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
                <Tooltip content={t(HELP_TEXTS.learningRate)}>
                  <FaQuestionCircle className="help-icon" />
                </Tooltip>
              </div>

              <div className="advanced-footer">
                <button className="reset-button" onClick={resetDefaults}>
                  <BiReset /> {t("Reset to default")}
                </button>
                <button 
                  className="under-hood-button"
                  onClick={() => data.openSideBar(true)}
                >
                  <BsBarChartLine /> {t("Technical details")}
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