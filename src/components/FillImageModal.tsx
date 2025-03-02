import React, { useState } from "react";
import Modal from "./Modal";

interface FillImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFill: (image: string) => void;
}

const FillImageModal: React.FC<FillImageModalProps> = ({
  isOpen,
  onClose,
  onFill,
}) => {
  const [fillType, setFillType] = useState("solid");
  const [color, setColor] = useState("#ffffff");
  const [gradientStart, setGradientStart] = useState("#ffffff");
  const [gradientEnd, setGradientEnd] = useState("#000000");

  const createImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;

    if (ctx) {
      if (fillType === "solid") {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (fillType === "gradient") {
        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        gradient.addColorStop(0, gradientStart);
        gradient.addColorStop(1, gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const image = canvas.toDataURL("image/png");
    onFill(image);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create Image"
      onClose={onClose}
      footer={
        <button
          onClick={createImage}
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Create
        </button>
      }
    >
      <div className="mb-4">
        <label className="block font-semibold mb-2">Fill Type:</label>
        <select
          value={fillType}
          onChange={(e) => setFillType(e.target.value)}
          className="w-full"
        >
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>
      {fillType === "solid" && (
        <div className="mb-4">
          <label className="block font-semibold mb-2">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      {fillType === "gradient" && (
        <div className="mb-4">
          <label className="block font-semibold mb-2">Start Color:</label>
          <input
            type="color"
            value={gradientStart}
            onChange={(e) => setGradientStart(e.target.value)}
            className="w-full mb-2"
          />
          <label className="block font-semibold mb-2">End Color:</label>
          <input
            type="color"
            value={gradientEnd}
            onChange={(e) => setGradientEnd(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </Modal>
  );
};

export default FillImageModal;
