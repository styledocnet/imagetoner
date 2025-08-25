import React, { useEffect, useRef, useState, useCallback } from "react";
import ColorSwatch from "./ColorSwatch";
import { BrandStyle } from "@/types";
import WebGLFilterRenderer from "./WebGLFilterRenderer";
import { applyFilterToCanvas } from "@/utils/filterUtils";
import { canvasFilterParams, shaderFilterParams } from "@/utils/filterParams";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ShinSelectBox from "./shinui/ShinSelectBox";

interface FilterParameter {
  type: "number" | "boolean" | "color";
  default: any;
  min?: number;
  max?: number;
  step?: number;
  desc: string;
}

// Error boundary component for FilterDrawer
class FilterDrawerErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("FilterDrawer Error:", error);
    return { hasError: true, error };
  }
  // @ts-ignore TS6133
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("FilterDrawer Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="text-red-800 font-bold">Filter Error</h3>
          <p className="text-red-700">{this.state.error?.message || "An error occurred in the filter drawer."}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filteredImage: string, mode: "applyCurrent" | "createNew") => void;
  imageSrc: string;
  documentSize: { width: number; height: number };
  mainCanvasRef: React.RefObject<HTMLCanvasElement>;
  brandStyle?: BrandStyle | null;
}

const FilterDrawerInner: React.FC<FilterDrawerProps> = ({ isOpen, onClose, onApply, imageSrc, documentSize, mainCanvasRef, brandStyle }) => {
  // --- State
  const [filter, setFilter] = useState("shader_vignette");
  const [params, setParams] = useState<Record<string, any>>({});
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewShaderCanvasRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeColors = brandStyle?.colors ?? [];

  // --- Get current filter parameters with type safety
  const getCurrentParams = useCallback(() => {
    const shaderParams = shaderFilterParams[filter];
    const canvasParams = canvasFilterParams[filter];
    return shaderParams || canvasParams || {};
  }, [filter]);

  // --- Initialize parameters when filter changes
  useEffect(() => {
    try {
      const currentParams = getCurrentParams();
      console.log("FilterDrawer: Initializing params for filter:", filter, currentParams);

      if (currentParams && typeof currentParams === "object") {
        const initialParams: Record<string, any> = {};

        Object.entries(currentParams).forEach(([paramName, paramConfig]) => {
          if (paramConfig && typeof paramConfig === "object" && "default" in paramConfig) {
            initialParams[paramName] = paramConfig.default;
            console.log(`FilterDrawer: Setting param ${paramName} = ${paramConfig.default}`);
          }
        });

        setParams(initialParams);
        console.log("FilterDrawer: Initialized params:", initialParams);
      } else {
        console.log("FilterDrawer: No params found, resetting to empty");
        setParams({});
      }
    } catch (error) {
      console.error("FilterDrawer: Error initializing parameters:", error);
      setParams({});
    }
  }, [filter, getCurrentParams]);

  // --- Update preview when parameters change
  useEffect(() => {
    if (isOpen && imageSrc) {
      renderPreview();
    }
  }, [filter, params, imageSrc, isOpen]);

  // --- Preview renderer
  const renderPreview = useCallback(async () => {
    if (!imageSrc) return;

    setIsPreviewLoading(true);

    try {
      if (filter.startsWith("shader_")) {
        // WebGLFilterRenderer handles shader preview
        // Preview will be updated via onRenderComplete callback
      } else {
        // Handle canvas filters
        const previewCanvas = canvasRef.current;
        if (!previewCanvas) return;

        const previewCtx = previewCanvas.getContext("2d");
        if (!previewCtx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          try {
            previewCanvas.width = img.width;
            previewCanvas.height = img.height;
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

            applyFilterToCanvas(filter, previewCtx, previewCanvas, params);
            const filtered = previewCanvas.toDataURL("image/png");
            setFilteredImage(filtered);
          } catch (error) {
            console.error("Error applying canvas filter:", error);
          } finally {
            setIsPreviewLoading(false);
          }
        };

        img.onerror = () => {
          console.error("Error loading image for preview");
          setIsPreviewLoading(false);
        };

        img.src = imageSrc;
      }
    } catch (error) {
      console.error("Error rendering preview:", error);
      setIsPreviewLoading(false);
    }
  }, [filter, params, imageSrc]);

  // --- Apply handler
  const handleApply = async (mode: "applyCurrent" | "createNew") => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) {
      console.error("Main canvas not available");
      return;
    }

    try {
      if (filter.startsWith("shader_")) {
        // Handle shader filters
        const canvas = previewShaderCanvasRef.current?.getCanvas?.();
        if (!canvas) {
          console.error("Shader canvas not available");
          return;
        }
        const imageDataUrl = await canvas.toDataURL("image/png");
        onApply(imageDataUrl, mode);
      } else {
        // Handle canvas filters
        const mainCtx = mainCanvas.getContext("2d");
        if (!mainCtx) {
          console.error("Main canvas context not available");
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          try {
            mainCanvas.width = img.width;
            mainCanvas.height = img.height;
            mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
            mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);

            requestAnimationFrame(() => {
              const appliedImage = mainCanvas.toDataURL("image/png");
              onApply(appliedImage, mode);
            });
          } catch (error) {
            console.error("Error applying filter to main canvas:", error);
          }
        };

        img.src = filteredImage || imageSrc;
      }

      onClose();
    } catch (error) {
      console.error("Error applying filter:", error);
    }
  };

  // --- Parameter change handler
  const handleParamChange = useCallback((paramName: string, value: any) => {
    setParams((prevParams) => ({
      ...prevParams,
      [paramName]: value,
    }));
  }, []);

  // --- Color input renderer
  const renderColorInput = useCallback(
    (paramName: string, param: FilterParameter) => {
      const currentValue = params[paramName] || param.default || "#ffffff";

      return (
        <div className="flex items-center gap-2">
          {themeColors.map((colorItem, index) => (
            <ColorSwatch
              key={`${colorItem.hex}-${index}`}
              color={colorItem.hex}
              label={colorItem.name || colorItem.role || ""}
              selected={currentValue.toLowerCase() === colorItem.hex.toLowerCase()}
              onClick={() => handleParamChange(paramName, colorItem.hex)}
            />
          ))}
          <input
            type="color"
            name={paramName}
            value={currentValue}
            onChange={(e) => handleParamChange(paramName, e.target.value)}
            className="w-8 h-8 rounded border ml-2"
          />
        </div>
      );
    },
    [params, themeColors, handleParamChange],
  );

  // --- Parameter input renderer
  const renderParameterInput = useCallback(
    (paramName: string, param: FilterParameter) => {
      if (!param || typeof param !== "object") {
        return null;
      }

      const currentValue = params[paramName] ?? param.default;

      switch (param.type) {
        case "number":
          return (
            <div className="space-y-2">
              <input
                type="range"
                name={paramName}
                min={param.min ?? 0}
                max={param.max ?? 100}
                step={param.step ?? 1}
                value={currentValue ?? param.default ?? 0}
                onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                tabIndex={0}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{param.min ?? 0}</span>
                <span className="font-medium">{currentValue ?? param.default ?? 0}</span>
                <span>{param.max ?? 100}</span>
              </div>
            </div>
          );

        case "boolean":
          return (
            <input
              type="checkbox"
              name={paramName}
              checked={currentValue ?? param.default ?? false}
              onChange={(e) => handleParamChange(paramName, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              tabIndex={0}
            />
          );

        case "color":
          return renderColorInput(paramName, param);

        default:
          return null;
      }
    },
    [params, handleParamChange, renderColorInput],
  );

  // --- Generate filter options for select box
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

  // --- Get current parameters safely
  const currentParams = getCurrentParams();
  console.log("FilterDrawer: Current params for rendering:", currentParams);

  const paramEntries = Object.entries(currentParams).filter(([, param]) => {
    const isValid = param && typeof param === "object" && "type" in param && "desc" in param;
    if (!isValid) {
      console.warn("FilterDrawer: Invalid param config:", param);
    }
    return isValid;
  });

  const paramCount = paramEntries.length;
  const hasManyParams = paramCount > 3;

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} role="button" tabIndex={0} aria-label="Close filter drawer" />

      {/* Modal dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="filter-drawer-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <h3 id="filter-drawer-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Apply Filter
            </h3>
            <button onClick={onClose} className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900 transition" aria-label="Close filter drawer" type="button">
              <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
            </button>
          </div>

          {/* Content area - flexible height */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter selection and parameters */}
            <div className={`p-4 ${hasManyParams ? "overflow-y-auto flex-1" : "flex-shrink-0"}`}>
              <div className="mb-4">
                <label htmlFor="filter-select" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Filter Type:
                </label>
                <ShinSelectBox
                  id="filter-select"
                  value={filter}
                  onChange={setFilter}
                  options={filterOptions.flatMap((group) => [{ label: `– ${group.label} –`, value: "", disabled: true }, ...group.options])}
                  placeholder="Choose Filter"
                />
              </div>

              {/* Parameters */}
              {paramEntries.map(([paramName, param]) => {
                try {
                  const paramConfig = param as FilterParameter;
                  const description = paramConfig?.desc || paramName;
                  console.log(`FilterDrawer: Rendering param ${paramName}:`, paramConfig);

                  return (
                    <div key={`param-${paramName}-${filter}`} className="mb-4">
                      <label htmlFor={`param-${paramName}`} className="block font-medium text-sm mb-2 capitalize text-gray-700 dark:text-gray-300">
                        {typeof description === "string" && description ? description : paramName}
                      </label>
                      <div className="relative" id={`param-${paramName}`}>
                        {renderParameterInput(paramName, paramConfig)}
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error(`FilterDrawer: Error rendering param ${paramName}:`, error);
                  return (
                    <div key={`param-error-${paramName}`} className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                      Error loading parameter: {paramName}
                    </div>
                  );
                }
              })}
            </div>

            {/* Preview */}
            <div className="px-4 pb-4 flex-shrink-0">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Preview:</label>
              <div className="w-full h-40 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 relative">
                {isPreviewLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-white">Loading...</div>
                  </div>
                )}
                {filter.startsWith("shader_") ? (
                  <WebGLFilterRenderer
                    ref={previewShaderCanvasRef}
                    image={imageSrc}
                    filter={filter}
                    params={params}
                    width={documentSize.width}
                    height={documentSize.height}
                    onRenderComplete={(imageUrl) => {
                      setFilteredImage(imageUrl);
                      setIsPreviewLoading(false);
                    }}
                  />
                ) : (
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" style={{ display: filteredImage ? "block" : "none" }} />
                )}
                {!filteredImage && !isPreviewLoading && <div className="text-gray-500 dark:text-gray-400">No preview available</div>}
              </div>
            </div>
          </div>

          {/* Dialog Footer - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApply("applyCurrent")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
              type="button"
              disabled={!imageSrc}
            >
              Apply to Layer
            </button>
            <button
              onClick={() => handleApply("createNew")}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50"
              type="button"
              disabled={!imageSrc}
            >
              Create New Layer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Main FilterDrawer component with error boundary
const FilterDrawer: React.FC<FilterDrawerProps> = (props) => {
  return (
    <FilterDrawerErrorBoundary>
      <FilterDrawerInner {...props} />
    </FilterDrawerErrorBoundary>
  );
};

export default FilterDrawer;
