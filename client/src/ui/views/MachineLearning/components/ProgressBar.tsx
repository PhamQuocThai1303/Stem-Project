interface ProgressBarProps {
  percentage: number;
  color: string;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, color, label }) => {
  return (
    <div className="progress-container">
      <div className="progress-label">{label}</div>
      <div className="progress-bar" style={{ backgroundColor: '#f0f0f0' }}>
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
      <div className="progress-percentage">{Math.round(percentage)}%</div>
    </div>
  );
};

export default ProgressBar;