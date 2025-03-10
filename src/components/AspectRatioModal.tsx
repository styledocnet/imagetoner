import React, { useState, useEffect } from "react";
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
  const [linkDimensions, setLinkDimensions] = useState(true);

  useEffect(() => {
    if (linkDimensions && localAspectRatio) {
      setLocalHeight(Math.round(localWidth / localAspectRatio));
    }
  }, [localWidth, localAspectRatio, linkDimensions]);

  const handleAspectRatioChange = (value: number | null) => {
    setLocalAspectRatio(value);
    if (value) {
      setLocalHeight(Math.round(localWidth / value));
    }
  };

  const handleWidthChange = (value: number) => {
    setLocalWidth(value);
    if (linkDimensions && localAspectRatio) {
      setLocalHeight(Math.round(value / localAspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setLocalHeight(value);
    if (linkDimensions && localAspectRatio) {
      setLocalWidth(Math.round(value * localAspectRatio));
    }
  };

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
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Apply
        </button>
      }
    >
      <div className="mb-4">
        <label className="block font-semibold mb-2">Aspect Ratio:</label>
        <select
          value={localAspectRatio || ""}
          onChange={(e) =>
            handleAspectRatioChange(
              e.target.value ? parseFloat(e.target.value) : null,
            )
          }
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Original</option>
          <option value={16 / 9}>16:9</option>
          <option value={4 / 3}>4:3</option>
          <option value={1}>1:1</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {localAspectRatio === "custom" && (
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Custom Aspect Ratio:
          </label>
          <input
            type="number"
            placeholder="Width"
            className="border p-2 rounded-md w-1/2 mb-2"
            onChange={(e) =>
              setLocalAspectRatio(parseFloat(e.target.value) / localHeight)
            }
          />
          <input
            type="number"
            placeholder="Height"
            className="border p-2 rounded-md w-1/2"
            onChange={(e) =>
              setLocalAspectRatio(localWidth / parseFloat(e.target.value))
            }
          />
        </div>
      )}

      <div className="mb-4 flex items-center">
        <label className="block font-semibold mb-2 mr-4">
          Link Dimensions:
        </label>
        <input
          type="checkbox"
          checked={linkDimensions}
          onChange={() => setLinkDimensions(!linkDimensions)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Width:</label>
        <input
          type="number"
          min="100"
          max="1920"
          value={localWidth}
          onChange={(e) => handleWidthChange(parseInt(e.target.value))}
          className="w-full border p-2 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Height:</label>
        <input
          type="number"
          min="100"
          max="1080"
          value={localHeight}
          onChange={(e) => handleHeightChange(parseInt(e.target.value))}
          className="w-full border p-2 rounded-md"
          disabled={linkDimensions && localAspectRatio !== null}
        />
      </div>
    </Modal>
  );
};

export default AspectRatioModal;
