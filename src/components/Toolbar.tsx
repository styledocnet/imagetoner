import React, { useRef } from "react";
import { FolderOpenIcon, Cog6ToothIcon, CameraIcon } from "@heroicons/react/24/outline";

interface ToolbarProps {
  onImportImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFillBackground: () => void;
  onApplyFilter: () => void;
  onExport: () => void;
  onOpenAspectRatioModal: () => void;
  onOpenWebcamModal: () => void;
  currentLayerType: string | null;
  onApplyRemBg?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onImportImage,
  onFillBackground,
  onApplyFilter,
  onApplyRemBg,
  onExport,
  onOpenAspectRatioModal,
  onOpenWebcamModal,
  currentLayerType,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 dark:bg-gray-700 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex space-x-4">
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onImportImage} />
        {currentLayerType === "image" && (
          <>
            <button className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md transition" onClick={onFillBackground}>
              Fill
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md transition" onClick={onApplyFilter}>
              Filter
            </button>
            <button className="hidden bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md transition" onClick={onApplyRemBg}>
              Remove BG
            </button>
            <button className="hidden bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md transition" onClick={onExport}>
              export
            </button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          {currentLayerType === "image" && (
            <>
              <button title="add cam capture" className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition" onClick={onOpenWebcamModal}>
                <CameraIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {currentLayerType === "image" && (
            <>
              <button title="add image" className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md transition" onClick={handleDropZoneClick}>
                <FolderOpenIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <button className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-md transition" onClick={onOpenAspectRatioModal}>
          <Cog6ToothIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
