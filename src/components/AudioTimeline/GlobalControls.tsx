import React, { useState } from "react";

interface GlobalControlsProps {
  isPlaying: boolean;
  bpm: number;
  isLooping: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUpdateBPM: (bpm: number) => void;
  onToggleLoop: () => void;
  onToggleLayout: () => void;
  onAddTrack: () => void;
}

const GlobalControls: React.FC<GlobalControlsProps> = ({
  isPlaying,
  bpm,
  isLooping,
  onPlay,
  onPause,
  onStop,
  onZoomIn,
  onZoomOut,
  onUpdateBPM,
  onToggleLoop,
  onToggleLayout,
  onAddTrack,
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg">
      <div className="flex flex-wrap items-center gap-4">
        {/* Primary Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md min-w-[90px] transition-colors"
          >
            {isPlaying ? (
              <div className="flex items-center justify-center gap-2">
                <span>Pause</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Play</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </button>

          <button onClick={onStop} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
            <div className="flex items-center justify-center gap-2">
              <span>Stop</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v6H9z" />
              </svg>
            </div>
          </button>
        </div>

        {/* BPM Control */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-white">BPM:</label>
          <div className="flex items-center">
            <button onClick={() => onUpdateBPM(Math.max(30, bpm - 5))} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-l-md">
              -
            </button>
            <input
              type="number"
              value={bpm}
              onChange={(e) => onUpdateBPM(parseInt(e.target.value, 10) || 120)}
              className="w-16 px-2 py-1 bg-gray-700 text-white text-center border-none"
              min="30"
              max="300"
            />
            <button onClick={() => onUpdateBPM(Math.min(300, bpm + 5))} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-r-md">
              +
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button onClick={onZoomOut} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-l-md transition-colors" title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button onClick={onZoomIn} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md transition-colors" title="Zoom In">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        {/* Loop Toggle */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-white">Loop:</label>
          <div className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${isLooping ? "bg-green-600" : "bg-gray-600"}`} onClick={onToggleLoop}>
            <div className={`h-4 w-4 rounded-full transition-all ${isLooping ? "bg-white transform translate-x-5" : "bg-gray-300"}`}></div>
          </div>
        </div>

        {/* Advanced Controls Toggle */}
        <button
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors ml-auto"
        >
          <div className="flex items-center gap-1">
            {/*<span>Advanced</span>*/}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${showAdvancedControls ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvancedControls && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap items-center gap-4">
          <button onClick={onAddTrack} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
            <div className="flex items-center justify-center gap-2">
              <span>Add Track</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </button>

          <button onClick={onToggleLayout} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
            <div className="flex items-center justify-center gap-2">
              <span>Toggle Layout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalControls;
