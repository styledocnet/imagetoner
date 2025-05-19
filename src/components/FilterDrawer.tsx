import React, { useEffect, useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLayerContext } from "../context/LayerContext";
import WebGLFilterRenderer from "./WebGLFilterRenderer";
import { applyFilterToCanvas } from "../utils/filterUtils";

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
  onApply: (filteredImage: string, mode: "applyCurrent" | "createNew") => void;
  imageSrc: string;
  documentSize: { width: number; height: number };
  mainCanvasRef: React.RefObject<HTMLCanvasElement>;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, onApply, imageSrc, documentSize, mainCanvasRef }) => {
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<any>(shaderFilterParams[filter]);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);

  const { updateLayerProp, restoreOriginalLayer, currentLayer } = useLayerContext();

  // Ref for the 2D canvas (used for non-shader filters)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update filter parameters when the filter changes
  useEffect(() => {
    if (shaderFilterParams[filter]) {
      setParams({ ...shaderFilterParams[filter] }); // Reset to default shader params
    } else if (canvasFilterParams[filter]) {
      setParams({ ...canvasFilterParams[filter] }); // Reset to default canvas params
    }
  }, [filter]);

  // Render the preview
  const renderPreview = () => {
    if (filter.startsWith("shader_")) {
      // Shader filters are handled by WebGLFilterRenderer, so no need to render here
      return;
    }

    if (!canvasRef.current || !imageSrc) return;

    const previewCanvas = canvasRef.current;
    const previewCtx = previewCanvas.getContext("2d");

    if (!previewCtx) {
      console.error("Preview canvas 2D context not found.");
      return;
    }

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      previewCanvas.width = img.width;
      previewCanvas.height = img.height;

      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

      // Apply the Canvas 2D filter
      applyFilterToCanvas(filter, previewCtx, previewCanvas, params);

      // Capture the filtered output as a data URL
      const filtered = previewCanvas.toDataURL("image/png");
      setFilteredImage(filtered);
    };
  };

  // Apply the filter to the main canvas and save the result
  const handleApply = (mode: "applyCurrent" | "createNew") => {
    if (!filteredImage || currentLayer === null) return;

    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) {
      console.error("Main canvas not found.");
      return;
    }

    const mainCtx = mainCanvas.getContext("2d");
    if (!mainCtx) {
      console.error("Main Canvas 2D context not found.");
      return;
    }

    // Render the filtered image to the main canvas
    const img = new Image();
    img.src = filteredImage;

    img.onload = () => {
      mainCanvas.width = img.width;
      mainCanvas.height = img.height;

      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);

      // Update the layer with the filtered image
      if (mode === "applyCurrent") {
        updateLayerProp(currentLayer, "image", filteredImage);
      } else if (mode === "createNew") {
        updateLayerProp({
          name: `${filter} Layer`,
          index: layers.length,
          image: filteredImage,
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          type: "image",
          visible: true,
        });
      }

      onApply(filteredImage, mode);
      onClose();
    };
  };

  useEffect(() => {
    if (isOpen) {
      renderPreview(); // Render preview when the drawer is open
    }
  }, [filter, params, imageSrc, isOpen]);

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value;
    setParams({ ...params, [name]: newValue });
  };

  return (
    <div
      className={`fixed bottom-0 left-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 transition-transform ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ width: "33%", minWidth: "300px", minHeight: "300px" }}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-lg">Filter Settings</h3>
        <button
          onClick={() => {
            restoreOriginalLayer(); // Restore the layer on cancel
            onClose();
          }}
        >
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
        {Object.keys(params).map((param) => (
          <div key={param} className="mb-3">
            <label className="block font-medium text-sm mb-1 capitalize text-gray-500">{param}</label>
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
            {" "}
            {/* Scaled Preview */}
            {filter.startsWith("shader_") ? (
              <WebGLFilterRenderer
                image={imageSrc}
                filter={filter}
                params={params}
                width={documentSize.width}
                height={documentSize.height}
                onRenderComplete={(filteredImage) => setFilteredImage(filteredImage)}
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
      </div>
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
