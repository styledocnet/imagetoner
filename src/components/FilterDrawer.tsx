import React, { useEffect, useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLayerContext } from "../context/LayerContext";
import WebGLFilterRenderer from "./WebGLFilterRenderer";
import { applyFilterToCanvas } from "../utils/filterUtils";
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shaderCanvasRef = useRef<any>(null);

  useEffect(() => {
    if (shaderFilterParams[filter]) {
      setParams({ ...shaderFilterParams[filter] });
    } else if (canvasFilterParams[filter]) {
      setParams({ ...canvasFilterParams[filter] });
    }
  }, [filter]);

  const renderPreview = () => {
    if (filter.startsWith("shader_")) {
      const previewCanvas = canvasRef.current;
      if (!previewCanvas) return;

      const gl = previewCanvas.getContext("webgl");
      if (!gl) {
        console.error("WebGL context not supported in preview canvas.");
        return;
      }

      WebGLFilterRenderer.applyShaderFilter(gl, imageSrc, filter, params, () => {
        const filtered = previewCanvas.toDataURL("image/png");
        setFilteredImage(filtered);
      });
    } else {
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
    }
  };

  const handleApply = async (mode: "applyCurrent" | "createNew") => {
    if (currentLayer === null) return;

    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) {
      console.error("Main canvas not found.");
      return;
    }

    if (filter.startsWith("shader_")) {
      try {
        // Wait for the exported image from WebGLFilterRenderer
        const exportedImage = await shaderCanvasRef.current.exportImage();
        if (!exportedImage) {
          console.error("Failed to export image from WebGLFilterRenderer.");
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous"; // Required for drawing cross-origin images
        img.src = exportedImage;

        img.onload = () => {
          const ctx = mainCanvas.getContext("2d");
          if (!ctx) {
            console.error("2D context not found for main canvas.");
            return;
          }

          // Resize and clear the main canvas
          mainCanvas.width = img.width;
          mainCanvas.height = img.height;
          ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

          // Draw the exported image onto the main canvas
          ctx.drawImage(img, 0, 0);

          // Export the final image from the main canvas
          const finalImage = mainCanvas.toDataURL("image/png");
          console.log("Final Image Data URL:", finalImage); // Debugging log

          // Update the layer only after the image is fully drawn
          if (mode === "applyCurrent") {
            console.log("Updating the current layer with the final image.");
            updateLayerProp(currentLayer, "image", finalImage);
          } else if (mode === "createNew") {
            console.log("Adding a new layer with the final image.");
            addNewLayer({
              name: `${filter} Layer`,
              index: layers.length,
              image: finalImage,
              offsetX: 0,
              offsetY: 0,
              scale: 1,
              type: "image",
              visible: true,
            });
          }

          // Notify parent and close the drawer
          onApply(finalImage, mode);
          onClose();
        };

        img.onerror = () => {
          console.error("Failed to load exported image for shader filter.");
        };
      } catch (error) {
        console.error("Error during shader filter application:", error);
      }
    } else {
      // Handle canvas filters
      const mainCtx = mainCanvas.getContext("2d");
      if (!mainCtx) {
        console.error("2D context not found for main canvas.");
        return;
      }

      const img = new Image();
      img.src = filteredImage || imageSrc;

      img.onload = () => {
        mainCanvas.width = img.width;
        mainCanvas.height = img.height;

        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);

        const appliedImage = mainCanvas.toDataURL("image/png");

        if (mode === "applyCurrent") {
          updateLayerProp(currentLayer, "image", appliedImage);
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
        }

        onApply(appliedImage, mode);
        onClose();
      };

      img.onerror = () => {
        console.error("Failed to load filtered image for canvas filter.");
      };
    }
  };

  useEffect(() => {
    if (isOpen) {
      renderPreview();
    }
  }, [filter, params, imageSrc, isOpen]);

  const handleParamChange = (paramName: string, value: any) => {
    setParams((prevParams: any) => ({
      ...prevParams,
      [paramName]: value,
    }));
  };

  const renderInput = (paramName: string, param: FilterParameter) => {
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
            {" "}
            {/* Scaled Preview */}
            {filter.startsWith("shader_") ? (
              <WebGLFilterRenderer
                ref={shaderCanvasRef}
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
