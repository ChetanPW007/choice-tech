interface ProgressCircleProps {
  percentage: number;
  isPassing: boolean;
  size?: number;
}

const ProgressCircle = ({ percentage, isPassing, size = 200 }: ProgressCircleProps) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = isPassing ? 'hsl(140 100% 45%)' : 'hsl(50 100% 50%)';
  const glowColor = isPassing ? 'hsl(140 100% 45% / 0.5)' : 'hsl(50 100% 50% / 0.5)';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="progress-circle"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(180 30% 15%)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 10px ${glowColor})`,
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-orbitron text-3xl md:text-4xl font-bold"
          style={{ 
            color,
            textShadow: `0 0 10px ${glowColor}`,
          }}
        >
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressCircle;
