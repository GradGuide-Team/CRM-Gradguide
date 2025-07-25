import React from 'react';
import { FunnelChartProps, FunnelSegment } from '@/types/analytics';

const colorSchemes = {
  blue: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-400',
    tertiary: 'bg-blue-300',
    quaternary: 'bg-blue-200',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-600'
  },
  green: {
    primary: 'bg-green-500',
    secondary: 'bg-green-400',
    tertiary: 'bg-green-300',
    quaternary: 'bg-green-200',
    text: 'text-green-700',
    hover: 'hover:bg-green-600'
  },
  purple: {
    primary: 'bg-purple-500',
    secondary: 'bg-purple-400',
    tertiary: 'bg-purple-300',
    quaternary: 'bg-purple-200',
    text: 'text-purple-700',
    hover: 'hover:bg-purple-600'
  },
  orange: {
    primary: 'bg-orange-500',
    secondary: 'bg-orange-400',
    tertiary: 'bg-orange-300',
    quaternary: 'bg-orange-200',
    text: 'text-orange-700',
    hover: 'hover:bg-orange-600'
  },
  red: {
    primary: 'bg-red-500',
    secondary: 'bg-red-400',
    tertiary: 'bg-red-300',
    quaternary: 'bg-red-200',
    text: 'text-red-700',
    hover: 'hover:bg-red-600'
  }
};

export const FunnelChart: React.FC<FunnelChartProps> = ({
  title,
  data,
  colorScheme = 'blue',
  showPercentages = true,
  onSegmentClick,
  height = 400
}) => {
  const colors = colorSchemes[colorScheme];
  const colorVariants = [colors.primary, colors.secondary, colors.tertiary, colors.quaternary];
  
  // Sort data by count (descending) for funnel effect
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b.count - a.count);
  
  // Calculate max width for scaling
  const maxCount = Math.max(...Object.values(data).map(item => item.count));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6" style={{ height }}>
      <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>{title}</h3>
      
      <div className="space-y-3">
        {sortedEntries.map(([segment, segmentData], index) => {
          const widthPercentage = maxCount > 0 ? (segmentData.count / maxCount) * 100 : 0;
          const colorClass = colorVariants[index % colorVariants.length];
          
          return (
            <div
              key={segment}
              className={`relative transition-all duration-200 ${
                onSegmentClick ? `cursor-pointer ${colors.hover}` : ''
              }`}
              onClick={() => onSegmentClick?.(segment, segmentData)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{segment}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{segmentData.count}</span>
                  {showPercentages && (
                    <span className="text-xs text-gray-500">({segmentData.percentage}%)</span>
                  )}
                </div>
              </div>
              
              <div className="relative bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center`}
                  style={{ width: `${widthPercentage}%` }}
                >
                  {segmentData.count > 0 && (
                    <span className="text-white text-xs font-medium px-2">
                      {segmentData.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedEntries.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};
