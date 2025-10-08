import React, { useState } from 'react';

const CustomRadarChart = ({ data, player1Color, player2Color, comparisonMode, invertedStats = [], width = 800, height = 800, statDescriptions = {} }) => {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 280;
  const numLevels = 10;

  const numAxes = data.length;
  const angleStep = (2 * Math.PI) / numAxes;

  const polarToCartesian = (angle, radius) => {
    return {
      x: centerX + radius * Math.cos(angle - Math.PI / 2),
      y: centerY + radius * Math.sin(angle - Math.PI / 2)
    };
  };

  const getValueAtPercentile = (statData, percentile) => {
    const range = statData.max - statData.min;
    return statData.min + (range * percentile / 100);
  };

  const renderGridCircles = () => {
    return Array.from({ length: numLevels + 1 }, (_, i) => {
      const radius = (maxRadius / numLevels) * i;
      return (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={comparisonMode ? "#00000015" : "#FFFFFF30"}
          strokeWidth="1"
        />
      );
    });
  };

  const renderAxes = () => {
    return data.map((stat, i) => {
      const angle = angleStep * i;
      const endPoint = polarToCartesian(angle, maxRadius);

      return (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={comparisonMode ? "#00000015" : "#FFFFFF30"}
          strokeWidth="1"
        />
      );
    });
  };

  const renderAxisLabels = () => {
    return data.map((stat, i) => {
      const angle = angleStep * i;
      const labelDistance = maxRadius + 85;
      const labelPoint = polarToCartesian(angle, labelDistance);

      const percentiles = [20, 30, 40, 50, 60, 70, 80, 90, 100];

      const statKey = stat.statKey;
      const isInverted = invertedStats.includes(statKey);

      return (
        <g key={i}>
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            fill={comparisonMode ? "#000000" : "#FFFFFF"}
            fontSize="15"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            style={{ cursor: statDescriptions[statKey] ? 'help' : 'default' }}
            onMouseEnter={(e) => {
              if (statDescriptions[statKey]) {
                setHoveredStat(statKey);
                const rect = e.target.getBoundingClientRect();
                setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
              }
            }}
            onMouseLeave={() => setHoveredStat(null)}
          >
            {stat.stat}
          </text>

          {percentiles.map((percentile, idx) => {
            const radius = (maxRadius / numLevels) * (idx + 2);
            const point = polarToCartesian(angle, radius);

            const displayPercentile = isInverted ? (100 - percentile) : percentile;
            const value = getValueAtPercentile(stat, displayPercentile).toFixed(1);

            const rotationAngle = (angle * 180 / Math.PI);

            return (
              <text
                key={idx}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={comparisonMode ? "#333333" : "#FFFFFF"}
                fontSize="13"
                fontWeight="700"
                opacity="0.95"
                fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                transform={`rotate(${rotationAngle}, ${point.x}, ${point.y})`}
              >
                {value}
              </text>
            );
          })}
        </g>
      );
    });
  };

  const renderPlayerData = (playerKey, color) => {
    const points = data.map((stat, i) => {
      const angle = angleStep * i;
      const value = comparisonMode ? stat[playerKey] : stat.value;
      const radius = (maxRadius / 100) * value;
      return polarToCartesian(angle, radius);
    });

    const pathData = points.map((point, i) =>
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <g>
        <path
          d={pathData}
          fill={color}
          fillOpacity={comparisonMode ? "0.3" : "0.5"}
          stroke={color}
          strokeWidth="4"
        />
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={color}
            stroke={comparisonMode ? "#ffffff" : color}
            strokeWidth="1"
          />
        ))}
      </g>
    );
  };

  return (
    <>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {renderGridCircles()}
        {renderAxes()}
        {renderPlayerData(comparisonMode ? 'player1' : 'value', player1Color)}
        {comparisonMode && renderPlayerData('player2', player2Color)}
        {renderAxisLabels()}
      </svg>

      {/* Tooltip */}
      {hoveredStat && statDescriptions[hoveredStat] && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-2xl max-w-xs">
            <div className="text-xs text-gray-300">
              {statDescriptions[hoveredStat]}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-600 rotate-45"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomRadarChart;
