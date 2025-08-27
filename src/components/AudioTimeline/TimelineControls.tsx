import React from "react";
import { GlobalSettings } from "../../types/audio/audiotimeline";
import {
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathRoundedSquareIcon,
  PlusCircleIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

interface TimelineControlsProps {
  settings: GlobalSettings;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onStopPlayback: () => void;
  onChangeBpm: (bpm: number) => void;
  onChangeZoom: (direction: "in" | "out") => void;
  onToggleLooping: () => void;
  onAddTrack: () => void;
  onLayoutChange?: (layout: "horizontal" | "vertical") => void;
  onVariationChange?: (variation: string) => void;
  currentVariation?: string;
  showVariationControls?: boolean;
  showBlockArranger?: boolean;
  onToggleBlockArranger?: () => void;
  className?: string;
}

// Export as a regular component to avoid potential memo issues
export const TimelineControls: React.FC<TimelineControlsProps> = ({
  settings,
  isPlaying,
  onTogglePlayback,
  onStopPlayback,
  onChangeBpm,
  onChangeZoom,
  onToggleLooping,
  onAddTrack,
  onLayoutChange = () => {},
  onVariationChange,
  currentVariation = "A",
  showVariationControls = false,
  showBlockArranger = false,
  onToggleBlockArranger = () => {},
  className = "",
}) => {
  return (
    <div className={`bg-gray-800 p-4 border-b border-gray-700 flex flex-wrap items-center gap-4 ${className}`} style={{ zIndex: 40, position: "relative" }}>
      <div className="playback-controls flex items-center gap-2">
        <button
          onClick={() => {
            onTogglePlayback();
          }}
          className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseCircleIcon className="w-6 h-6" /> : <PlayCircleIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={() => {
            onStopPlayback();
          }}
          className="flex items-center justify-center p-2 bg-gray-600 hover:bg-gray-700 rounded-full text-white transition-colors cursor-pointer"
          title="Stop"
        >
          <StopCircleIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="tempo-controls flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
        <label className="text-white font-medium">BPM:</label>
        <input
          type="number"
          min="40"
          max="300"
          value={settings.bpm}
          onChange={(e) => {
            onChangeBpm(parseInt(e.target.value));
          }}
          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
        />
      </div>

      <div className="zoom-controls flex items-center gap-2">
        <button
          onClick={() => onChangeZoom("in")}
          className="flex items-center justify-center p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors"
          title="Zoom In"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onChangeZoom("out")}
          className="flex items-center justify-center p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors"
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        className={`flex items-center gap-1 px-3 py-2 rounded-md text-white transition-colors ${
          settings.isLooping ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
        }`}
        onClick={() => onToggleLooping()}
        title={settings.isLooping ? "Disable Looping" : "Enable Looping"}
      >
        <ArrowPathRoundedSquareIcon className="w-5 h-5" />
        <span>Loop</span>
      </button>

      <div className="flex-grow"></div>

      {onLayoutChange && (
        <button
          className={`flex items-center gap-1 px-3 py-2 rounded-md text-white transition-colors ${
            settings.layout === "horizontal" ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-600 hover:bg-gray-700"
          }`}
          onClick={() => onLayoutChange(settings.layout === "horizontal" ? "vertical" : "horizontal")}
          title={`Switch to ${settings.layout === "horizontal" ? "Vertical" : "Horizontal"} Layout`}
        >
          {settings.layout === "horizontal" ? (
            <>
              <ViewColumnsIcon className="w-5 h-5" />
              <span>Vertical</span>
            </>
          ) : (
            <>
              <Squares2X2Icon className="w-5 h-5" />
              <span>Horizontal</span>
            </>
          )}
        </button>
      )}

      <button
        onClick={() => onAddTrack()}
        className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors ml-auto"
        title="Add New Track"
      >
        <PlusCircleIcon className="w-5 h-5" />
        <span>Add Track</span>
      </button>

      <button
        className={`flex items-center gap-1 px-3 py-2 rounded-md text-white transition-colors ${
          showBlockArranger ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-600 hover:bg-gray-700"
        }`}
        onClick={() => onToggleBlockArranger()}
        title={showBlockArranger ? "Hide Block Arranger" : "Show Block Arranger"}
      >
        <Squares2X2Icon className="w-5 h-5" />
        <span>Block Arranger</span>
      </button>

      {showVariationControls && onVariationChange && (
        <div className="variation-controls flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
          <label className="text-white font-medium">Variation:</label>
          <div className="flex gap-1">
            {["A", "B", "C", "D"].map((variation) => (
              <button
                key={variation}
                onClick={() => onVariationChange(variation)}
                className={`w-8 h-8 rounded-md text-white flex items-center justify-center ${
                  currentVariation === variation ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
                title={`Switch to Variation ${variation}`}
              >
                {variation}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-white text-xs ml-4 px-2 py-1 bg-gray-700 rounded-md">
        <span>Zoom: {Math.round(settings.zoom * 100)}%</span>
      </div>

      <button className="text-white text-xs ml-2 p-1 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors" title="Keyboard Shortcuts">
        <InformationCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
