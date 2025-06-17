import React, { useEffect, useRef, useState } from "react";
import ColorSwatch from "./ColorSwatch";
import { BrandStyle } from "../types";
import WebGLFilterRenderer from "./WebGLFilterRenderer";
import { applyFilterToCanvas } from "../utils/filterUtils";
import { canvasFilterParams, shaderFilterParams } from "../utils/filterParams";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ShinSelectBox from "./shinui/ShinSelectBox";

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
  // --- State
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<any>(shaderFilterParams[filter]);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const previewShaderCanvasRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeColors = brandStyle?.colors ?? [];

  // --- Effect: Reset params on filter change
  useEffect(() => {
    if (shaderFilterParams[filter]) {
      setParams({ ...shaderFilterParams[filter] });
    } else if (canvasFilterParams[filter]) {
      setParams({ ...canvasFilterParams[filter] });
    }
  }, [filter]);

  // --- Effect: Update preview
  useEffect(() => {
    if (isOpen) renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, params, imageSrc, isOpen]);

  // --- Preview renderer
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

  // --- Apply handler
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
      } catch (error) {}
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

  // --- Parameter input renderers
  const handleParamChange = (paramName: string, value: any) => {
    setParams((prevParams: any) => ({
      ...prevParams,
      [paramName]: value,
    }));
  };

  const renderColorInput = (paramName: string, param: any) => {
    let val: string = "";
    if (typeof params[paramName] === "string") val = params[paramName];
    else if (typeof param.value === "string") val = param.value;
    else if (typeof param.default === "string") val = param.default;

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

  // --- Filters for select box
  const filterOptions = [
    {
      label: "Shader Filters",
      options: Object.keys(shaderFilterParams).map((key) => ({
        value: key,
        label: key.replace("shader_", "").replace(/_/g, " ").toUpperCase(),
      })),
    },
    {
      label: "Canvas Filters",
      options: Object.keys(canvasFilterParams).map((key) => ({
        value: key,
        label: key.replace(/_/g, " ").toUpperCase(),
      })),
    },
  ];

  const currentParams = shaderFilterParams[filter] || canvasFilterParams[filter] || {};

  // --- Responsive drawer classes
  // ShinUI glass with mobile-friendly layout
  const drawerBase = "fixed bottom-0 left-0 z-50 shadow-xl shinglass shinitem shinitem-shadowfocus transition-transform duration-300";
  const drawerDesktop = "w-[33vw] min-w-[320px] max-w-[420px] rounded-t-xl";
  const drawerMobile = "w-full rounded-t-2xl";
  const drawerOpen = "translate-y-0";
  const drawerClosed = "translate-y-full";
  const mobileHeaderHandle = "mx-auto my-2 w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full opacity-80";

  return (
    <div
      className={`${drawerBase} ${isOpen ? drawerOpen : drawerClosed} ${drawerDesktop} sm:${drawerDesktop} xs:${drawerMobile}`}
      style={{
        minHeight: isOpen ? 370 : 0,
        maxHeight: "90vh",
        right: 0,
      }}
    >
      {/* Mobile handle for context */}
      <div className={`block sm:hidden ${mobileHeaderHandle}`} />
      {/* Sticky header for desktop/mobile */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white/60 dark:bg-gray-900/80 shin-glass z-10 rounded-t-xl">
        <h3 className="font-normal text-base text-gray-900 dark:text-gray-500">Filter</h3>
        <button onClick={onClose} className="rounded shinitem p-1 hover:bg-red-100 dark:hover:bg-red-900 transition" aria-label="Close">
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
        </button>
      </div>
      {/* Main content */}
      <div className="p-4 overflow-y-auto max-h-[55vh]">
        {/* <label className="block mb-2 font-semibold text-gray-900 dark:text-white">Select Filter:</label> */}
        <ShinSelectBox
          value={filter}
          onChange={setFilter}
          options={filterOptions.flatMap((g) => [{ label: `– ${g.label} –`, value: "", disabled: true }, ...g.options])}
          placeholder="Choose Filter"
        />
        {Object.entries(currentParams).map(([paramName, param]) => (
          <div key={paramName} className="mb-3 mt-3">
            <label className="block font-medium text-sm mb-1 capitalize text-gray-500">{param.desc}</label>
            {renderInput(paramName, param)}
          </div>
        ))}
      </div>
      {/* Preview */}
      {isOpen && (
        <div className="px-4 pb-2">
          <div
            style={{
              width: "100%",
              height: "150px",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(6px)",
            }}
            className="shinitem shin-glass"
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
                  maxHeight: "140px",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>
        </div>
      )}
      {/* Action buttons */}
      <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 sticky bottom-0 bg-white/60 dark:bg-gray-900/80 shin-glass rounded-b-xl">
        <button
          onClick={() => handleApply("applyCurrent")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shinitem hover:bg-blue-600 shadow transition"
        >
          Apply to Layer
        </button>
        <button onClick={() => handleApply("createNew")} className="bg-green-500 text-white px-4 py-2 rounded-md shinitem hover:bg-green-600 shadow transition">
          Create New Layer
        </button>
      </div>
    </div>
  );
};

export default FilterDrawer;
