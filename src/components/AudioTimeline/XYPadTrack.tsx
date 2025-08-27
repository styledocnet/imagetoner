import React, { useRef, useState, useEffect } from "react";
import { Track } from "../../types/audio/audiotimeline";
import { Note, InstrumentType } from "@/types/audio";
import { createNote } from "@/utils/idGen";

interface XYPadTrackProps {
  track: Track;
  currentStep: number;
  onAddNote: (note: Note) => void;
}

const XYPadTrack: React.FC<XYPadTrackProps> = ({ track, currentStep, onAddNote }) => {
  const padRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [activeTaps, setActiveTaps] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Ensure track has a valid length
  const trackLength = Math.max(1, track.length);

  // Filter notes to get only those that are triggered at the current step
  useEffect(() => {
    const notesAtCurrentStep = track.notes.filter((note) => note.start === currentStep);

    setActiveTaps(notesAtCurrentStep.map((note) => note.id));

    // Clear active taps after a short delay
    const timeout = setTimeout(() => {
      setActiveTaps([]);
    }, 200);

    // Update cursor position using percentage (more reliable than pixels)
    if (padRef.current && cursorRef.current) {
      const percentage = (currentStep / track.length) * 100;
      cursorRef.current.style.left = `${percentage}%`;

      // Detect if we're actively playing based on step changes
      if (!isPlaying && currentStep > 0) {
        setIsPlaying(true);
      } else if (currentStep === 0 && isPlaying) {
        // Reset when we loop back to the beginning
        setIsPlaying(false);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentStep, track.notes, track.length]);

  const handlePadClick = (e: React.MouseEvent) => {
    if (!padRef.current) return;

    const rect = padRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // X determines the step position
    const stepPosition = Math.floor(x * track.length);

    // Y determines the pitch (using a pentatonic scale for simplicity)
    const pitchValue = 1 - y; // 0 at bottom, 1 at top
    const pitchOptions = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4", "C5"];
    const pitchIndex = Math.floor(pitchValue * pitchOptions.length);
    const pitch = pitchOptions[Math.min(pitchIndex, pitchOptions.length - 1)];

    // Create a new tap note
    const newNote = createNote({
      start: stepPosition,
      length: 1, // Add explicit length for better audio playback
      pitch,
      instrument: track.instrument as InstrumentType,
      // For XY mode, add coordinates for visualization
      velocity: Math.floor(y * 127), // Use Y for velocity (0-127)
    });

    // Show visual feedback when adding a note
    setActiveTaps((prev) => [...prev, newNote.id]);
    setTimeout(() => {
      setActiveTaps((prev) => prev.filter((id) => id !== newNote.id));
    }, 300);

    onAddNote(newNote);
  };

  return (
    <div ref={padRef} className="relative w-full h-full bg-gray-900 border border-gray-700 rounded" onClick={handlePadClick}>
      {/* Grid lines for visual reference */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <React.Fragment key={`h-${i}`}>
            <div className="w-full h-[1px] bg-gray-800 dark:bg-gray-700 absolute" style={{ top: `${(i + 1) * 12.5}%` }} />
            <div className="h-full w-[1px] bg-gray-800 dark:bg-gray-700 absolute" style={{ left: `${(i + 1) * 12.5}%` }} />
          </React.Fragment>
        ))}
      </div>

      {/* Step indicators */}
      <div className="absolute top-0 left-0 right-0 h-4 flex items-center pointer-events-none">
        {Array.from({ length: track.length }).map((_, i) => (
          <div key={`step-${i}`} className={`h-1 flex-1 ${currentStep === i ? "bg-red-500" : "bg-gray-700"}`} style={{ opacity: i % 4 === 0 ? 0.8 : 0.4 }} />
        ))}
      </div>

      {/* Beat markers (every 4 steps) */}
      <div className="absolute top-5 left-0 right-0 flex justify-between px-2 pointer-events-none">
        {Array.from({ length: Math.ceil(track.length / 4) }).map((_, i) => (
          <div
            key={`beat-${i}`}
            className="text-xs text-gray-400 dark:text-gray-300"
            style={{ position: "absolute", left: `${((i * 4) / track.length) * 100}%` }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Render all tap notes as circles */}
      {track.notes.map((note) => {
        // Calculate position based on note properties
        const xPos = (note.start / track.length) * 100;
        const yPos = note.velocity ? (note.velocity / 127) * 100 : 50;

        // Size based on velocity or a default size
        const size = note.velocity ? 10 + (note.velocity / 127) * 20 : 20;

        // Check if this note is currently active
        const isActive = activeTaps.includes(note.id);

        return (
          <div
            key={note.id}
            className={`absolute rounded-full ${isActive ? "animate-ping" : ""}`}
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: isActive ? "white" : track.color,
              opacity: isActive ? 0.9 : 0.7,
              transform: "translate(-50%, -50%)",
              transition: "background-color 0.2s ease",
              zIndex: isActive ? 20 : 10,
            }}
          />
        );
      })}

      {/* Current position indicator */}
      <div
        ref={cursorRef}
        className="absolute top-0 bottom-0 w-[2px] bg-red-500 pointer-events-none"
        style={{
          left: `${(currentStep / trackLength) * 100}%`,
          zIndex: 30,
          boxShadow: "0 0 4px rgba(255, 0, 0, 0.7)",
          transition: "left 50ms linear",
          opacity: isPlaying ? (currentStep % 2 === 0 ? 1 : 0.6) : 1,
        }}
      />
    </div>
  );
};

export default XYPadTrack;
