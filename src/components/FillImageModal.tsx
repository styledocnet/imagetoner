import React, { useState } from "react";
import Modal from "./Modal";
import ColorPickerWithSwatches from "./ColorPickerWithSwatches";
import { BrandStyle } from "../types";
import ShinSelectBox from "./shinui/ShinSelectBox";

interface FillImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasSize: { width: number; height: number };
  onFill: (image: string) => void;
  brandStyle?: BrandStyle | null;
}

const GRADIENT_DIRECTIONS = [
  { value: "to bottom", label: "Linear: Bottom" },
  { value: "to top", label: "Linear: Top" },
  { value: "to right", label: "Linear: Right" },
  { value: "to left", label: "Linear: Left" },
  { value: "to bottom right", label: "Linear: Bottom Right" },
  { value: "to bottom left", label: "Linear: Bottom Left" },
  { value: "to top right", label: "Linear: Top Right" },
  { value: "to top left", label: "Linear: Top Left" },
  { value: "radial", label: "Radial" },
  { value: "conic", label: "Conic" },
];

const GRADIENT_TYPES = [
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
  { value: "conic", label: "Conic" },
];

const FILL_TYPES = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  // Optionally add "pattern", "image", etc.
];

const ShinFillImageModal: React.FC<FillImageModalProps> = ({ isOpen, onClose, canvasSize, onFill, brandStyle }) => {
  const themeColors = brandStyle?.colors ?? [];
  const [fillType, setFillType] = useState("solid");
  const [gradientType, setGradientType] = useState("linear");
  const [direction, setDirection] = useState("to bottom");
  const [color, setColor] = useState("#ffffff");
  const [startColor, setStartColor] = useState("#ff0000");
  const [endColor, setEndColor] = useState("#0000ff");
  const [midColor, setMidColor] = useState<string | null>(null);
  const [midColorStop, setMidColorStop] = useState(0.5); // 0.0-1.0
  const [angle, setAngle] = useState(90); // For conic/linear gradients

  // For pro users: allow more stops (array of {color, stop})
  // For now, provide a mid color option

  const handleApply = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (!ctx) return;

    if (fillType === "solid") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (fillType === "gradient") {
      let gradientFill: CanvasGradient | null = null;
      if (gradientType === "radial") {
        gradientFill = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2,
        );
      } else if (gradientType === "conic") {
        // Canvas does not natively support conic gradients yet; fake it for preview
        // For now, fallback to linear or radial
        gradientFill = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      } else {
        // linear
        const gradientDirections: { [key: string]: [number, number, number, number] } = {
          "to bottom": [0, 0, 0, canvas.height],
          "to top": [0, canvas.height, 0, 0],
          "to right": [0, 0, canvas.width, 0],
          "to left": [canvas.width, 0, 0, 0],
          "to bottom right": [0, 0, canvas.width, canvas.height],
          "to bottom left": [canvas.width, 0, 0, canvas.height],
          "to top right": [0, canvas.height, canvas.width, 0],
          "to top left": [canvas.width, canvas.height, 0, 0],
        };
        let [x0, y0, x1, y1] = gradientDirections[direction] || [0, 0, 0, canvas.height];
        // If angle is manually set (for pro), override direction
        if (gradientType === "linear" && angle !== 90) {
          const radians = (angle * Math.PI) / 180;
          x0 = canvas.width / 2 - (canvas.width / 2) * Math.cos(radians);
          y0 = canvas.height / 2 - (canvas.height / 2) * Math.sin(radians);
          x1 = canvas.width / 2 + (canvas.width / 2) * Math.cos(radians);
          y1 = canvas.height / 2 + (canvas.height / 2) * Math.sin(radians);
        }
        gradientFill = ctx.createLinearGradient(x0, y0, x1, y1);
      }

      if (gradientFill) {
        gradientFill.addColorStop(0, startColor);
        if (midColor && midColorStop > 0 && midColorStop < 1) {
          gradientFill.addColorStop(midColorStop, midColor);
        }
        gradientFill.addColorStop(1, endColor);
        ctx.fillStyle = gradientFill;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    onFill(canvas.toDataURL("image/png"));
    onClose();
  };

  // Show direction options only for linear/conic; radial ignores direction
  const showDirection = fillType === "gradient" && (gradientType === "linear" || gradientType === "conic");
  const showAngle = fillType === "gradient" && gradientType === "conic";

  return (
    <Modal
      isOpen={isOpen}
      title="Fill Background"
      onClose={onClose}
      footer={
        <button onClick={handleApply} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition shinitem shin-glass">
          Apply
        </button>
      }
    >
      <div className="mb-4">
        <ShinSelectBox label="Fill Type" options={FILL_TYPES} value={fillType} onChange={setFillType} />
      </div>

      {fillType === "solid" && <ColorPickerWithSwatches label="Color" value={color} onChange={setColor} themeColors={themeColors} />}

      {fillType === "gradient" && (
        <>
          <div className="mb-4">
            <ShinSelectBox
              label="Gradient Type"
              options={GRADIENT_TYPES}
              value={gradientType}
              onChange={(v) => {
                setGradientType(v);
                // Reset direction if switching type
                if (v === "radial") setDirection("radial");
                else if (
                  !["to bottom", "to top", "to right", "to left", "to bottom right", "to bottom left", "to top right", "to top left"].includes(direction)
                ) {
                  setDirection("to bottom");
                }
              }}
            />
          </div>
          <ColorPickerWithSwatches label="Start Color" value={startColor} onChange={setStartColor} themeColors={themeColors} />
          <ColorPickerWithSwatches label="End Color" value={endColor} onChange={setEndColor} themeColors={themeColors} />
          <div className="mb-4 flex items-center gap-2">
            <label className="text-xs text-gray-700 dark:text-gray-300">Add Mid Color:</label>
            <input type="checkbox" checked={!!midColor} onChange={(e) => setMidColor(e.target.checked ? "#ff00ff" : null)} className="accent-blue-500" />
            {midColor && (
              <>
                <ColorPickerWithSwatches label="Mid Color" value={midColor} onChange={setMidColor} themeColors={themeColors} />
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={midColorStop}
                  onChange={(e) => setMidColorStop(Number(e.target.value))}
                  className="ml-2"
                  style={{ width: 80 }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(midColorStop * 100)}%</span>
              </>
            )}
          </div>
          {showDirection && (
            <div className="mb-4">
              <ShinSelectBox
                label={gradientType === "conic" ? "Conic Angle Direction" : "Linear Direction"}
                options={GRADIENT_DIRECTIONS.filter((opt) => (gradientType === "conic" ? opt.value === "conic" : opt.value !== "conic"))}
                value={direction}
                onChange={setDirection}
              />
            </div>
          )}
          {showAngle && (
            <div className="mb-4 flex items-center gap-3">
              <label className="text-xs text-gray-700 dark:text-gray-300">Angle:</label>
              <input
                type="number"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded shinitem shin-glass bg-white/30 dark:bg-black/30 border border-gray-200 dark:border-gray-700 text-sm"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">deg</span>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default ShinFillImageModal;
