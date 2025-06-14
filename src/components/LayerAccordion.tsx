import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Layer } from "../types";
import FontFamilySelect from "./FontFamilySelect";
import NumberInputWithSlider from "./NumberInputWithSlider";

interface LayerAccordionProps {
  layers: Layer[];
  currentLayer: number | null;
  setCurrentLayer: (index: number | null) => void;
  setLayerProp: (layerIndex: number, prop: string, value: any) => void;
  removeLayer: (index: number) => void;
  moveLayerUp: (index: number) => void;
  moveLayerDown: (index: number) => void;
}

const LayerAccordion: React.FC<LayerAccordionProps> = ({ layers, currentLayer, setCurrentLayer, setLayerProp, removeLayer, moveLayerUp, moveLayerDown }) => {
  const [editLayerName, setEditLayerName] = useState<number | null>(null);

  const handleNameChange = (layerIndex: number, name: string) => {
    setLayerProp(layerIndex, "name", name);
    setEditLayerName(null);
  };

  return (
    <div className="space-y-4">
      {layers.map((layer: Layer, idx: number) => (
        <div key={"layeraccitem" + idx} className="border-none rounded-md shadow-sm bg-white dark:bg-gray-800 min-w-80">
          <div
            className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
              currentLayer === idx ? "bg-auto-500 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setCurrentLayer(idx)}
          >
            {editLayerName === idx ? (
              <input
                value={layer.name}
                onChange={(e) => handleNameChange(layer.index, e.target.value)}
                onBlur={() => handleNameChange(layer.index, layer.name)}
                autoFocus
                className="bg-transparent border-b border-gray-600 dark:border-gray-400 outline-none"
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditLayerName(layer.index);
                }}
              >
                {layer.name}
              </span>
            )}
            <div className="flex space-x-2 items-center">
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
                  moveLayerUp(layer.index);
                }}
              />
              <ChevronDownIcon
                className="w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(layer.index);
                }}
              />
              <XMarkIcon
                className="w-5 h-5"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this layer?")) {
                    removeLayer(idx);
                  }
                }}
              />
            </div>
          </div>
          {currentLayer === idx && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-w-80 max-w-80">
              {layer.image && layer.type === "image" && (
                <div className="relative mb-4">
                  <img src={layer.image} alt={layer.name} className="w-full h-auto rounded-md shadow-sm" />
                </div>
              )}
              {layer.type === "text" && (
                <div className="relative mb-4 max-w-72">
                  <div
                    className="max-h-60 overflow-auto border rounded bg-white dark:bg-gray-900 p-4 flex items-center justify-start"
                    style={{
                      maxWidth: "100%",
                      fontFamily: layer.fontFamily,
                      fontSize: layer.fontSize && layer.fontSize / 2,
                      color: layer.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {layer.text}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Offset X:</label>
                  <input
                    type="number"
                    value={layer.offsetX}
                    onChange={(e) => setLayerProp(layer.index, "offsetX", Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Offset Y:</label>
                  <input
                    type="number"
                    value={layer.offsetY}
                    onChange={(e) => setLayerProp(layer.index, "offsetY", Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Scale:</label>
                  <input
                    type="number"
                    value={layer.scale}
                    step={0.01}
                    onChange={(e) => setLayerProp(layer.index, "scale", Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {layer.type === "text" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Font Family:</label>
                      <FontFamilySelect value={layer.fontFamily || ""} onChange={(font) => setLayerProp(layer.index, "fontFamily", font)} />
                      {layer.fontFamily === "" && (
                        <input
                          type="text"
                          value={layer.fontFamily}
                          onChange={(e) => setLayerProp(layer.index, "fontFamily", e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mt-2"
                          placeholder="Custom font name"
                        />
                      )}
                    </div>
                    <NumberInputWithSlider
                      label="Font Size"
                      value={layer.fontSize || 24}
                      onChange={(num) => setLayerProp(layer.index, "fontSize", num)}
                      min={1}
                      max={500}
                      step={1}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Color:</label>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => setLayerProp(layer.index, "color", e.target.value)}
                        className="w-full rounded-md text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Text:</label>
                      <input
                        type="text"
                        value={layer.text}
                        onChange={(e) => setLayerProp(layer.index, "text", e.target.value)}
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
