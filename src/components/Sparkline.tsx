import React from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 300,
  height = 100,
  strokeColor = "#3b82f6",
  fillColor = "rgba(59, 130, 246, 0.2)",
}) => {
  // Filter out any invalid numbers from the data array
  const sanitizedData = data.filter(
    (value) => !isNaN(value) && isFinite(value),
  );

  if (sanitizedData.length === 0) return null;

  const max = Math.max(...sanitizedData);
  const min = Math.min(...sanitizedData);

  const getX = (index: number) => (index / (sanitizedData.length - 1)) * width;
  const getY = (value: number) =>
    height - ((value - min) / (max - min)) * height;

  const pathData = sanitizedData
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)},${getY(value)}`,
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d={`${pathData} L ${width},${height} L 0,${height} Z`}
        fill={fillColor}
      />
      <path d={pathData} />
    </svg>
  );
};

export default Sparkline;
