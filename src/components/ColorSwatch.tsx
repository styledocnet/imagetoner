import React from "react";

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
  label?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, selected, onClick, label }) => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    className={`w-7 h-7 rounded-full border-2 transition-colors m-1 focus:outline-none ${
      selected ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
    }`}
    style={{ backgroundColor: color }}
    aria-pressed={selected}
  />
);

export default ColorSwatch;
