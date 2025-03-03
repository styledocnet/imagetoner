import React from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface LayerAccordionProps {
  layers: {
    name: string;
    index: number;
    image: string | null;
    offsetX: number;
    offsetY: number;
    scale: number;
  }[];
  currentLayer: number;
  setCurrentLayer: (index: number) => void;
  setLayerProp: (layerIndex: number, prop: string, value: any) => void;
  removeLayer: (index: number) => void;
}

const LayerAccordion: React.FC<LayerAccordionProps> = ({
  layers,
  currentLayer,
  setCurrentLayer,
  setLayerProp,
  removeLayer,
}) => {
  return (
    <div className="space-y-4">
      {layers.map((layer) => (
        <div key={layer.index} className="border rounded-md shadow-sm">
          <div
            className={`flex justify-between items-center px-4 py-2 cursor-pointer ${currentLayer === layer.index ? "bg-gray-500 text-white" : "bg-gray-200"}`}
            onClick={() =>
              setCurrentLayer(currentLayer !== layer.index ? layer.index : null)
            }
          >
            <span>{layer.name}</span>
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              {currentLayer === layer.index ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </div>
          </div>
          {currentLayer === layer.index && (
            <div className="p-4 bg-gray-50">
              {layer.image && (
                <div className="relative mb-4">
                  <img
                    src={layer.image}
                    alt={layer.name}
                    className="w-full h-auto rounded-md shadow-sm"
                  />
                  <XMarkIcon
                    className="absolute top-2 right-2 h-6 w-6 text-red-500 cursor-pointer"
                    onClick={() => removeLayer(layer.index)}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block font-semibold mb-2">Scale:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={layer.scale}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "scale",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-1/3 p-2 border rounded-md"
                  />
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={layer.scale}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "scale",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-2/3"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Position X:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="-1000"
                    max="1000"
                    step="1"
                    value={layer.offsetX}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "offsetX",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-1/3 p-2 border rounded-md"
                  />
                  <input
                    type="range"
                    min="-1000"
                    max="1000"
                    step="1"
                    value={layer.offsetX}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "offsetX",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-2/3"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Position Y:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="-1000"
                    max="1000"
                    step="1"
                    value={layer.offsetY}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "offsetY",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-1/3 p-2 border rounded-md"
                  />
                  <input
                    type="range"
                    min="-1000"
                    max="1000"
                    step="1"
                    value={layer.offsetY}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "offsetY",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-2/3"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayerAccordion;
