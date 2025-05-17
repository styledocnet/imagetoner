import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { useLayerContext } from "../context/LayerContext";

const shaderFilterParams = {
  shader_vignette: { strength: 0.5, sizeFactor: 1, color: "#FFFFFF" },
  shader_posterize: { levels: 4, fade: 0.5 },
  shader_solarize: { threshold: 0.5, fade: 0.5 },
  shader_mirror: { flipX: false, flipY: false, fade: 0.5 },
  shader_blur: { radius: 0.01, fade: 0.5 },
  shader_tilt_blur: { radius: 0.01, fade: 0.5 },
  shader_dof: { focusDepth: 0.5, threshold: 0.1, blurRadius: 0.02 },
  shader_grayscale: { intensity: 0.5 },
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
    points: 300, // Base number of points (density of triangles)
    variation: 0.3, // Randomization of triangle placement
    cutoff: 5, // Color matching precision
    edgeThreshold: 0.5, // Sensitivity to edges
    blendAmount: 0.5, // Mixing original and stylized color
    triangleSizeScaling: 1.0, // Scale factor for triangle sizes
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
};

const canvasFilterParams = {
  quantize: { colors: 128, fade: 0.5 },
  rotate: { degrees: 45, fade: 0.5 },
  autocontrast: { cutoff: 0, fade: 0.5 },
  equalize: { fade: 0.5 },
  brightness: { factor: 50, fade: 0.5 },
  contrast: { factor: 50, fade: 0.5 },
  sharpness: { factor: 50, fade: 0.5 },
  gaussian_blur: { radius: 2, fade: 0.5 },
  unsharp_mask: { radius: 2, percent: 150, threshold: 3, fade: 0.5 },
};

const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  applyFilter: (filter: string, params: any, option: string, isPreview?: boolean) => void;
  imageSrc: string;
}> = ({ isOpen, onClose, applyFilter, imageSrc }) => {
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<any>(shaderFilterParams[filter] || {});
  const [presets, setPresets] = useState<{ filter: string; params: any }[]>([]);
  const [presetName, setPresetName] = useState("");
  const { restoreOriginalLayer, currentLayer } = useLayerContext();

  // Update parameters when filter changes
  useEffect(() => {
    setParams(shaderFilterParams[filter] || canvasFilterParams[filter] || {});
  }, [filter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleSavePreset = () => {
    setPresets([...presets, { filter, params }]);
    setPresetName("");
  };

  const handleLoadPreset = (preset: { filter: string; params: any }) => {
    setFilter(preset.filter);
    setParams(preset.params);
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const updatedParams = { ...params, [name]: type === "checkbox" ? checked : value };
    setParams(updatedParams);

    // Trigger real-time preview
    applyFilter(filter, updatedParams, "applyPreview", true);
  };

  const handleApply = (option: string) => {
    // Parse numeric values for final application
    const parsedParams = { ...params };
    Object.keys(parsedParams).forEach((key) => {
      if (!isNaN(parsedParams[key])) {
        parsedParams[key] = parseFloat(parsedParams[key]);
      }
    });

    // Apply the filter to the current layer or create a new layer
    applyFilter(filter, parsedParams, option);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Apply Filter"
      onClose={() => {
        restoreOriginalLayer();
        onClose();
      }}
      footer={
        <div className="flex space-x-2">
          <button onClick={() => handleApply("applyCurrent")} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Apply to Current Layer
          </button>
          <button onClick={() => handleApply("createNew")} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700">
            Create New Layer
          </button>
          <button onClick={() => handleApply("mergeAndCreateNew")} className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700">
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
          {Object.keys(shaderFilterParams).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, " ").replace(/^shader /, "")}
            </option>
          ))}
        </optgroup>
        <optgroup label="Canvas Filters">
          {Object.keys(canvasFilterParams).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, " ")}
            </option>
          ))}
        </optgroup>
      </select>

      <div className="mt-4">
        {Object.keys(params).map((param) => (
          <div key={param} className="mb-2">
            <label className="block font-semibold">{param.charAt(0).toUpperCase() + param.slice(1)}:</label>
            <input
              type={(typeof params[param] === "boolean" && "checkbox") || (param === "color" && "color") || "range"}
              name={param}
              value={params[param]}
              onChange={handleParamChange}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Presets</h2>
        {presets.map((preset, index) => (
          <div key={index} className="flex justify-between items-center mb-2">
            <span>{preset.filter}</span>
            <button onClick={() => handleLoadPreset(preset)} className="text-blue-500">
              Load
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default FilterModal;
