import React from "react";
import { Track } from "../../types/audio/audiotimeline";

interface TrackMinimapProps {
  track: Track;
  currentStep: number;
}

const TrackMinimap: React.FC<TrackMinimapProps> = ({ track, currentStep }) => {
  return (
    <div className="h-12 border-t border-gray-700 bg-gray-800 relative">
      {/* Minimap visualization */}
      <div className="absolute inset-0 p-2">
        {/* Notes visualization */}
        {track.mode === "STEP" ? (
          // Step mode - horizontal bars
          <div className="relative w-full h-full">
            {track.notes.map((note) => {
              const left = (note.start / track.length) * 100;
              const width = Math.max(1, (note.length / track.length) * 100);

              return (
                <div
                  key={note.id}
                  className="absolute h-2 rounded-sm"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: track.color,
                    opacity: track.mute ? 0.3 : track.solo ? 1 : 0.7,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              );
            })}
          </div>
        ) : (
          // XY mode - dots
          <div className="relative w-full h-full">
            {track.notes.map((note) => {
              const left = (note.start / track.length) * 100;

              return (
                <div
                  key={note.id}
                  className="absolute h-1 w-1 rounded-full"
                  style={{
                    left: `${left}%`,
                    backgroundColor: track.color,
                    opacity: track.mute ? 0.3 : track.solo ? 1 : 0.7,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Current position indicator */}
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-red-500"
          style={{
            left: `${((currentStep % track.length) / track.length) * 100}%`,
            opacity: track.mute ? 0.3 : 1,
            boxShadow: track.solo ? "0 0 3px red" : "none",
          }}
        />
      </div>
    </div>
  );
};

export default TrackMinimap;
