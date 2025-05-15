import React, { useRef, useEffect, useState } from "react";
import { LockOpenIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";

interface AspectRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: number | null;
  setAspectRatio: (aspectRatio: number | null) => void;
  documentSize: { width: number; height: number };
  setDocumentSize: (size: { width: number; height: number }) => void;
}

const AspectRatioModal: React.FC<AspectRatioModalProps> = ({ isOpen, onClose, aspectRatio, setAspectRatio, documentSize, setDocumentSize }) => {
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const [isLinked, setIsLinked] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("");

  const aspectRatios: { [key: string]: number | null } = {
    Free: null,
    "16:9": 16 / 9,
    "4:3": 4 / 3,
    "1:1": 1,
  };

  const resolutions: { [key: string]: string[] } = {
    "16:9": ["1920x1080", "1280x720", "640x360"],
    "4:3": ["1600x1200", "1024x768", "800x600"],
    "1:1": ["1080x1080", "1400x1400", "2048x2048"],
    Free: [],
  };

  const presets: { [key: string]: string } = {
    Story: "1080x1920",
    Tweet: "1024x512",
    Cover: "1400x1400",
    Card: "1080x1080",
    A4: "2480x3508",
    A5: "1748x2480",
    FullHD: "1920x1080",
    UltraHD: "3840x2160",
    Custom: "",
  };

  useEffect(() => {
    if (isLinked && aspectRatio && widthRef.current) {
      heightRef.current!.value = String(Math.round(Number(widthRef.current!.value) / aspectRatio));
    }
  }, [widthRef.current?.value, aspectRatio]);

  useEffect(() => {
    if (isLinked && aspectRatio && heightRef.current) {
      widthRef.current!.value = String(Math.round(Number(heightRef.current!.value) * aspectRatio));
    }
  }, [heightRef.current?.value, aspectRatio]);

  const handleApply = () => {
    setDocumentSize({
      width: Number(widthRef.current!.value),
      height: Number(heightRef.current!.value),
    });
    onClose();
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAspectRatio(aspectRatios[value]);
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [presetWidth, presetHeight] = e.target.value.split("x").map(Number);
    widthRef.current!.value = String(presetWidth);
    heightRef.current!.value = String(presetHeight);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPreset(value);
    if (value === "Custom") {
      widthRef.current!.value = "";
      heightRef.current!.value = "";
    } else {
      const [presetWidth, presetHeight] = presets[value].split("x").map(Number);
      widthRef.current!.value = String(presetWidth);
      heightRef.current!.value = String(presetHeight);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Set Document Size"
      onClose={onClose}
      footer={
        <button onClick={handleApply} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
          Apply
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aspect Ratio:</label>
          <select
            value={aspectRatio || "Free"}
            onChange={handleAspectRatioChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
          >
            {Object.keys(aspectRatios).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resolution:</label>
          <select onChange={handleResolutionChange} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100">
            {resolutions[aspectRatio ? Object.keys(aspectRatios).find((key) => aspectRatios[key] === aspectRatio) || "Free" : "Free"].map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Presets:</label>
          <select
            value={selectedPreset}
            onChange={handlePresetChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
          >
            {Object.keys(presets).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4 flex items-center">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Width:</label>
          <input
            ref={widthRef}
            type="number"
            defaultValue={documentSize.width}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <span className="mx-2">x</span>
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height:</label>
          <input
            ref={heightRef}
            type="number"
            defaultValue={documentSize.height}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <button onClick={() => setIsLinked(!isLinked)} className="ml-2">
          {isLinked ? <LockClosedIcon className="w-6 h-6" /> : <LockOpenIcon className="w-6 h-6" />}
        </button>
      </div>
    </Modal>
  );
};

export default AspectRatioModal;
