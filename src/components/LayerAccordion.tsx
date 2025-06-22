import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Layer } from "../types";
import FontFamilySelect from "./FontFamilySelect";
import NumberInputWithSlider from "./NumberInputWithSlider";
import SelectBox from "./SelectBox";

const BLEND_MODE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "hard-light", label: "Hard Light" },
  { value: "soft-light", label: "Soft Light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "color", label: "Color" },
  { value: "luminosity", label: "Luminosity" },
];

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
    <div className="space-y-4 rounded-xl ">
      {layers.map((layer: Layer, idx: number) => (
        <div
          key={"layeraccitem" + idx}
          className="rounded-xl shadow-md bg-gradient-to-br from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 border border-slate-100 dark:border-gray-700 min-w-80"
        >
          <div
            className={`flex justify-between items-center px-4 py-2 rounded-t-xl transition cursor-pointer
              ${currentLayer === idx ? "bg-gradient-to-t text-gray-500 dark:text-gray-300 shadow-lg rounded-b-none" : "bg-slate-200 dark:bg-gray-700 dark:text-gray-300 rounded-b-xl"}`}
            onClick={() => setCurrentLayer(idx)}
          >
            {editLayerName === idx ? (
              <input
                value={layer.name}
                onChange={(e) => handleNameChange(layer.index, e.target.value)}
                onBlur={() => handleNameChange(layer.index, layer.name)}
                autoFocus
                className="bg-transparent border-b border-sky-400 dark:border-sky-300 outline-none px-1 text-sm"
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditLayerName(layer.index);
                }}
                className="font-semibold tracking-tight"
              >
                {layer.name}
              </span>
            )}
            <div className="flex space-x-2 items-center">
              {layer.visible ? (
                <EyeIcon
                  className="w-5 h-5 hover:text-sky-500 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayerProp(layer.index, "visible", false);
                  }}
                  title="Hide layer"
                />
              ) : (
                <EyeSlashIcon
                  className="w-5 h-5 hover:text-sky-500 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayerProp(layer.index, "visible", true);
                  }}
                  title="Show layer"
                />
              )}
              <ChevronUpIcon
                className={`w-5 h-5 hover:text-sky-500 transition ${idx === 0 ? "opacity-40 pointer-events-none" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerUp(layer.index);
                }}
                title="Move up"
              />
              <ChevronDownIcon
                className={`w-5 h-5 hover:text-sky-500 transition ${idx === layers.length - 1 ? "opacity-40 pointer-events-none" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(layer.index);
                }}
                title="Move down"
              />
              <XMarkIcon
                className="w-5 h-5 hover:text-red-600 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this layer?")) {
                    removeLayer(idx);
                  }
                }}
                title="Delete layer"
              />
            </div>
          </div>
          {currentLayer === idx && (
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 min-w-80 max-w-80 rounded-b-xl">
              {layer.image && layer.type === "image" && (
                <div className="relative mb-4">
                  <img src={layer.image} alt={layer.name} className="w-full h-auto rounded-md shadow" />
                </div>
              )}
              {layer.type === "text" && (
                <div className="relative mb-4 max-w-72">
                  <div
                    className="max-h-60 overflow-auto border rounded bg-white dark:bg-gray-900 p-4 flex items-center justify-start shadow-inner"
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

              {/* --- Layer controls --- */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Offset X</label>
                    <input
                      type="number"
                      value={layer.offsetX}
                      onChange={(e) => setLayerProp(layer.index, "offsetX", Number(e.target.value))}
                      className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Offset Y</label>
                    <input
                      type="number"
                      value={layer.offsetY}
                      onChange={(e) => setLayerProp(layer.index, "offsetY", Number(e.target.value))}
                      className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Scale</label>
                  <input
                    type="number"
                    value={layer.scale}
                    step={0.01}
                    min={0.01}
                    onChange={(e) => setLayerProp(layer.index, "scale", Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Opacity</label>
                  <NumberInputWithSlider
                    value={typeof layer.opacity === "number" ? layer.opacity : 1}
                    onChange={(num) => setLayerProp(layer.index, "opacity", num)}
                    min={0}
                    max={1}
                    step={0.01}
                    label=""
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Blend Mode</label>
                  <SelectBox
                    options={BLEND_MODE_OPTIONS}
                    value={layer.blendMode || "normal"}
                    onChange={(mode) => setLayerProp(layer.index, "blendMode", mode)}
                    small
                  />
                </div>
                {layer.type === "text" && (
                  <>
                    <div>
                      <FontFamilySelect value={layer.fontFamily || ""} onChange={(font) => setLayerProp(layer.index, "fontFamily", font)} small />
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
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Color</label>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => setLayerProp(layer.index, "color", e.target.value)}
                        className="w-full rounded-md h-9 border-0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Text</label>
                      <input
                        type="text"
                        value={layer.text}
                        onChange={(e) => setLayerProp(layer.index, "text", e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
