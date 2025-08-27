import React, { useRef, useEffect } from "react";
import { Track } from "../../types/audio/audiotimeline";
import { Note, InstrumentType } from "@/types/audio";
import { createNote } from "@/utils/idGen";

interface TimelineTrackProps {
  track: Track;
  currentStep: number;
  zoom: number;
  onAddNote: (note: Note) => void;
  onNoteRemove?: (noteId: string) => void;
  visibleOctaves?: number;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({ track, currentStep, zoom, onAddNote, onNoteRemove, visibleOctaves = 2 }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Update cursor position when currentStep changes
  useEffect(() => {
    if (gridRef.current && cursorRef.current) {
      const stepWidth = gridRef.current.offsetWidth / track.length;
      const position = currentStep * stepWidth;
      cursorRef.current.style.left = `${position}px`;
      cursorRef.current.style.transform = `none`;
      cursorRef.current.style.opacity = "1";
    }
  }, [currentStep, track.length, zoom]);

  // Handle click on grid to add or remove notes
  const handleGridClick = (e: React.MouseEvent) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate step position based on click X, accounting for zoom
    const stepPosition = Math.floor((clickX / (rect.width * zoom)) * track.length);

    // Calculate pitch based on click Y (simple 12-note scale)
    const pitchRow = Math.floor((1 - clickY / rect.height) * 12 * visibleOctaves);
    const pitches = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    // Get octave from track
    const baseOctave = track.octave || 4;
    const octaveAdjustment = track.octaveOffset || 0;

    const octave = baseOctave + octaveAdjustment + Math.floor(pitchRow / 12);
    const pitch = `${pitches[pitchRow % 12]}${octave}`;

    // Check if a note already exists at this position and with this pitch
    const existingNote = track.notes
      .filter((note) => !note.variation || note.variation === (track.currentVariation || "A"))
      .find((note) => {
        const notePitch = note.pitch;
        const noteStart = note.start;
        return notePitch === pitch && noteStart === stepPosition;
      });

    // If a note exists, remove it; otherwise, add a new one
    if (existingNote && onNoteRemove) {
      onNoteRemove(existingNote.id);
    } else {
      // Create new note
      const newNote = createNote({
        start: stepPosition,
        pitch,
        instrument: track.instrument as InstrumentType,
        // Using any to add the variation property that exists at runtime
        ...(track.currentVariation ? { variation: track.currentVariation } : ({ variation: "A" } as any)),
      });

      onAddNote(newNote);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Piano roll header */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
        {/* Track octave indicator */}
        <div className="w-12 bg-gray-700 border-r border-gray-600 text-xs text-white flex items-center justify-center font-medium">OCT {track.octave || 4}</div>
        {/* Generate measure markers */}
        {Array.from({ length: Math.ceil(track.length / 4) }).map((_, i) => (
          <div key={i} className="flex-1 min-w-[30px] border-r border-gray-700 text-xs text-white flex items-center justify-center">
            <span className="px-1">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div
        ref={gridRef}
        className="relative flex-1 bg-gray-800 grid"
        style={{
          gridTemplateColumns: `repeat(${track.length}, minmax(${10 * zoom}px, 1fr))`,
          gridTemplateRows: `repeat(${12 * visibleOctaves}, 1fr)`, // 12 semitones per octave
          cursor: "pointer",
          overflowX: "auto",
          width: "100%",
          position: "relative",
          height: "100%",
        }}
        onClick={handleGridClick}
      >
        {/* Grid cells */}
        {Array.from({ length: track.length * 12 * visibleOctaves }).map((_, idx) => {
          const col = idx % track.length;
          const row = Math.floor(idx / track.length);
          const isBlackKey = [1, 3, 6, 8, 10].includes(row % 12);
          const isMeasureStart = col % 4 === 0;
          const isBeatStart = col % 1 === 0;

          return (
            <div
              key={idx}
              className={`border-r border-b ${isBlackKey ? "bg-gray-700" : ""}
                ${isMeasureStart ? "border-l border-gray-600" : ""}
                ${isBeatStart ? "border-r-gray-600" : "border-r-gray-800"}`}
            />
          );
        })}

        {/* Notes - filter by current variation if available */}
        {track.notes
          .filter((note) => !note.variation || note.variation === track.currentVariation)
          .map((note) => {
            // Calculate position based on note properties
            const noteStartPercent = (note.start / track.length) * 100;
            const noteWidthPercent = Math.max(2, (note.length / track.length) * 100); // Ensure minimum width

            // Calculate vertical position based on pitch
            const pitchParts = note.pitch.match(/([A-G]#?)(\d+)/);
            if (!pitchParts) return null;

            const [, noteName, octave] = pitchParts;
            const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            const noteIndex = noteNames.indexOf(noteName);

            // Get current base octave
            const trackOctave = track.octave || 4;
            const octaveOffset = (parseInt(octave, 10) - trackOctave) * 12;
            const pitchIndex = noteIndex + octaveOffset;
            // Invert the position across all visible octaves (higher notes at top)
            const totalRows = 12 * visibleOctaves;
            const rowPosition = totalRows - 1 - (pitchIndex % totalRows);

            return (
              <div
                key={note.id}
                className={`absolute bg-blue-500 rounded-sm opacity-80 hover:opacity-100 hover:z-20 hover:outline hover:outline-2 hover:outline-white hover:cursor-pointer hover:scale-105 transition-all duration-150 ${note.isGhost ? "border border-dashed border-white/50 bg-opacity-60 h-3" : ""}`}
                style={{
                  left: `${noteStartPercent}%`,
                  top: `${(rowPosition / 12) * 100}%`,
                  width: `${noteWidthPercent}%`,
                  height: `${100 / 12}%`,
                  backgroundColor: track.color,
                  zIndex: 10,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  filter: track.name.includes("Arpeggio") ? "brightness(1.2) saturate(1.2)" : "none",
                }}
              >
                {/* Note indicator only - deletion happens by toggling */}
                <div className="text-xs text-white font-light opacity-70 px-1 truncate" title={`${note.pitch} (Click to remove)`}>
                  {note.pitch}
                </div>
              </div>
            );
          })}

        {/* Playhead cursor */}
        <div
          ref={cursorRef}
          className="absolute top-0 left-0 h-full w-[2px] bg-red-500 pointer-events-none z-20"
          style={{
            boxShadow: "0 0 4px rgba(255, 0, 0, 0.7)",
            transition: "left 50ms linear",
          }}
        />
      </div>

      {/* Variation display */}
      {track.currentVariation && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-30">{track.currentVariation}</div>
      )}
    </div>
  );
};

// Using Tailwind classes instead of CSS styles hack

export default TimelineTrack;
