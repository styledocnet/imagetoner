import React, { useRef, useEffect, useState } from "react";
import { LockOpenIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";
import SelectBox from "./SelectBox";

interface AspectRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: number | null;
  setAspectRatio: (aspectRatio: number | null) => void;
  documentSize: { width: number; height: number };
  setDocumentSize: (size: { width: number; height: number }) => void;
}

const aspectRatios: { key: string; label: string; value: number | null }[] = [
  { key: "Free", label: "Free", value: null },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "1:1", label: "1:1", value: 1 },
];

const resolutions: Record<string, string[]> = {
  "16:9": ["1920x1080", "1280x720", "640x360"],
  "4:3": ["1600x1200", "1024x768", "800x600"],
  "1:1": ["1080x1080", "1400x1400", "2048x2048"],
  Free: [],
};

const presets: { key: string; label: string; value: string }[] = [
  { key: "Story", label: "Story", value: "1080x1920" },
  { key: "Tweet", label: "Tweet", value: "1024x512" },
  { key: "Cover", label: "Cover", value: "1400x1400" },
  { key: "Card", label: "Card", value: "1080x1080" },
  { key: "A4", label: "A4", value: "2480x3508" },
  { key: "A5", label: "A5", value: "1748x2480" },
  { key: "FullHD", label: "Full HD", value: "1920x1080" },
  { key: "UltraHD", label: "Ultra HD", value: "3840x2160" },
  { key: "Custom", label: "Custom", value: "" },
];

const AspectRatioModal: React.FC<AspectRatioModalProps> = ({ isOpen, onClose, aspectRatio, setAspectRatio, documentSize, setDocumentSize }) => {
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const [isLinked, setIsLinked] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState("Custom");
  const [selectedAspect, setSelectedAspect] = useState(aspectRatios.find((a) => a.value === aspectRatio)?.key || "Free");
  const [resolution, setResolution] = useState<string>("");

  // Sync aspect ratio select
  useEffect(() => {
    setSelectedAspect(aspectRatios.find((a) => a.value === aspectRatio)?.key || "Free");
  }, [aspectRatio]);

  // Keep fields in sync with aspect ratio
  useEffect(() => {
    if (isLinked && aspectRatio && widthRef.current && documentSize.width > 0) {
      heightRef.current!.value = String(Math.round(Number(widthRef.current!.value) / aspectRatio));
    }
    // eslint-disable-next-line
  }, [aspectRatio, isLinked]);

  // Keep width/height in sync when one changes
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLinked && aspectRatio && heightRef.current) {
      heightRef.current.value = String(Math.round(Number(e.target.value) / aspectRatio));
    }
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLinked && aspectRatio && widthRef.current) {
      widthRef.current.value = String(Math.round(Number(e.target.value) * aspectRatio));
    }
  };

  // Aspect Ratio select
  const handleAspectRatioChange = (val: string) => {
    setSelectedAspect(val);
    const ratioObj = aspectRatios.find((a) => a.key === val);
    setAspectRatio(ratioObj ? ratioObj.value : null);
    // Optionally reset resolution and preset
    setResolution("");
    setSelectedPreset("Custom");
  };

  // Resolution select
  const handleResolutionChange = (val: string) => {
    setResolution(val);
    if (!val) return;
    const [presetWidth, presetHeight] = val.split("x").map(Number);
    if (widthRef.current && heightRef.current) {
      widthRef.current.value = String(presetWidth);
      heightRef.current.value = String(presetHeight);
    }
    setSelectedPreset("Custom");
  };

  // Preset select
  const handlePresetChange = (val: string) => {
    setSelectedPreset(val);
    const preset = presets.find((p) => p.key === val);
    if (preset && preset.value) {
      const [presetWidth, presetHeight] = preset.value.split("x").map(Number);
      if (widthRef.current && heightRef.current) {
        widthRef.current.value = String(presetWidth);
        heightRef.current.value = String(presetHeight);
      }
    } else if (val === "Custom") {
      if (widthRef.current && heightRef.current) {
        widthRef.current.value = "";
        heightRef.current.value = "";
      }
    }
  };

  const handleApply = () => {
    setDocumentSize({
      width: Number(widthRef.current!.value),
      height: Number(heightRef.current!.value),
    });
    onClose();
  };

  const currentAspectKey = aspectRatios.find((a) => a.value === aspectRatio)?.key || "Free";
  const currentResolutions = resolutions[currentAspectKey] || [];

  return (
    <Modal
      isOpen={isOpen}
      title="Set Document Size"
      onClose={onClose}
      footer={
        <button onClick={handleApply} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-semibold">
          Apply
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Aspect Ratio</label>
          <SelectBox options={aspectRatios.map((a) => ({ label: a.label, value: a.key }))} value={selectedAspect} onChange={handleAspectRatioChange} small />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Resolution</label>
          <SelectBox
            options={
              currentResolutions.length
                ? currentResolutions.map((preset) => ({
                    label: preset,
                    value: preset,
                  }))
                : [{ label: "—", value: "" }]
            }
            value={resolution}
            onChange={handleResolutionChange}
            small
            placeholder="Select resolution"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Presets</label>
          <SelectBox options={presets.map((p) => ({ label: p.label, value: p.key }))} value={selectedPreset} onChange={handlePresetChange} small />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-grow">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Width</label>
          <input
            ref={widthRef}
            type="number"
            defaultValue={documentSize.width}
            min={1}
            onChange={handleWidthChange}
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
            placeholder="Width"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsLinked(!isLinked)}
          className="self-end mb-2 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition group"
          title={isLinked ? "Unlink width and height" : "Link width and height"}
        >
          {isLinked ? (
            <LockClosedIcon className="w-6 h-6 text-sky-600 group-hover:text-sky-700" />
          ) : (
            <LockOpenIcon className="w-6 h-6 text-sky-600 group-hover:text-sky-700" />
          )}
        </button>
        <div className="flex-grow">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Height</label>
          <input
            ref={heightRef}
            type="number"
            defaultValue={documentSize.height}
            min={1}
            onChange={handleHeightChange}
            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
            placeholder="Height"
          />
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        Tip: Link <LockClosedIcon className="inline w-4 h-4 -mt-1" /> keeps the aspect ratio when you change width or height.
      </div>
    </Modal>
  );
};

export default AspectRatioModal;
