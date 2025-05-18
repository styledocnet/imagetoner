import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
    points: 300,
    // desc_points: "Base number of points (density of triangles)",
    variation: 0.3,
    // desc_variation: "Randomization of triangle placement",
    cutoff: 5,
    // desc_cutoff: "Color matching precision",
    edgeThreshold: 0.5, // Sensitivity to edges
    // desc_edgeThreshold: "Sensitivity to edges",
    blendAmount: 0.5,
    // desc_blendAmount: "Mixing original and stylized color",
    triangleSizeScaling: 1.0,
    // desc_triangleSizeScaling: "Scale factor for triangle sizes",
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
  vignette: { colors: 128, fade: 0.5 },
  mono: { colors: 128, fade: 0.5 },
  duotone: { color1: "#ffeeaa", color2: "aaeeff" },
  tritone: { color1: "#ffeeaa", color2: "aaeeff", color3: "aaffee" },
  quadtone: { color1: "#ffeeaa", color2: "aaee00", color3: "aaffee", color4: "ff22ee" },
  grayscale: { fade: 0.5 },
  sepia: { fade: 0.5 },
  blur: { fade: 0.5 },
  // todo unimplement
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

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applyFilter: (filter: string, params: any, option: string, isPreview?: boolean) => void;
  imageSrc: string;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, applyFilter, imageSrc }) => {
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<any>(shaderFilterParams[filter]);
  const { restoreOriginalLayer } = useLayerContext();

  useEffect(() => {
    if (isOpen) {
      const paramSet = shaderFilterParams[filter] || canvasFilterParams[filter] || {};
      setParams(paramSet);

      if (imageSrc) {
        applyFilter(filter, paramSet, "applyPreview", true);
      }
    }
  }, [filter, imageSrc]);

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let newVal;
    if (type === "checkbox") {
      newVal = checked;
    } else if (type === "number" || type === "range") {
      newVal = parseFloat(value);
    } else if (type === "color") {
      // Validate color input
      newVal = /^#[0-9A-F]{6}$/i.test(value) ? value : "#000000"; // Default to black if invalid
    } else {
      newVal = value;
    }

    const updatedParams = { ...params, [name]: newVal };
    setParams(updatedParams);
    applyFilter(filter, updatedParams, "applyPreview", true);
  };

  const handleApply = (mode: string) => {
    applyFilter(filter, params, mode);
    onClose();
  };

  return (
    <div
      className={`dark:text-white fixed bottom-0 left-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 transition-transform duration-300 shadow-lg ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        width: "33%",
        minWidth: "300px",
        minHeight: "300px",
      }}
    >
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg">Filter Settings</h3>
        <button
          onClick={() => {
            restoreOriginalLayer();
            onClose();
          }}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {isOpen && (
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-320px)]">
          <label className="block mb-2 font-semibold">Select Filter:</label>
          <select className="w-full p-2 border rounded-md mb-4 dark:bg-gray-800 dark:text-white" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <optgroup label="Shader Filters">
              {Object.keys(shaderFilterParams).map((key) => (
                <option key={key} value={key}>
                  {key.replace(/_/g, " ")}
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

          {Object.keys(params).map((param) => (
            <div key={param} className="mb-3">
              <label className="block font-medium text-sm mb-1 capitalize">{param}</label>
              <input
                type={
                  typeof params[param] === "boolean" ? "checkbox" : typeof params[param] === "number" ? "range" : param.includes("color") ? "color" : "text"
                }
                name={param}
                min={typeof params[param] === "number" ? "0" : undefined}
                max={typeof params[param] === "number" ? "1" : undefined}
                step={typeof params[param] === "number" ? "0.01" : undefined}
                value={typeof params[param] === "number" || typeof params[param] === "string" ? params[param] : undefined}
                checked={typeof params[param] === "boolean" ? params[param] : undefined}
                onChange={handleParamChange}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
      <div className="p-4 flex gap-2 justify-end border-t dark:border-gray-700">
        <button onClick={() => handleApply("applyCurrent")} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Apply to Layer
        </button>
        <button onClick={() => handleApply("createNew")} className="bg-green-500 text-white px-4 py-2 rounded-md">
          New Layer
        </button>
      </div>
    </div>
  );
};

export default FilterDrawer;
