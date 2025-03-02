import React, { useState } from "react";
import Modal from "./Modal";

interface AspectRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: number | null;
  setAspectRatio: (aspectRatio: number | null) => void;
  canvasWidth: number;
  setCanvasWidth: (canvasWidth: number) => void;
  canvasHeight: number;
  setCanvasHeight: (canvasHeight: number) => void;
}

const AspectRatioModal: React.FC<AspectRatioModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  setAspectRatio,
  canvasWidth,
  setCanvasWidth,
  canvasHeight,
  setCanvasHeight,
}) => {
  const [localAspectRatio, setLocalAspectRatio] = useState(aspectRatio);
  const [localWidth, setLocalWidth] = useState(canvasWidth);
  const [localHeight, setLocalHeight] = useState(canvasHeight);

  const handleApply = () => {
    setAspectRatio(localAspectRatio);
    setCanvasWidth(localWidth);
    setCanvasHeight(localHeight);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Aspect Ratio"
      onClose={onClose}
      footer={
        <button
          onClick={handleApply}
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Apply
        </button>
      }
    >
      <div className="mb-4">
        <label className="block font-semibold mb-2">Aspect Ratio:</label>
        <select
          value={localAspectRatio}
          onChange={(e) =>
            setLocalAspectRatio(
              e.target.value ? parseFloat(e.target.value) : null,
            )
          }
          className="w-full"
        >
          <option value="">Original</option>
          <option value={16 / 9}>16:9</option>
          <option value={4 / 3}>4:3</option>
          <option value={1}>1:1</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Width:</label>
        <input
          type="number"
          min="100"
          max="1920"
          value={localWidth}
          onChange={(e) => setLocalWidth(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Height:</label>
        <input
          type="number"
          min="100"
          max="1080"
          value={localHeight}
          onChange={(e) => setLocalHeight(parseInt(e.target.value))}
          className="w-full"
          disabled={localAspectRatio !== null}
        />
      </div>
    </Modal>
  );
};

export default AspectRatioModal;
