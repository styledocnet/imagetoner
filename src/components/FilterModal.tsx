import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import WebGLFilterRenderer from "./WebGLFilterRenderer";

const shaderFilterParams = {
  shader_vignette: { strength: 0.5, sizeFactor: 1, color: "#FFFFFF" },
  shader_posterize: { levels: 4, fade: 0.5 },
  shader_solarize: { threshold: 0.5, fade: 0.5 },
  shader_mirror: { flipX: false, flipY: false, fade: 0.5 }, // Extended with flipX, flipY, and fade
  shader_blur: { radius: 0.01, fade: 0.5 },
  shader_tilt_blur: { radius: 0.01, fade: 0.5 },
  shader_dof: { focusDepth: 0.5, threshold: 0.1, blurRadius: 0.02 }, // Adding focusDepth, threshold, and blurRadius
  shader_grayscale: { intensity: 0.5 }, // Added intensity parameter
  shader_tritone: {
    shadowColor: "#000000",
    midColor: "#888888",
    highColor: "#FFFFFF",
    fade: 0.5,
  },
  shader_quadtone: {
    shadowColor: "#000000",
    midShadowColor: "#444444",
    midHighlightColor: "#888888",
    highColor: "#FFFFFF",
    fade: 0.5,
  },
  shader_triangulate: {
    points: 300,
    variation: 0.3,
    cutoff: 5,
  },
  shader_polygonate: {
    points: 300,
    mutations: 2,
    variation: 0.3,
    population: 400,
    cutoff: 5,
    block: 5,
  },
  shader_hexanate: {
    points: 300,
    mutations: 2,
    variation: 0.3,
    population: 400,
    cutoff: 5,
    block: 5,
  },
  // TODO Add more shader filters here
};

const canvasFilterParams = {
  quantize: { colors: 128, fade: 0.5 },
  rotate: { degrees: 45, fade: 0.5 },
  autocontrast: { cutoff: 0, fade: 0.5 },
  equalize: { fade: 0.5 },
  flip: { fade: 0.5 },
  brightness: { factor: 50, fade: 0.5 },
  color: { factor: 50, fade: 0.5 },
  contrast: { factor: 50, fade: 0.5 },
  sharpness: { factor: 50, fade: 0.5 },
  gaussian_blur: { radius: 2, fade: 0.5 },
  unsharp_mask: { radius: 2, percent: 150, threshold: 3, fade: 0.5 },
  // TODO Add more canvas filters here
};

const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  applyFilter: (filter: string, params: any, option: string) => void;
  imageSrc: string;
}> = ({ isOpen, onClose, applyFilter, imageSrc }) => {
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<any>(shaderFilterParams[filter] || {});
  const [presets, setPresets] = useState<{ filter: string; params: any }[]>([]);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    setParams(shaderFilterParams[filter] || canvasFilterParams[filter] || {});
  }, [filter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setParams({ ...params, [name]: type === "checkbox" ? checked : value });
  };

  const handleApply = (option: string) => {
    // Parse numeric values to floats before passing to applyFilter
    const parsedParams = { ...params };
    Object.keys(parsedParams).forEach((key) => {
      if (!isNaN(parsedParams[key])) {
        parsedParams[key] = parseFloat(parsedParams[key]);
      }
    });
    applyFilter(filter, parsedParams, option);
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
        <optgroup label="Shader Filters">
          <option value="shader_vignette">Shader Vignette</option>
          <option value="shader_posterize">Shader Posterize</option>
          <option value="shader_solarize">Shader Solarize</option>
          <option value="shader_mirror">Shader Mirror</option>
          <option value="shader_blur">Shader Blur</option>
          <option value="shader_tilt_blur">Shader Tilt Blur</option>
          <option value="shader_dof">Shader Depth of Field</option>
          <option value="shader_grayscale">Shader Grayscale</option>
          <option value="shader_tritone">Shader Tritone</option>
          <option value="shader_quadtone">Shader Quadtone</option>
          <option value="shader_triangulate">Shader Triangulate</option>
          {/* <option value="shader_polygonate">Shader Polygonate</option> */}
          {/* <option value="shader_hexanate">Shader Hexanate</option> */}
        </optgroup>
        <optgroup label="Canvas Filters">
          <option value="quantize">Quantize</option>
          <option value="rotate">Rotate</option>
          <option value="autocontrast">Autocontrast</option>
          <option value="equalize">Equalize</option>
          <option value="flip">Flip</option>
          <option value="brightness">Brightness</option>
          <option value="color">Color</option>
          <option value="contrast">Contrast</option>
          <option value="sharpness">Sharpness</option>
          <option value="gaussian_blur">Gaussian Blur</option>
          <option value="unsharp_mask">Unsharp Mask</option>
        </optgroup>
      </select>

      {filter in shaderFilterParams && (
        <div className="text-gray-800 dark:text-gray-200">
          {Object.keys(shaderFilterParams[filter]).map((param) => (
            <div key={param}>
              <label className="block font-semibold">
                {param.charAt(0).toUpperCase() + param.slice(1)}:
              </label>
              {typeof shaderFilterParams[filter][param] === "boolean" ? (
                <input
                  type="checkbox"
                  name={param}
                  checked={params[param]}
                  onChange={handleParamChange}
                />
              ) : (
                <input
                  type={
                    typeof shaderFilterParams[filter][param] === "number"
                      ? "range"
                      : "color"
                  }
                  name={param}
                  min={param === "radius" || param === "focus" ? "0" : "0"}
                  max={
                    param === "radius" || param === "focus"
                      ? "0.1"
                      : param === "levels"
                        ? "32"
                        : param === "colors"
                          ? "256"
                          : "1"
                  }
                  step={
                    param === "radius" || param === "focus" ? "0.001" : "0.1"
                  }
                  value={
                    params[param] !== undefined
                      ? params[param]
                      : shaderFilterParams[filter][param]
                  }
                  className="w-full"
                  onChange={handleParamChange}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {filter in canvasFilterParams && (
        <div className="text-gray-800 dark:text-gray-200">
          {Object.keys(canvasFilterParams[filter]).map((param) => (
            <div key={param}>
              <label className="block font-semibold">
                {param.charAt(0).toUpperCase() + param.slice(1)}:
              </label>
              <input
                type={
                  typeof canvasFilterParams[filter][param] === "number"
                    ? "range"
                    : "color"
                }
                name={param}
                min={param === "radius" ? "0" : "0"}
                max={
                  param === "radius"
                    ? "0.1"
                    : param === "levels"
                      ? "32"
                      : param === "colors"
                        ? "256"
                        : "1"
                }
                step={param === "radius" ? "0.001" : "0.1"}
                value={
                  params[param] !== undefined
                    ? params[param]
                    : canvasFilterParams[filter][param]
                }
                className="w-full"
                onChange={handleParamChange}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Preset Name:</label>
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Real-Time Preview</h2>
        <WebGLFilterRenderer
          image={imageSrc}
          filter={filter}
          params={params}
          onUpdate={() => {}}
          width={300}
          height={300}
        />
      </div>
    </Modal>
  );
};

export default FilterModal;
