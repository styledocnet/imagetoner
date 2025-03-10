import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  applyFilter: (filter: string, params: any, option: string) => void;
}> = ({ isOpen, onClose, applyFilter }) => {
  const [filter, setFilter] = useState("vignette");
  const [params, setParams] = useState({
    strength: 0.5,
    sizeFactor: 1.5,
    color: "#000000",
    color1: "#FF1133",
    color2: "#770099",
    color3: "#FFFFFF",
    color4: "#FFFFFF",
  });
  const [presets, setPresets] = useState<{ filter: string; params: any }[]>([]);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    switch (filter) {
      case "vignette":
        setParams({ strength: 0.5, sizeFactor: 1.5, color: "#000000" });
        break;
      case "mono":
        setParams({ color1: "#FF1133" });
        break;
      case "duotone":
        setParams({ color1: "#FF1133", color2: "#770099" });
        break;
      case "tritone":
        setParams({ color1: "#FF1133", color2: "#770099", color3: "#FFFFFF" });
        break;
      case "quadtone":
        setParams({
          color1: "#FF1133",
          color2: "#770099",
          color3: "#FFFFFF",
          color4: "#000000",
        });
        break;
      default:
        break;
    }
  }, [filter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleApply = (option: string) => {
    applyFilter(filter, params, option);
    onClose();
  };

  const handleSavePreset = () => {
    setPresets([...presets, { filter, params }]);
    setPresetName("");
  };

  const handleLoadPreset = (preset: { filter: string; params: any }) => {
    setFilter(preset.filter);
    setParams(preset.params);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Apply Filter"
      onClose={onClose}
      footer={
        <div className="flex space-x-2">
          <button
            onClick={() => handleApply("applyCurrent")}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Apply to Current Layer
          </button>
          <button
            onClick={() => handleApply("createNew")}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Create New Layer
          </button>
          <button
            onClick={() => handleApply("mergeAndCreateNew")}
            className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700"
          >
            Merge and Create New Layer
          </button>
        </div>
      }
    >
      <label className="block mb-2 font-semibold">Select Filter:</label>
      <select
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={filter}
        onChange={handleFilterChange}
      >
        <option value="vignette">Vignette</option>
        <option value="duotone">Duotone</option>
        <option value="mono">Monotone</option>
        <option value="tritone">Tritone</option>
        <option value="quadtone">Quadtone</option>
      </select>

      {filter === "vignette" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Strength (0 - 1):</label>
          <input
            type="range"
            name="strength"
            min="0"
            max="1"
            step="0.1"
            value={params.strength}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Size Factor (1 - 2):</label>
          <input
            type="range"
            name="sizeFactor"
            min="1"
            max="2"
            step="0.1"
            value={params.sizeFactor}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color:</label>
          <input
            type="color"
            name="color"
            value={params.color}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "mono" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "duotone" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 2:</label>
          <input
            type="color"
            name="color2"
            value={params.color2}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "tritone" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1:</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 2:</label>
          <input
            type="color"
            name="color2"
            value={params.color2}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 3:</label>
          <input
            type="color"
            name="color3"
            value={params.color3}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      {filter === "quadtone" && (
        <div className="text-gray-800 dark:text-gray-200">
          <label className="block font-semibold">Color 1 (darkest):</label>
          <input
            type="color"
            name="color1"
            value={params.color1}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 2 (shadow):</label>
          <input
            type="color"
            name="color2"
            value={params.color2}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 3 (midtone):</label>
          <input
            type="color"
            name="color3"
            value={params.color3}
            className="w-full"
            onChange={handleParamChange}
          />
          <label className="block font-semibold">Color 4 (lightest):</label>
          <input
            type="color"
            name="color4"
            value={params.color4}
            className="w-full"
            onChange={handleParamChange}
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Preset Name:</label>
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          className="w-full border p-2 rounded-md mb-4"
        />
        <button
          onClick={handleSavePreset}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Save Preset
        </button>
      </div>

      {presets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Presets</h2>
          {presets.map((preset, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>{preset.filter}</span>
              <button
                onClick={() => handleLoadPreset(preset)}
                className="text-blue-500"
              >
                Load
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default FilterModal;
