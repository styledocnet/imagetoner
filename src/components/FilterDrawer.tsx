import React, { useEffect, useRef, useState } from "react";
import ColorSwatch from "./ColorSwatch";
import { BrandStyle } from "../types";
import WebGLFilterRenderer from "./WebGLFilterRenderer";
import { applyFilterToCanvas } from "../utils/filterUtils";
import { canvasFilterParams, shaderFilterParams } from "../utils/filterParams";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filteredImage: string, mode: "applyCurrent" | "createNew") => void;
  imageSrc: string;
  documentSize: { width: number; height: number };
  mainCanvasRef: React.RefObject<HTMLCanvasElement>;
  brandStyle?: BrandStyle | null;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, onApply, imageSrc, documentSize, mainCanvasRef, brandStyle }) => {
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<any>(shaderFilterParams[filter]);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const previewShaderCanvasRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const themeColors = brandStyle?.colors ?? [];

  // Ensure params are reset on filter change
  useEffect(() => {
    if (shaderFilterParams[filter]) {
      setParams({ ...shaderFilterParams[filter] });
    } else if (canvasFilterParams[filter]) {
      setParams({ ...canvasFilterParams[filter] });
    }
  }, [filter]);

  // Always update preview when settings change
  useEffect(() => {
    if (isOpen) renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, params, imageSrc, isOpen]);

  const renderPreview = () => {
    if (filter.startsWith("shader_")) {
      // WebGLFilterRenderer handles preview
    } else {
      const previewCanvas = canvasRef.current;
      if (!previewCanvas || !imageSrc) return;
      const previewCtx = previewCanvas.getContext("2d");
      if (!previewCtx) return;
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
        applyFilterToCanvas(filter, previewCtx, previewCanvas, params);
        const filtered = previewCanvas.toDataURL("image/png");
        setFilteredImage(filtered);
      };
    }
  };

  const handleApply = async (mode: "applyCurrent" | "createNew") => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;

    if (filter.startsWith("shader_")) {
      try {
        const canvas = previewShaderCanvasRef.current?.getCanvas?.();
        if (!canvas) return;
        const imageDataUrl = await canvas.toDataURL("image/png");
        onApply(imageDataUrl, mode);
        onClose();
        return;
      } catch (error) {
        // handle error
      }
    } else {
      const mainCtx = mainCanvas.getContext("2d");
      if (!mainCtx) return;
      const img = new Image();
      img.src = filteredImage || imageSrc;
      img.onload = () => {
        mainCanvas.width = img.width;
        mainCanvas.height = img.height;
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
        requestAnimationFrame(() => {
          const appliedImage = mainCanvas.toDataURL("image/png");
          onApply(appliedImage, mode);
          onClose();
        });
      };
    }
  };

  const handleParamChange = (paramName: string, value: any) => {
    setParams((prevParams: any) => ({
      ...prevParams,
      [paramName]: value,
    }));
  };

  const renderColorInput = (paramName: string, param: any) => {
    // Only compare swatch with string value
    // The value could be in params[paramName], or fall back to param.default or param.value
    let val: string = "";
    if (typeof params[paramName] === "string") {
      val = params[paramName];
    } else if (typeof param.value === "string") {
      val = param.value;
    } else if (typeof param.default === "string") {
      val = param.default;
    }
    return (
      <div className="flex items-center gap-2">
        {themeColors.map((c) => (
          <ColorSwatch
            key={c.hex}
            color={c.hex}
            label={c.name || c.role || ""}
            selected={val.toLowerCase() === c.hex.toLowerCase()}
            onClick={() => handleParamChange(paramName, c.hex)}
          />
        ))}
        <input
          type="color"
          name={paramName}
          value={val}
          onChange={(e) => handleParamChange(paramName, e.target.value)}
          className="w-8 h-8 rounded border ml-2"
        />
      </div>
    );
  };

  const renderInput = (paramName: string, param: any) => {
    switch (param.type) {
      case "number":
        return (
          <input
            type="range"
            name={paramName}
            min={param.min}
            max={param.max}
            step={param.step}
            value={params[paramName]}
            onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
            className="w-full"
          />
        );
      case "boolean":
        return <input type="checkbox" name={paramName} checked={params[paramName]} onChange={(e) => handleParamChange(paramName, e.target.checked)} />;
      case "color":
        return renderColorInput(paramName, param);
      default:
        return null;
    }
  };

  const currentParams = shaderFilterParams[filter] || canvasFilterParams[filter] || {};

  return (
    <div
      className={`fixed bottom-0 left-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 transition-transform ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ width: "33%", minWidth: "300px", minHeight: "300px" }}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-lg">Filter Settings</h3>
        <button onClick={onClose}>
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4">
        <label className="block mb-2 font-semibold">Select Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white">
          <optgroup label="Shader Filters">
            {Object.keys(shaderFilterParams).map((key) => (
              <option key={key} value={key}>
                {key.replace("shader_", "").toUpperCase()}
              </option>
            ))}
          </optgroup>
          <optgroup label="Canvas Filters">
            {Object.keys(canvasFilterParams).map((key) => (
              <option key={key} value={key}>
                {key.toUpperCase()}
              </option>
            ))}
          </optgroup>
        </select>
        {Object.entries(currentParams).map(([paramName, param]) => (
          <div key={paramName} className="mb-3">
            <label className="block font-medium text-sm mb-1 capitalize text-gray-500">{param.desc}</label>
            {renderInput(paramName, param)}
          </div>
        ))}
      </div>
      {isOpen && (
        <div className="mt-4">
          <div
            style={{
              width: "100%",
              height: "150px",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            {filter.startsWith("shader_") ? (
              <WebGLFilterRenderer
                ref={previewShaderCanvasRef}
                image={imageSrc}
                filter={filter}
                params={params}
                width={documentSize.width}
                height={documentSize.height}
                onRenderComplete={setFilteredImage}
              />
            ) : (
              <canvas
                ref={canvasRef}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "200px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            )}
          </div>
        </div>
      )}
      <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
        <button onClick={() => handleApply("applyCurrent")} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Apply to Layer
        </button>
        <button onClick={() => handleApply("createNew")} className="bg-green-500 text-white px-4 py-2 rounded-md">
          Create New Layer
        </button>
      </div>
    </div>
  );
};

export default FilterDrawer;
