import React, { useRef } from "react";
import { FolderOpenIcon, Cog6ToothIcon, CameraIcon } from "@heroicons/react/24/outline";
import ShinToolbar from "./shinui/ShinToolbar";
import ShinItem from "./shinui/ShinItem";

interface ToolbarProps {
  isProcessing: boolean;
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
  isProcessing = false,
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
    <ShinToolbar
      className={`shin-glass shinitem shinitem-shadowfocus p-4 flex justify-between items-center shadow-lg ${isProcessing ? "opacity-70 pointer-events-none select-none" : ""}`}
    >
      <div className="flex space-x-4">
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onImportImage} />
        {currentLayerType === "image" && (
          <>
            <ShinItem as="button" className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md" onClick={onFillBackground}>
              Fill
            </ShinItem>
            <ShinItem as="button" className="bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md" onClick={onApplyFilter}>
              Filter
            </ShinItem>
            <ShinItem as="button" className="bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md" onClick={onApplyRemBg}>
              Remove BG
            </ShinItem>
            <ShinItem as="button" className="hidden bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded-md" onClick={onExport}>
              Export
            </ShinItem>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {currentLayerType === "image" && (
          <>
            <ShinItem as="button" title="add cam capture" className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md" onClick={onOpenWebcamModal}>
              <CameraIcon className="w-4 h-4" />
            </ShinItem>
            <ShinItem as="button" title="add image" className="bg-gray-700 hover:bg-gray-800 py-2 px-2 rounded-md" onClick={handleDropZoneClick}>
              <FolderOpenIcon className="w-4 h-4" />
            </ShinItem>
          </>
        )}
        <ShinItem as="button" className="bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded-md" onClick={onOpenAspectRatioModal}>
          <Cog6ToothIcon className="w-4 h-4" />
        </ShinItem>
      </div>
    </ShinToolbar>
  );
};

export default Toolbar;
