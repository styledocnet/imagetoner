import React from "react";

type Option = {
  value: string | number;
  label: string;
};

interface SelectBoxProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rounded?: boolean; // full = pill, false = normal
}

const SelectBox: React.FC<SelectBoxProps> = ({ options, value, onChange, placeholder = "Select…", className = "", disabled = false, rounded = true }) => (
  <div className="relative inline-flex w-full">
    {/* Custom Chevron Icon */}
    <svg
      className="w-3 h-3 absolute top-1/2 right-3 pointer-events-none transform -translate-y-1/2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 412 232"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
        fill="#a0aec0"
        fillRule="nonzero"
      />
    </svg>

    {/* The select */}
    <select
      disabled={disabled}
      className={
        `
        w-full
        ${rounded ? "rounded-full" : "rounded-md"}
        border border-gray-300 dark:border-gray-700
        text-gray-900 dark:text-gray-50
        h-10 pl-5 pr-10
        bg-gray-100 dark:bg-gray-700
        hover:border-gray-400 dark:hover:border-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500
        appearance-none
        transition
        ` + className
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectBox;
