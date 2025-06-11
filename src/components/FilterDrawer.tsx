import React, { useEffect, useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLayerContext } from "../context/LayerContext";
import WebGLFilterRenderer from "./WebGLFilterRenderer";
import { applyFilterToCanvas } from "../utils/filterUtils";
import { applyShaderFilter } from "../utils/glUtils";
import { canvasFilterParams, shaderFilterParams } from "../utils/filterParams";

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
  const { layers, updateLayerProp, addNewLayer, restoreOriginalLayer, currentLayer } = useLayerContext();
  const previewShaderCanvasRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number }>({
    width: documentSize.width,
    height: documentSize.height,
  });

  useEffect(() => {
    if (shaderFilterParams[filter]) {
      setParams({ ...shaderFilterParams[filter] });
    } else if (canvasFilterParams[filter]) {
      setParams({ ...canvasFilterParams[filter] });
    }
  }, [filter]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      setOriginalImageSize({ width: img.width, height: img.height });
      console.log("[DEBUG] Original image loaded:", img.width, img.height, imageSrc);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Preview rendering (small, visible canvas)
  const renderPreview = () => {
    if (filter.startsWith("shader_")) {
      // Use WebGLFilterRenderer as preview
      // The renderer itself calls setFilteredImage via onRenderComplete
    } else {
      // Canvas 2D preview
      const previewCanvas = canvasRef.current;
      if (!previewCanvas || !imageSrc) return;
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
        applyFilterToCanvas(filter, previewCtx, previewCanvas, params);
        const filtered = previewCanvas.toDataURL("image/png");
        setFilteredImage(filtered);
        console.log("[DEBUG] Canvas filter preview generated.", filtered.slice(0, 64));
      };
      img.onerror = () => {
        console.error("[DEBUG] Failed to load preview image for 2D canvas filter.", imageSrc);
      };
    }
  };

  // Always update preview when settings change
  useEffect(() => {
    if (isOpen) renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, params, imageSrc, isOpen]);

  // Shader filter export: always generate/export from a fresh, off-DOM canvas at the original image size
  const exportShaderFilteredImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const { width, height } = originalImageSize;
      console.log(`[DEBUG] Exporting shader filter image at size: ${width}x${height}`);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const gl = canvas.getContext("webgl");
      if (!gl) {
        reject("WebGL context not supported");
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        try {
          console.log("[DEBUG] Source image for shader loaded:", img.width, img.height);
          applyShaderFilter(gl, img, filter, params);
          gl.flush();
          if (gl.finish) gl.finish();
          // Use dataURL for reliability
          const dataUrl = canvas.toDataURL("image/png");
          console.log("[DEBUG] Shader filter export dataURL generated, length:", dataUrl.length);
          resolve(dataUrl);
        } catch (e) {
          console.error("[DEBUG] Error during applyShaderFilter:", e);
          reject(e);
        }
      };
      img.onerror = () => {
        console.error("[DEBUG] Failed to load image for shader export.", imageSrc);
        reject("Failed to load image for shader export");
      };
    });
  };

  const handleApply = async (mode: "applyCurrent" | "createNew") => {
    if (currentLayer === null) return;
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) {
      console.error("[DEBUG] Main canvas not found.");
      return;
    }

    if (filter.startsWith("shader_")) {
      try {
        const canvas = previewShaderCanvasRef.current?.getCanvas?.();
        if (!canvas) {
          console.error("[DEBUG] Shader preview canvas not available!");
          return;
        }
        // Optionally force a synchronous re-render here if needed
        // const ctx = canvas.getContext("webgl"); ctx.flush(); ctx.finish && ctx.finish();
        const imageDataUrl = await canvas.toDataURL("image/png");
        if (!imageDataUrl || !imageDataUrl.startsWith("data:image/png")) {
          console.error("[DEBUG] Shader canvas export failed or empty.");
          return;
        }

        if (mode === "applyCurrent") {
          updateLayerProp(currentLayer, "image", imageDataUrl);
        } else if (mode === "createNew") {
          addNewLayer({
            name: `${filter} Layer`,
            index: layers.length,
            image: imageDataUrl,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            type: "image",
            visible: true,
          });
        }
        onApply(imageDataUrl, mode);
        onClose();
        return;
      } catch (error) {
        console.error("[DEBUG] Error during shader filter application:", error);
      }
    } else {
      // Canvas filters
      const mainCtx = mainCanvas.getContext("2d");
      if (!mainCtx) {
        console.error("[DEBUG] 2D context not found for main canvas.");
        return;
      }
      const img = new Image();
      img.src = filteredImage || imageSrc;
      img.onload = () => {
        mainCanvas.width = img.width;
        mainCanvas.height = img.height;
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
        // Wait for the next animation frame to ensure the draw is flushed
        requestAnimationFrame(() => {
          const appliedImage = mainCanvas.toDataURL("image/png");
          console.log("[DEBUG] Final canvas filter dataURL for layer:", appliedImage.slice(0, 128));
          if (mode === "applyCurrent") {
            updateLayerProp(currentLayer, "image", appliedImage);
            console.log("[DEBUG] Updated current layer with canvas filter image.");
          } else if (mode === "createNew") {
            addNewLayer({
              name: `${filter} Layer`,
              index: layers.length,
              image: appliedImage,
              offsetX: 0,
              offsetY: 0,
              scale: 1,
              type: "image",
              visible: true,
            });
            console.log("[DEBUG] Added new layer with canvas filter image.");
          }
          onApply(appliedImage, mode);
          onClose();
        });
      };
      img.onerror = () => {
        console.error("[DEBUG] Failed to load filtered image for canvas filter.", filteredImage?.slice(0, 128));
      };
    }
  };

  const handleParamChange = (paramName: string, value: any) => {
    setParams((prevParams: any) => ({
      ...prevParams,
      [paramName]: value,
    }));
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
        return <input type="color" name={paramName} value={params[paramName]} onChange={(e) => handleParamChange(paramName, e.target.value)} />;
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
        <button
          onClick={() => {
            restoreOriginalLayer();
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
            {/* Scaled Preview */}
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
