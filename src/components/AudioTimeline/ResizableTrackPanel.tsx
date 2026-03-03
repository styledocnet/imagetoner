import React, { useState, useEffect } from "react";
import { Track } from "../../types/audio/audiotimeline";
import { InstrumentType } from "../../types/audio";
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StarIcon,
  UserGroupIcon,
  PencilSquareIcon,
  CursorArrowRaysIcon,
  MusicalNoteIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import TrackMinimap from "./TrackMinimap";
import SelectBox from "../SelectBox";
import InstrumentSelectorModal, { InstrumentParameters } from "./InstrumentSelectorModal";
import { rootNotes, formatScaleOptionsForDropdown, generateScaleOptions, parseScaleString } from "@/utils/audio/scales";

interface ResizableTrackPanelProps {
  track: Track;
  children: React.ReactNode;
  onModeToggle: () => void;
  onLengthChange: (length: number) => void;
  onMute: () => void;
  onSolo: () => void;
  onOctaveChange: (trackId: string, change: number) => void;
  onScaleChange?: (trackId: string, rootNote: string, scaleName: string) => void;
  onInstrumentChange?: (trackId: string, instrument: InstrumentType, parameters: InstrumentParameters) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentStep?: number;
  onClearPattern?: () => void;
}

const ResizableTrackPanel: React.FC<ResizableTrackPanelProps> = ({
  track,
  children,
  onModeToggle,
  onLengthChange,
  onMute,
  onSolo,
  onOctaveChange = () => {},
  onScaleChange = () => {},
  onInstrumentChange = () => {},
  isExpanded = false,
  onToggleExpand = () => {},
  currentStep = 0,
  onClearPattern = () => {},
}) => {
  const [height, setHeight] = useState(isExpanded ? 400 : 200);
  const [isResizing, setIsResizing] = useState(false);
  const [wasExpanded, setWasExpanded] = useState(isExpanded);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);

  const handleInstrumentModalConfirm = (params: InstrumentParameters) => {
    if (onInstrumentChange) {
      onInstrumentChange(track.id, params.instrument as InstrumentType, params);
    }
    setShowInstrumentModal(false);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(100, startHeight + deltaY);
      setHeight(newHeight);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Update height when expanded state changes
  useEffect(() => {
    if (isExpanded && !wasExpanded) {
      setHeight(400);
      setWasExpanded(true);
    } else if (!isExpanded && wasExpanded && !isResizing) {
      setHeight(200);
      setWasExpanded(false);
    }
  }, [isExpanded, isResizing, wasExpanded]);

  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden flex flex-col shadow-md ${isExpanded ? "md:col-span-2 lg:col-span-2" : ""}`}
      style={{
        height: isExpanded ? Math.max(height, 400) : height,
        borderLeft: `4px solid ${track.color}`,
        borderTop: `1px solid ${track.color}30`,
        borderBottom: `1px solid ${track.color}30`,
        transition: isResizing ? "none" : "all 0.3s ease",
        boxShadow: isExpanded
          ? `0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px ${track.color}30`
          : `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px ${track.color}20`,
      }}
    >
      {/* Track Header */}
      <div className="flex items-center justify-between p-2 bg-gray-700 text-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: track.color }}></div>
          <span className="font-bold text-white">{track.name}</span>
          <span className="text-xs bg-gray-600 px-2 py-1 rounded-md shadow-sm flex items-center text-white">
            {track.mode === "STEP" ? (
              <>
                <PencilSquareIcon className="w-3 h-3 mr-1" /> STEP
              </>
            ) : track.mode === "XY" ? (
              <>
                <CursorArrowRaysIcon className="w-3 h-3 mr-1" /> XY
              </>
            ) : (
              <>
                <MusicalNoteIcon className="w-3 h-3 mr-1" /> CIRCULAR
              </>
            )}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInstrumentModal(true);
            }}
            className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-2 py-1 rounded-md shadow-sm flex items-center text-white transition-all cursor-pointer border border-purple-500"
            title="Click to edit instrument and parameters"
          >
            <MusicalNoteIcon className="w-3 h-3 mr-1" />
            {track.instrument}
          </button>

          {/* Octave Controls */}
          {track.mode === "STEP" && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOctaveChange(track.id, 1);
                }}
                className="p-1 bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors duration-150 text-white"
                title="Octave Up"
              >
                <ChevronUpIcon className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOctaveChange(track.id, -1);
                }}
                className="p-1 bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors duration-150 text-white"
                title="Octave Down"
              >
                <ChevronDownIcon className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-2 py-1 rounded-md shadow-sm transition-colors duration-150 text-white ${track.mute ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"}`}
            onClick={(e) => {
              e.stopPropagation();
              onMute();
            }}
            title={track.mute ? "Unmute track" : "Mute track"}
          >
            {track.mute ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
          </button>
          <button
            className={`px-2 py-1 rounded-md shadow-sm transition-colors duration-150 text-white ${track.solo ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}`}
            onClick={(e) => {
              e.stopPropagation();
              onSolo();
            }}
            title={track.solo ? "Unsolo track" : "Solo track"}
          >
            {track.solo ? <StarIcon className="w-4 h-4" /> : <UserGroupIcon className="w-4 h-4" />}
          </button>
          <button
            className={`px-2 py-1 rounded-md shadow-sm transition-colors duration-150 text-white ${
              isExpanded ? "bg-purple-600 hover:bg-purple-700 ring-2 ring-purple-400 ring-opacity-50" : "bg-gray-600 hover:bg-gray-700"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            title={isExpanded ? "Collapse track" : "Expand track"}
          >
            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
            <span className="ml-1 text-xs">{isExpanded ? "Collapse" : "Expand"}</span>
          </button>
          <button
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-150 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onModeToggle();
            }}
            title={track.mode === "STEP" ? "Switch to XY mode" : track.mode === "XY" ? "Switch to Circular mode" : "Switch to Step mode"}
          >
            {track.mode === "STEP" ? (
              <>
                <CursorArrowRaysIcon className="w-4 h-4 mr-1" /> XY
              </>
            ) : track.mode === "XY" ? (
              <>
                <MusicalNoteIcon className="w-4 h-4 mr-1" /> Circular
              </>
            ) : (
              <>
                <PencilSquareIcon className="w-4 h-4 mr-1" /> Step
              </>
            )}
          </button>

          <button
            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded-md shadow-sm transition-colors duration-150 text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Clear all notes from "${track.name}"?`)) {
                onClearPattern();
              }
            }}
            title="Clear all notes from this track"
          >
            <TrashIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-md">
            <label className="text-xs font-medium text-white">Length:</label>
            <input
              type="number"
              value={track.length}
              onChange={(e) => {
                e.stopPropagation();
                onLengthChange(parseInt(e.target.value, 10));
              }}
              className="w-14 px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-xs"
              min={1}
              max={128}
            />
            <span className="text-xs text-gray-400">steps</span>
          </div>
        </div>
      </div>

      {/* Scale selector row */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2 w-full">
          <div className="text-xs text-gray-400">Scale:</div>
          <div className="flex-1 flex gap-2">
            <SelectBox
              options={rootNotes.map((note) => ({ label: note, value: note }))}
              value={track.rootNote || "C"}
              onChange={(value) => {
                if (onScaleChange && track.scaleName) {
                  onScaleChange(track.id, value, track.scaleName);
                }
              }}
              small={true}
              className="w-16"
            />
            <SelectBox
              options={formatScaleOptionsForDropdown(generateScaleOptions("C"))}
              value={`${track.rootNote || "C"}|${track.scaleName || "major"}`}
              onChange={(value) => {
                if (onScaleChange) {
                  const { rootNote, scaleName } = parseScaleString(value);
                  onScaleChange(track.id, rootNote, scaleName);
                }
              }}
              small={true}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Track Content */}
      <div
        className={`flex-1 overflow-hidden ${isExpanded ? "min-h-[300px]" : ""}`}
        style={{
          transition: "min-height 0.3s ease",
          pointerEvents: "auto",
          zIndex: 20,
        }}
      >
        {children}
      </div>

      {/* Track Minimap */}
      <div className="border-t border-gray-700">
        <TrackMinimap track={track} currentStep={currentStep} />
      </div>

      {/* Instrument Selector Modal */}
      <InstrumentSelectorModal
        isOpen={showInstrumentModal}
        onClose={() => setShowInstrumentModal(false)}
        currentInstrument={track.instrument || "Sine"}
        onConfirm={handleInstrumentModalConfirm}
        trackName={track.name}
      />

      {/* Resize Handle */}
      <div
        className="h-3 bg-gray-700 cursor-ns-resize flex justify-center items-center hover:bg-gray-600 transition-colors duration-150"
        onMouseDown={startResize}
        title="Drag to resize track"
      >
        <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
        <div className="absolute text-xs text-gray-400 opacity-70">{height}px</div>
        {isExpanded && <div className="absolute right-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-sm shadow-sm">Expanded View</div>}
      </div>
    </div>
  );
};

export default ResizableTrackPanel;
