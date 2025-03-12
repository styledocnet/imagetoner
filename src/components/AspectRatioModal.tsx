import React, { useRef, useEffect } from "react";
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
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const linkedRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (linkedRef.current?.checked && aspectRatio) {
      heightRef.current!.value = String(
        Math.round(Number(widthRef.current!.value) / aspectRatio),
      );
    }
  }, [widthRef.current?.value, aspectRatio]);

  useEffect(() => {
    if (linkedRef.current?.checked && aspectRatio) {
      widthRef.current!.value = String(
        Math.round(Number(heightRef.current!.value) * aspectRatio),
      );
    }
  }, [heightRef.current?.value, aspectRatio]);

  const handleApply = () => {
    setCanvasSize({
      width: Number(widthRef.current!.value),
      height: Number(heightRef.current!.value),
    });
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Aspect Ratio:
        </label>
        <select
          value={aspectRatio || ""}
          onChange={(e) => setAspectRatio(parseFloat(e.target.value) || null)}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Free</option>
          <option value={16 / 9}>16:9</option>
          <option value={4 / 3}>4:3</option>
          <option value={1}>1:1</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Width:
        </label>
        <input
          ref={widthRef}
          type="number"
          defaultValue={canvasSize.width}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Height:
        </label>
        <input
          ref={heightRef}
          type="number"
          defaultValue={canvasSize.height}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div className="mb-4 flex items-center">
        <input
          ref={linkedRef}
          type="checkbox"
          defaultChecked={true}
          className="mr-2"
        />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Maintain Aspect Ratio
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Presets:
        </label>
        <select
          onChange={(e) => {
            const [presetWidth, presetHeight] = e.target.value
              .split("x")
              .map(Number);
            widthRef.current!.value = String(presetWidth);
            heightRef.current!.value = String(presetHeight);
          }}
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
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
