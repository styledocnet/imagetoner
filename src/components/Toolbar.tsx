import React from "react";
import {
  ArrowDownIcon,
  PlusIcon,
  Cog6ToothIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

interface ToolbarProps {
  onImportImage: () => void;
  onFillBackground: () => void;
  onApplyFilter: () => void;
  onExport: () => void;
  onOpenAspectRatioModal: () => void;
  onOpenWebcamModal: () => void;
  currentLayerType: string | null;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onImportImage,
  onFillBackground,
  onApplyFilter,
  onExport,
  onOpenAspectRatioModal,
  onOpenWebcamModal,
  currentLayerType,
}) => {
  return (
    <div className="bg-gray-800 dark:bg-gray-700 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex space-x-4">
        {currentLayerType === "image" && (
          <>
            <button
              className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md transition"
              onClick={onFillBackground}
            >
              Fill
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md transition"
              onClick={onApplyFilter}
            >
              Filter
            </button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {currentLayerType === "image" && (
          <>
            <label className="block font-semibold">Add </label>
            <button
              className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition"
              onClick={onOpenWebcamModal}
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {currentLayerType === "image" && (
          <>
            <label className="block font-semibold">Add Image</label>
            <button
              className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition"
              onClick={onImportImage}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md transition"
          onClick={onExport}
        >
          <ArrowDownIcon className="w-4 h-4 inline-block mr-2" />
          Download
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-md transition"
          onClick={onOpenAspectRatioModal}
        >
          <Cog6ToothIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
