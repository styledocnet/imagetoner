import React, { useState } from "react";
import Modal from "./Modal";
import FontFamilySelect from "./FontFamilySelect";

const LAYER_TYPES = [
  { value: "image", label: "Image" },
  { value: "text", label: "Text" },
];

const AddLayerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddLayer: (layer: any) => void;
}> = ({ isOpen, onClose, onAddLayer }) => {
  const [layerName, setLayerName] = useState("New Layer");
  const [layerType, setLayerType] = useState("image");
  const [text, setText] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [customFont, setCustomFont] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#000000");
  const [error, setError] = useState("");

  const handleAddLayer = () => {
    if (!layerName.trim()) {
      setError("Layer name is required.");
      return;
    }
    if (layerType === "text" && !text.trim()) {
      setError("Text is required for a text layer.");
      return;
    }
    setError("");
    const newLayer = {
      name: layerName.trim(),
      type: layerType,
      text: layerType === "text" ? text : "",
      fontFamily: layerType === "text" ? fontFamily || customFont : "",
      fontSize: layerType === "text" ? fontSize : 0,
      color: layerType === "text" ? color : "",
      offsetX: 100,
      offsetY: 100,
      scale: 1,
      image: null,
      visible: true,
    };
    onAddLayer(newLayer);
    // Reset for next open
    setLayerName("New Layer");
    setLayerType("image");
    setText("");
    setFontFamily("Arial");
    setCustomFont("");
    setFontSize(24);
    setColor("#000000");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={"Add New Layer"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md transition"
          >
            Cancel
          </button>
          <button onClick={handleAddLayer} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition font-semibold">
            Add Layer
          </button>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddLayer();
        }}
        autoComplete="off"
      >
        {!!error && <div className="text-red-600 font-medium">{error}</div>}

        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Layer Name</label>
          <input
            autoFocus
            type="text"
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Layer name"
            maxLength={40}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Layer Type</label>
          <div className="flex gap-4">
            {LAYER_TYPES.map((opt) => (
              <label
                key={opt.value}
                className={
                  "flex items-center gap-2 px-3 py-1 rounded cursor-pointer border " +
                  (layerType === opt.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900" : "border-gray-300 dark:border-gray-600")
                }
              >
                <input
                  type="radio"
                  value={opt.value}
                  checked={layerType === opt.value}
                  onChange={(e) => setLayerType(e.target.value)}
                  className="accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {layerType === "text" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Enter text"
                maxLength={100}
                style={{ fontFamily: fontFamily || customFont }}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Font Family</label>
              <FontFamilySelect value={fontFamily} onChange={setFontFamily} />
              {fontFamily === "" && (
                <input
                  type="text"
                  value={customFont}
                  onChange={(e) => setCustomFont(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mt-2"
                  placeholder="Custom font name"
                  style={{ fontFamily: customFont }}
                  maxLength={40}
                />
              )}
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Font Size</label>
              <input
                type="number"
                min={6}
                max={200}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded"
                  style={{ width: 40, height: 40, padding: 0 }}
                />
                <span className="text-xs">{color}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AddLayerModal;
