import React from "react";
import ColorSwatch from "./ColorSwatch";

interface ColorPickerWithSwatchesProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  themeColors?: { hex: string; name?: string; role?: string }[];
}

const ColorPickerWithSwatches: React.FC<ColorPickerWithSwatchesProps> = ({ label, value, onChange, themeColors = [] }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="flex flex-wrap items-center gap-1 mb-1">
      {themeColors.map((c) => (
        <ColorSwatch
          key={c.hex}
          color={c.hex}
          label={c.name || c.role || ""}
          selected={value.toLowerCase() === c.hex.toLowerCase()}
          onClick={() => onChange(c.hex)}
        />
      ))}
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border ml-2" aria-label={label} />
    </div>
  </div>
);

export default ColorPickerWithSwatches;
