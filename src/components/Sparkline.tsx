import React from "react";

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
};

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 200,
  height = 50,
  strokeColor = "#D97706",
  fillColor = "none",
  strokeWidth = 2,
}) => {
  if (data.length === 0) return null;

  // data points to SVG dimensions
  const maxDataValue = Math.max(...data);
  const minDataValue = Math.min(...data);
  const normalizedData = data.map(
    (value) =>
      ((value - minDataValue) / (maxDataValue - minDataValue || 1)) * height,
  );

  const points = normalizedData
    .map(
      (value, index) =>
        `${(index / (data.length - 1)) * width},${height - value}`,
    )
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="sparkline"
    >
      {fillColor !== "none" && (
        <polygon
          points={`${points} ${width},${height} 0,${height}`}
          fill={fillColor}
          stroke="none"
        />
      )}
      {/* Sparkline */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default Sparkline;
