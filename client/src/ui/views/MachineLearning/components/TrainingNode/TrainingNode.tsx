import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

interface TrainingNodeProps {
  data: {
    classNodes: Array<{
      id: string;
      data: {
        id: number;
        images: string[];
      };
    }>;
  };
}

const TrainingNode: React.FC<TrainingNodeProps> = ({ data }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);

  // console.log('TrainingNode data:', data);

  const handleTrainModel = useCallback(async () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setProgress(0);

    try {
      const trainingData = {
        classes: data.classNodes.map(node => ({
          name: `Class ${node.data.id}`,
          images: node.data.images
        })),
        epochs: 50
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
      console.log('Training completed:', result);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
      setProgress(100);
    }
  }, [data.classNodes, isTraining]);

  return (
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
      {isTraining && (
        <div className="training-progress">
          <div 
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
    </div>
  );
};

export default TrainingNode;