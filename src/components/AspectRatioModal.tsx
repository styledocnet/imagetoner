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

  const handleApply = () => {
    setAspectRatio(aspectRatio);
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
    </Modal>
  );
};

export default AspectRatioModal;
