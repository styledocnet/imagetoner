import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, className = "" }) => (
  <label className={`flex items-center gap-2 cursor-pointer select-none ${className}`}>
    {label && <span className="text-sm">{label}</span>}
    <span className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
        tabIndex={0}
        aria-checked={checked}
        role="switch"
      />
      <div
        className={`
          w-10 h-6 rounded-full transition-colors
          ${checked ? "bg-blue-600 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-700"}
          peer-focus:ring-2 peer-focus:ring-blue-400
        `}
      />
      <div
        className={`
          absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-100 border border-gray-300 dark:border-gray-500 rounded-full shadow
          transition-transform duration-200
          ${checked ? "translate-x-4" : "translate-x-0"}
        `}
      />
    </span>
  </label>
);

export default Switch;
