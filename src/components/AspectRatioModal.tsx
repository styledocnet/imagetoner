import React, { useState, useEffect } from "react";
import Modal from "./Modal";

interface AspectRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: number | null;
  setAspectRatio: (aspectRatio: number | null) => void;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
}

const AspectRatioModal: React.FC<AspectRatioModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  setAspectRatio,
  canvasSize,
  setCanvasSize,
}) => {
  const [width, setWidth] = useState(canvasSize.width);
  const [height, setHeight] = useState(canvasSize.height);
  const [linked, setLinked] = useState(true);

  useEffect(() => {
    if (linked && aspectRatio) {
      setHeight(Math.round(width / aspectRatio));
    }
  }, [width, aspectRatio, linked]);

  useEffect(() => {
    if (linked && aspectRatio) {
      setWidth(Math.round(height * aspectRatio));
    }
  }, [height, aspectRatio, linked]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(Number(e.target.value));
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(Number(e.target.value));
  };

  const handleApply = () => {
    setCanvasSize({ width, height });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Set Document Size"
      onClose={onClose}
      footer={
        <button
          onClick={handleApply}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Apply
        </button>
      }
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Aspect Ratio:
        </label>
        <select
          value={aspectRatio || ""}
          onChange={(e) => setAspectRatio(parseFloat(e.target.value) || null)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Free</option>
          <option value={16 / 9}>16:9</option>
          <option value={4 / 3}>4:3</option>
          <option value={1}>1:1</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Width:
        </label>
        <input
          type="number"
          value={width}
          onChange={handleWidthChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Height:
        </label>
        <input
          type="number"
          value={height}
          onChange={handleHeightChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={linked}
          onChange={() => setLinked(!linked)}
          className="mr-2"
        />
        <label className="block text-sm font-medium text-gray-700">
          Maintain Aspect Ratio
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Presets:
        </label>
        <select
          onChange={(e) => {
            const [presetWidth, presetHeight] = e.target.value
              .split("x")
              .map(Number);
            setWidth(presetWidth);
            setHeight(presetHeight);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a preset</option>
          <option value="1080x1080">Instagram Post (1080x1080)</option>
          <option value="1080x1920">Instagram Story (1080x1920)</option>
          <option value="1920x1080">HD (1920x1080)</option>
        </select>
      </div>
    </Modal>
  );
};

export default AspectRatioModal;
