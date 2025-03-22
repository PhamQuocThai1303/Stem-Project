interface ProgressBarProps {
    className: string;
    percentage: number;
    color: string;
  }
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ className, percentage, color }) => (
    <div className="progress-bar-container">
      <span className="class-name">{className}</span>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
        <span className="percentage">{percentage}%</span>
      </div>
    </div>
  );
  
  export default ProgressBar;