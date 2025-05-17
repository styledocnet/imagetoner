import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLayerContext } from "../context/LayerContext";

const shaderFilterParams = {
  shader_vignette: { strength: 0.5, sizeFactor: 1, color: "#FFFFFF" },
  shader_triangulate: {
    points: 300,
    variation: 0.3,
    cutoff: 5,
    edgeThreshold: 0.5,
    blendAmount: 0.5,
    triangleSizeScaling: 1.0,
  },
};

const canvasFilterParams = {
  quantize: { colors: 128, fade: 0.5 },
  rotate: { degrees: 45, fade: 0.5 },
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
    const paramSet = shaderFilterParams[filter] || canvasFilterParams[filter] || {};
    setParams(paramSet);

    if (imageSrc) {
      applyFilter(filter, paramSet, "applyPreview", true);
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
      newVal = value;
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
      className={`fixed bottom-0 left-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 transition-transform duration-300 shadow-lg ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        width: "33%", // One-third of the screen
        minWidth: "300px", // Ensure a minimum width for smaller screens
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
              type={typeof params[param] === "boolean" ? "checkbox" : typeof params[param] === "number" ? "range" : param.includes("color") ? "color" : "text"}
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
