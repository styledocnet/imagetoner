import React from "react";
import { AudioTrack as AudioTrackType } from "../../hooks/useAudioTrackManagement";
import { Note } from "../../types/audio";
// Using Tailwind CSS instead of imported CSS

interface AudioTrackProps {
  track: AudioTrackType;
  onDelete: (id: number) => void;
  onMute: (id: number) => void;
  onSolo: (id: number) => void;
  onLoopToggle: (id: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  zoom: number;
  visibleOctaves?: number;
  onOctaveShift: (id: number, direction: "up" | "down") => void;
  onNoteRemove?: (trackId: number, noteId: string | number) => void;
  onVariationSwitch?: (trackId: number, variation: string) => void;
  // Add other props as needed
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  track,
  onDelete,
  onMute,
  onSolo,
  onLoopToggle,
  onSelect,
  isSelected,
  zoom,
  visibleOctaves = 2,
  onOctaveShift,
  onNoteRemove,
  onVariationSwitch,
  // Other props
}) => {
  // Extract the note rendering logic
  const renderNotes = (notes: Note[]) => {
    // Only show notes for the current variation or notes without variation property
    const currentVariation = track.currentVariation || "A";
    const visibleNotes = notes.filter((note) => !note.variation || note.variation === currentVariation);

    return visibleNotes.map((note) => (
      <div
        key={note.id}
        className={`absolute rounded-sm flex items-center justify-between px-2 shadow-md transition-all duration-150 group ${note.isGhost ? "opacity-60 border border-dashed border-white" : "opacity-80 hover:opacity-100"}`}
        style={{
          left: `${note.start * zoom}px`,
          width: `${note.length * zoom}px`,
          top: `${getNoteVerticalPosition(note.pitch)}%`,
          height: "20px",
          backgroundColor: getNoteColor(note.instrument),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-xs text-white">{note.pitch}</div>
        {onNoteRemove && (
          <button
            className="w-5 h-5 rounded-full bg-red-500 bg-opacity-70 hover:bg-red-600 flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onNoteRemove(parseInt(track.id), note.id);
            }}
            title="Remove Note"
          >
            x
          </button>
        )}
      </div>
    ));
  };

  // Helper function to calculate vertical position based on pitch
  const getNoteVerticalPosition = (pitch: string) => {
    // Parse the pitch to get note name and octave
    const match = pitch.match(/([A-G]#?)(\d+)/);
    if (!match) return 0;

    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);

    // Note to index mapping (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
    const noteIndex =
      {
        C: 0,
        "C#": 1,
        Db: 1,
        D: 2,
        "D#": 3,
        Eb: 3,
        E: 4,
        F: 5,
        "F#": 6,
        Gb: 6,
        G: 7,
        "G#": 8,
        Ab: 8,
        A: 9,
        "A#": 10,
        Bb: 10,
        B: 11,
      }[noteName] || 0;

    // Calculate vertical position based on note and octave
    // Higher notes should be higher in the grid (lower pixel values)
    const totalNotes = 12 * visibleOctaves; // 12 semitones per octave
    const baseOctave = track.octave || 4;
    const octaveOffset = (octave - baseOctave) * 12;
    const notePosition = noteIndex + octaveOffset;

    // Invert the position (higher notes are at the top)
    const normalizedPosition = totalNotes - 1 - notePosition;

    // Convert to percentage of track height
    return (normalizedPosition / totalNotes) * 100;
  };

  // Helper function to get color based on instrument
  const getNoteColor = (instrument: string) => {
    // Different colors for different instruments
    const colors = {
      lead: "#4a90e2", // Blue
      bass: "#8e44ad", // Purple
      pad: "#2ecc71", // Green
      arpeggio: "#e74c3c", // Red
      snare: "#f39c12", // Orange
      kick: "#e67e22", // Dark Orange
      hihat: "#f1c40f", // Yellow
      percussion: "#95a5a6", // Gray
    };

    return colors[instrument.toLowerCase()] || "#4a90e2";
  };

  return (
    <div
      className={`flex flex-col bg-gray-800 rounded-md border ${isSelected ? "border-blue-500 shadow-md" : "border-gray-700"} overflow-hidden transition-all duration-200`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center px-3 py-2 bg-gray-700 border-b border-gray-600">
        <div className="font-medium text-white truncate mr-2">{track.name}</div>
        <div className="flex gap-1 items-center">
          <button
            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
              track.muted ? "bg-orange-500 text-white border-orange-600" : "bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500"
            } border transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              onMute(parseInt(track.id));
            }}
            title="Mute Track (Shortcut: Track Number)"
          >
            M
          </button>
          <button
            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
              track.solo ? "bg-green-500 text-white border-green-600" : "bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500"
            } border transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              onSolo(parseInt(track.id));
            }}
            title="Solo Track (Shortcut: Shift+Track Number)"
          >
            S
          </button>
          <button
            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
              track.looping ? "bg-blue-500 text-white border-blue-600" : "bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500"
            } border transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              onLoopToggle(parseInt(track.id));
            }}
            title="Loop Track (Shortcut: Alt+Track Number)"
          >
            L
          </button>
          <button
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold bg-gray-600 text-gray-200 hover:bg-red-500 hover:text-white border border-gray-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(parseInt(track.id));
            }}
            title="Delete Track (Shortcut: Select track and press Delete)"
          >
            X
          </button>
          <div className="flex gap-1 ml-1">
            <button
              className="px-2 py-1 text-xs bg-gray-600 hover:bg-orange-500 text-white rounded border border-gray-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOctaveShift(parseInt(track.id), "down");
              }}
              title="Octave Down (Shortcut: Select track and press Page Down)"
            >
              OCT-
            </button>
            <button
              className="px-2 py-1 text-xs bg-gray-600 hover:bg-blue-500 text-white rounded border border-gray-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOctaveShift(parseInt(track.id), "up");
              }}
              title="Octave Up (Shortcut: Select track and press Page Up)"
            >
              OCT+
            </button>
          </div>
          {onVariationSwitch && (
            <div className="flex gap-1 ml-1">
              {["A", "B", "C", "D"].map((variation) => (
                <button
                  key={variation}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                    (track.currentVariation || "A") === variation
                      ? "bg-purple-600 text-white border-purple-700"
                      : "bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500"
                  } border`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVariationSwitch(parseInt(track.id), variation);
                  }}
                  title={`Switch to Variation ${variation}`}
                >
                  {variation}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="relative min-h-[160px] p-2 bg-gray-900 overflow-hidden">
        {/* Render octave grid lines */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: visibleOctaves }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-gray-800"
              style={{
                top: `${(i / visibleOctaves) * 100}%`,
                height: `${100 / visibleOctaves}%`,
              }}
            >
              <div className="absolute left-1 top-1 text-xs text-gray-500 bg-gray-900 bg-opacity-70 px-1 rounded">
                {track.octave !== undefined ? track.octave + visibleOctaves - 1 - i : 5 - i}
              </div>
              {/* C, D, E, F, G, A, B semitone lines */}
              {["C", "D", "E", "F", "G", "A", "B"].map((note, j) => (
                <div
                  key={note}
                  className="absolute w-full h-[1px] bg-gray-800 bg-opacity-30"
                  style={{
                    top: `${((j * 12) / 84) * (100 / visibleOctaves)}%`,
                  }}
                >
                  <span className="absolute left-1 text-[8px] text-gray-600">{note}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Current variation indicator */}
        {track.currentVariation && (
          <div className="absolute top-1 right-1 bg-purple-600 bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-full z-10">
            Variation: {track.currentVariation}
          </div>
        )}

        {renderNotes(track.notes)}
      </div>

      {/* Show note info when track is selected */}
      {isSelected && track.notes.length > 0 && (
        <div className="flex gap-4 px-3 py-1.5 text-xs bg-gray-800 text-gray-300 border-t border-gray-700">
          <div>Notes: {track.notes.length}</div>
          <div>Octave: {track.octave || 4}</div>
          {track.currentVariation && <div>Variation: {track.currentVariation}</div>}
        </div>
      )}
    </div>
  );
};
