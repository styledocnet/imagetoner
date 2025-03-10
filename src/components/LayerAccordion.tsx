import React, { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
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
    type: "image" | "text";
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    visible: boolean;
  }[];
  currentLayer: number;
  setCurrentLayer: (index: number) => void;
  setLayerProp: (layerIndex: number, prop: string, value: any) => void;
  removeLayer: (index: number) => void;
  moveLayerUp: (index: number) => void;
  moveLayerDown: (index: number) => void;
}

const LayerAccordion: React.FC<LayerAccordionProps> = ({
  layers,
  currentLayer,
  setCurrentLayer,
  setLayerProp,
  removeLayer,
  moveLayerUp,
  moveLayerDown,
}) => {
  const [editLayerName, setEditLayerName] = useState<number | null>(null);

  const handleNameChange = (layerIndex: number, name: string) => {
    setLayerProp(layerIndex, "name", name);
    setEditLayerName(null);
  };

  return (
    <div className="space-y-4">
      {layers.map((layer, idx) => (
        <div
          key={layer.index}
          className="border rounded-md shadow-sm bg-white dark:bg-gray-800"
        >
          <div
            className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
              currentLayer === layer.index
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
            onClick={() =>
              currentLayer === layer.index
                ? setCurrentLayer(null)
                : setCurrentLayer(layer.index)
            }
          >
            {editLayerName === layer.index ? (
              <input
                type="text"
                value={layer.name}
                onChange={(e) => handleNameChange(layer.index, e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onBlur={() => setEditLayerName(null)}
                autoFocus
              />
            ) : (
              <span onDoubleClick={() => setEditLayerName(layer.index)}>
                {layer.name}
              </span>
            )}
            <div className="flex items-center space-x-2">
              {layer.visible ? (
                <EyeIcon
                  className="w-5 h-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayerProp(layer.index, "visible", false);
                  }}
                />
              ) : (
                <EyeSlashIcon
                  className="w-5 h-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayerProp(layer.index, "visible", true);
                  }}
                />
              )}
              <ChevronUpIcon
                className="w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerUp(idx);
                }}
              />
              <ChevronDownIcon
                className="w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(idx);
                }}
              />
              <XMarkIcon
                className="w-5 h-5 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  confirm("Are you sure you want to delete this layer?") &&
                    removeLayer(layer.index);
                }}
              />
            </div>
          </div>
          {currentLayer === layer.index && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
              {layer.image && layer.type === "image" && (
                <div className="relative mb-4">
                  <img
                    src={layer.image}
                    alt={layer.name}
                    className="w-full h-auto rounded-md shadow-sm"
                  />
                </div>
              )}
              {layer.type === "text" && (
                <div className="relative mb-4">
                  <div
                    className="w-full h-auto rounded-md shadow-sm"
                    style={{
                      fontFamily: layer.fontFamily,
                      fontSize: layer.fontSize,
                      color: layer.color,
                    }}
                  >
                    {layer.text}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {/* TODO - Add text Position Presets (vert: left, middle, right; CENTER(middle,middle); horizontal: top, middle, bottom) properties here */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Offset X:
                  </label>
                  <input
                    type="number"
                    value={layer.offsetX}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "offsetX",
                        Number(e.target.value),
                      )
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Offset Y:
                  </label>
                  <input
                    type="number"
                    value={layer.offsetY}
                    onChange={(e) =>
                      setLayerProp(
                        layer.index,
                        "offsetY",
                        Number(e.target.value),
                      )
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Scale:
                  </label>
                  <input
                    type="number"
                    value={layer.scale}
                    onChange={(e) =>
                      setLayerProp(layer.index, "scale", Number(e.target.value))
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {layer.type === "text" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Font Family:
                      </label>
                      <input
                        type="text"
                        value={layer.fontFamily}
                        onChange={(e) =>
                          setLayerProp(
                            layer.index,
                            "fontFamily",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Font Size:
                      </label>
                      <input
                        type="number"
                        value={layer.fontSize}
                        onChange={(e) =>
                          setLayerProp(
                            layer.index,
                            "fontSize",
                            Number(e.target.value),
                          )
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Color:
                      </label>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) =>
                          setLayerProp(layer.index, "color", e.target.value)
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Text:
                      </label>
                      <input
                        type="text"
                        value={layer.text}
                        onChange={(e) =>
                          setLayerProp(layer.index, "text", e.target.value)
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayerAccordion;
