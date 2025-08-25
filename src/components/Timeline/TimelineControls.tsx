import React, { useState } from "react";

interface TimelineControlsProps {
  isPlaying: boolean;
  bpm: number;
  isLooping: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddNote: () => void;
  onUpdateBPM: (bpm: number) => void;
  onToggleLoop: () => void;
  onUpdateGridLength: (length: number) => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  bpm,
  isLooping,
  onPlay,
  onPause,
  onStop,
  onZoomIn,
  onZoomOut,
  onAddNote,
  onUpdateBPM,
  onToggleLoop,
  onUpdateGridLength,
}) => {
  const [gridLengthInput, setGridLengthInput] = useState(32);

  return (
    <div className="flex items-center gap-4 mb-4">
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="px-4 py-2 bg-green-500 text-white rounded min-w-32"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button
        onClick={onStop}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Stop
      </button>
      <button
        onClick={onZoomIn}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Zoom In
      </button>
      <button
        onClick={onZoomOut}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Zoom Out
      </button>
      <button
        onClick={onAddNote}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Add Note
      </button>
      <div className="flex items-center gap-2">
        <label>BPM:</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => onUpdateBPM(parseInt(e.target.value, 10))}
          className="px-2 py-1 rounded text-black"
        />
      </div>
      <div className="flex items-center gap-2">
        <label>Loop:</label>
        <input
          type="checkbox"
          checked={isLooping}
          onChange={onToggleLoop}
          className="w-5 h-5"
        />
      </div>
      <div className="flex items-center gap-2">
        <label>Grid Length:</label>
        <input
          type="number"
          value={gridLengthInput}
          onChange={(e) => setGridLengthInput(parseInt(e.target.value, 10))}
          onBlur={() => onUpdateGridLength(gridLengthInput)}
          className="px-2 py-1 rounded text-black"
        />
      </div>
    </div>
  );
};

export default TimelineControls;
