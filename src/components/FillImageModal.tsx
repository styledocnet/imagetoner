import React, { useState } from "react";
import Modal from "./Modal";
import ColorPickerWithSwatches from "./ColorPickerWithSwatches";
import { BrandStyle } from "../types";

interface FillImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasSize: { width: number; height: number };
  onFill: (image: string) => void;
  brandStyle?: BrandStyle | null;
}

const FillImageModal: React.FC<FillImageModalProps> = ({ isOpen, onClose, canvasSize, onFill, brandStyle }) => {
  const [fillType, setFillType] = useState("solid");
  const [color, setColor] = useState("#ffffff");
  const [startColor, setStartColor] = useState("#ff0000");
  const [endColor, setEndColor] = useState("#0000ff");
  const [direction, setDirection] = useState("to bottom");

  const themeColors = brandStyle?.colors ?? [];

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

      {fillType === "solid" && <ColorPickerWithSwatches label="Color" value={color} onChange={setColor} themeColors={themeColors} />}

      {fillType === "gradient" && (
        <>
          <ColorPickerWithSwatches label="Start Color" value={startColor} onChange={setStartColor} themeColors={themeColors} />
          <ColorPickerWithSwatches label="End Color" value={endColor} onChange={setEndColor} themeColors={themeColors} />
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
