import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
interface ChartProps {
  data: {
    loss: number[];
    accuracy: number[];
    val_loss: number[];
    val_accuracy: number[];
    lr: number[];
  };
}

const Charts: React.FC<ChartProps> = ({ data }) => {
  const {t} = useTranslation()
  // Chuyển đổi dữ liệu thành format phù hợp với Recharts
  const accuracyData = data?.accuracy?.map((acc, index) => ({
    epoch: index,
    train: acc,
    validation: data.val_accuracy[index]
  }));

  const lossData = data?.loss?.map((loss, index) => ({
    epoch: index,
    train: loss,
    validation: data?.val_loss[index]
  }));

  const chartStyle = {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  };

  return (
    <div>
      <div style={chartStyle}>
        <h3 style={{ marginBottom: '20px' }}>{t("Accuracy per epoch")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="epoch" 
              label={{ 
                value: t("Epoch"), 
                position: 'insideBottom', 
                offset: -5 
              }} 
            />
            <YAxis 
              label={{ 
                value: t("Accuracy"), 
                angle: -90, 
                position: 'insideLeft'
              }}
              domain={[0, 1]}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="train" 
              stroke="#8884d8" 
              name="Train"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="validation" 
              stroke="#82ca9d" 
              name="Validation"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={chartStyle}>
        <h3 style={{ marginBottom: '20px' }}>{t("Loss per epoch")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lossData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="epoch" 
              label={{ 
                value: t("Epoch"), 
                position: 'insideBottom', 
                offset: -5 
              }} 
            />
            <YAxis 
              label={{ 
                value: t("Loss"), 
                angle: -90, 
                position: 'insideLeft'
              }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="train" 
              stroke="#8884d8" 
              name="Train"
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="validation" 
              stroke="#82ca9d" 
              name="Validation"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts; 