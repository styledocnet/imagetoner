import React, { useState } from "react";
import Modal from "./Modal";

const AddLayerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddLayer: (layer: any) => void;
}> = ({ isOpen, onClose, onAddLayer }) => {
  const [layerName, setLayerName] = useState("new layer");
  const [layerType, setLayerType] = useState("image");
  const [text, setText] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#000000");

  const handleAddLayer = () => {
    const newLayer = {
      name: layerName,
      type: layerType,
      text: layerType === "text" ? text : "",
      fontFamily: layerType === "text" ? fontFamily : "",
      fontSize: layerType === "text" ? fontSize : 0,
      color: layerType === "text" ? color : "",
      offsetX: 100,
      offsetY: 100,
      scale: 1,
      image: null,
      visible: true,
    };
    onAddLayer(newLayer);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Add New Layer"
      onClose={onClose}
      footer={
        <button
          onClick={handleAddLayer}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Add Layer
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
            Layer Name:
          </label>
          <input
            type="text"
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
            Layer Type:
          </label>
          <select
            value={layerType}
            onChange={(e) => setLayerType(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="image">Image</option>
            <option value="text">Text</option>
          </select>
        </div>

        {layerType === "text" && (
          <>
            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                Text:
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                Font Family:
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                Font Size:
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300">
                Color:
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full  border border-gray-300 dark:border-gray-600  rounded-md"
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AddLayerModal;
