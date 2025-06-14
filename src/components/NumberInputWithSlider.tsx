import React from "react";

export interface NumberInputWithSliderProps {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const NumberInputWithSlider: React.FC<NumberInputWithSliderProps> = ({ label, value, onChange, min = 1, max = 500, step = 1, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="mb-1 font-semibold text-gray-700 dark:text-gray-300">{label}</label>}
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-blue-600" />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
  </div>
);

export default NumberInputWithSlider;
