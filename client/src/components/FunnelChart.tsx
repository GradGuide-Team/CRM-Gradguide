import React from 'react';
import { FunnelChartProps, FunnelSegment } from '@/types/analytics';

const colorSchemes = {
  blue: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-400',
    tertiary: 'bg-blue-300',
    quaternary: 'bg-blue-200',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-600',
    hoverContainer: 'hover:bg-blue-50',
    focus: 'focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'
  },
  green: {
    primary: 'bg-green-500',
    secondary: 'bg-green-400',
    tertiary: 'bg-green-300',
    quaternary: 'bg-green-200',
    text: 'text-green-700',
    hover: 'hover:bg-green-600',
    hoverContainer: 'hover:bg-green-50',
    focus: 'focus:ring-2 focus:ring-green-300 focus:ring-opacity-50'
  },
  purple: {
    primary: 'bg-purple-500',
    secondary: 'bg-purple-400',
    tertiary: 'bg-purple-300',
    quaternary: 'bg-purple-200',
    text: 'text-purple-700',
    hover: 'hover:bg-purple-600',
    hoverContainer: 'hover:bg-purple-50',
    focus: 'focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50'
  },
  orange: {
    primary: 'bg-orange-500',
    secondary: 'bg-orange-400',
    tertiary: 'bg-orange-300',
    quaternary: 'bg-orange-200',
    text: 'text-orange-700',
    hover: 'hover:bg-orange-600',
    hoverContainer: 'hover:bg-orange-50',
    focus: 'focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50'
  },
  red: {
    primary: 'bg-red-500',
    secondary: 'bg-red-400',
    tertiary: 'bg-red-300',
    quaternary: 'bg-red-200',
    text: 'text-red-700',
    hover: 'hover:bg-red-600',
    hoverContainer: 'hover:bg-red-50',
    focus: 'focus:ring-2 focus:ring-red-300 focus:ring-opacity-50'
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
  const hoverVariants = [colors.hover, colors.hover, colors.hover, colors.hover];

  // Sort data by count (descending) for funnel effect
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b.count - a.count);

  // Calculate max width for scaling
  const maxCount = Math.max(...Object.values(data).map(item => item.count));

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6" style={{ minHeight: height }}>
      <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${colors.text}`}>{title}</h3>

      <div className="space-y-3 sm:space-y-4">
        {sortedEntries.map(([segment, segmentData], index) => {
          const widthPercentage = maxCount > 0 ? (segmentData.count / maxCount) * 100 : 0;
          const colorClass = colorVariants[index % colorVariants.length];
          const hoverClass = hoverVariants[index % hoverVariants.length];
          const isClickable = !!onSegmentClick;

          return (
            <div
              key={segment}
              className={`
                group relative p-2 rounded-lg transition-all duration-200
                ${isClickable ? `cursor-pointer ${colors.hoverContainer} ${colors.focus}` : ''}
                ${isClickable ? 'hover:shadow-sm hover:scale-[1.02]' : ''}
                focus:outline-none
              `}
              onClick={() => onSegmentClick?.(segment, segmentData)}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSegmentClick?.(segment, segmentData);
                }
              }}
              tabIndex={isClickable ? 0 : -1}
              role={isClickable ? 'button' : undefined}
              aria-label={isClickable ? `${segment}: ${segmentData.count} items (${segmentData.percentage}%)` : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm sm:text-base font-medium text-gray-700 truncate pr-2">
                  {segment}
                </span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    {segmentData.count.toLocaleString()}
                  </span>
                  {showPercentages && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({segmentData.percentage}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="relative bg-gray-200 rounded-full h-6 sm:h-8 overflow-hidden shadow-inner">
                <div
                  className={`
                    ${colorClass} h-full rounded-full transition-all duration-300 ease-out
                    flex items-center justify-center relative overflow-hidden
                    ${isClickable ? `group-hover:brightness-110 group-hover:saturate-110` : ''}
                  `}
                  style={{ width: `${widthPercentage}%` }}
                >
                  {segmentData.count > 0 && widthPercentage > 15 && (
                    <span className="text-white text-xs sm:text-sm font-medium px-2 relative z-10 drop-shadow-sm">
                      {segmentData.count.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress indicator for very small segments */}
              {widthPercentage < 5 && segmentData.count > 0 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedEntries.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm sm:text-base">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
};
