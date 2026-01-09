import React, { useState } from 'react';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  primaryColor = '#00c951',
  secondaryColor = '#e5e7eb',
  showPercentage = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-xl font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

// Demo component
export default function App() {
  const [progress, setProgress] = useState(65);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold text-gray-800">Circular Progress Bar</h1>

      <CircularProgress progress={progress} />

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-gray-600">Drag to adjust progress</span>
      </div>

      {/* Different variations */}
      <div className="flex flex-wrap gap-6 justify-center mt-8">
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            progress={25}
            size={80}
            strokeWidth={6}
            primaryColor="#ef4444"
          />
          <span className="text-sm text-gray-500">Small / Red</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            progress={50}
            size={100}
            strokeWidth={12}
            primaryColor="#22c55e"
          />
          <span className="text-sm text-gray-500">Medium / Green</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            progress={75}
            size={140}
            strokeWidth={8}
            primaryColor="#8b5cf6"
          />
          <span className="text-sm text-gray-500">Large / Purple</span>
        </div>
      </div>
    </div>
  );
}
