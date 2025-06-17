import React from "react";

interface SelectBoxOption {
  label: string;
  value: string;
}

interface ShinSelectBoxProps {
  options: SelectBoxOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  small?: boolean;
}

const ShinSelectBox: React.FC<ShinSelectBoxProps> = ({ options, value, onChange, label, placeholder = "Select...", className = "", small = false }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className={`font-semibold ${small ? "text-xs mb-0.5" : "text-sm mb-1"} text-gray-800 dark:text-gray-200`}>{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            shinitem shin-glass shinitem-perspective
            w-full appearance-none
            border border-white/30 dark:border-white/20
            rounded-lg shadow-md
            backdrop-blur
            ${small ? "px-2 py-1 text-sm" : "px-4 py-2 text-base"}
            focus:outline-none focus:ring-2 focus:ring-sky-400
            pr-10
            transition
            bg-white/40 dark:bg-black/30
            text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div
          className={`
            pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2
            text-gray-400 dark:text-gray-500
            ${small ? "text-xs" : "text-lg"}
          `}
        >
          <svg
            className="w-3 h-3 absolute top-1/2 right-3 pointer-events-none transform -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 412 232"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
              fill="currentColor"
              fillRule="nonzero"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ShinSelectBox;
