import React, { useState } from "react";
import Modal from "./Modal";
import { BrandStyle } from "../types";

interface FillImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasSize: { width: number; height: number };
  onFill: (image: string) => void;
  brandStyle?: BrandStyle | null;
}

const getThemeColors = (brandStyle?: BrandStyle | null) =>
  brandStyle?.colors?.length
    ? brandStyle.colors
    : [
        { hex: "#ffffff", role: "default", name: "White" },
        { hex: "#000000", role: "default", name: "Black" },
      ];

const ColorSwatch: React.FC<{
  color: string;
  selected: boolean;
  onClick: () => void;
  label: string;
}> = ({ color, selected, onClick, label }) => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    className={`w-8 h-8 rounded-full border-2 m-1 ${selected ? "border-blue-500" : "border-gray-300"}`}
    style={{ backgroundColor: color }}
  />
);

const FillImageModal: React.FC<FillImageModalProps> = ({ isOpen, onClose, canvasSize, onFill, brandStyle }) => {
  const [fillType, setFillType] = useState("solid");
  const [color, setColor] = useState("#ffffff");
  const [startColor, setStartColor] = useState("#ff0000");
  const [endColor, setEndColor] = useState("#0000ff");
  const [direction, setDirection] = useState("to bottom");

  const themeColors = getThemeColors(brandStyle);

  // Render color swatches for quick selection
  const renderColorSwatches = (current: string, setCurrent: (v: string) => void) => (
    <div className="flex flex-wrap gap-1 mb-2">
      {themeColors.map((c) => (
        <ColorSwatch
          key={c.hex + c.role}
          color={c.hex}
          label={c.name || c.role}
          selected={current.toLowerCase() === c.hex.toLowerCase()}
          onClick={() => setCurrent(c.hex)}
        />
      ))}
    </div>
  );

  const createImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (ctx) {
      if (fillType === "solid") {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (fillType === "gradient") {
        let gradientFill: CanvasGradient;
        if (direction === "radial") {
          gradientFill = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2,
          );
        } else {
          const gradientDirections: {
            [key: string]: [number, number, number, number];
          } = {
            "to bottom": [0, 0, 0, canvas.height],
            "to top": [0, canvas.height, 0, 0],
            "to right": [0, 0, canvas.width, 0],
            "to left": [canvas.width, 0, 0, 0],
            "to bottom right": [0, 0, canvas.width, canvas.height],
            "to bottom left": [canvas.width, 0, 0, canvas.height],
            "to top right": [0, canvas.height, canvas.width, 0],
            "to top left": [canvas.width, canvas.height, 0, 0],
          };
          const [x0, y0, x1, y1] = gradientDirections[direction];
          gradientFill = ctx.createLinearGradient(x0, y0, x1, y1);
        }
        gradientFill.addColorStop(0, startColor);
        gradientFill.addColorStop(1, endColor);
        ctx.fillStyle = gradientFill;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    onFill(canvas.toDataURL("image/png"));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Fill Background"
      onClose={onClose}
      footer={
        <button onClick={createImage} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
          Apply
        </button>
      }
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fill Type:</label>
        <select
          value={fillType}
          onChange={(e) => setFillType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="solid">Solid</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>

      {fillType === "solid" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
          {renderColorSwatches(color, setColor)}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-md" />
        </div>
      )}

      {fillType === "gradient" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Color:</label>
            {renderColorSwatches(startColor, setStartColor)}
            <input type="color" value={startColor} onChange={(e) => setStartColor(e.target.value)} className="w-full rounded-md" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Color:</label>
            {renderColorSwatches(endColor, setEndColor)}
            <input type="color" value={endColor} onChange={(e) => setEndColor(e.target.value)} className="w-full rounded-md" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Direction:</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="to bottom">To Bottom</option>
              <option value="to top">To Top</option>
              <option value="to right">To Right</option>
              <option value="to left">To Left</option>
              <option value="to bottom right">To Bottom Right</option>
              <option value="to bottom left">To Bottom Left</option>
              <option value="to top right">To Top Right</option>
              <option value="to top left">To Top Left</option>
              <option value="radial">Radial</option>
            </select>
          </div>
        </>
      )}
    </Modal>
  );
};

export default FillImageModal;
