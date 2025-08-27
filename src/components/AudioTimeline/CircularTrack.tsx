import React, { useRef, useState, useEffect } from "react";
import { Track, ChordConfig } from "../../types/audio/audiotimeline";
import { Note, InstrumentType } from "@/types/audio";
import { createNote } from "@/utils/idGen";
import { generateScalePositions, getChordByDegree } from "@/utils/audio/scales";

interface CircularTrackProps {
  track: Track;
  currentStep: number;
  onAddNote: (note: Note) => void;
}

const CircularTrack: React.FC<CircularTrackProps> = ({ track, currentStep, onAddNote }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [activeDegree, setActiveDegree] = useState<number | null>(null);
  const [chordConfig, setChordConfig] = useState<ChordConfig>({
    degree: 1,
    numNotes: 3,
    step: 2,
  });

  // Ensure track has valid scale information
  const rootNote = track.rootNote || "C";
  const scaleName = track.scaleName || "major";
  const scaleNotes = track.scaleNotes || [];

  // Set up canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    // Match canvas size to container
    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Draw the circular scale and cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate center and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;

    // Generate scale positions
    const notePositions = generateScalePositions(rootNote, scaleName, canvas.width, canvas.height, radius);

    // Draw circular guide
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw scale notes
    notePositions.forEach((pos, index) => {
      const isCurrentDegree = index + 1 === activeDegree;
      const noteRadius = isCurrentDegree ? 12 : 8;

      // Draw note circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, noteRadius, 0, Math.PI * 2);
      ctx.fillStyle = isCurrentDegree ? track.color : `${track.color}80`;
      ctx.fill();

      // Draw note name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = isCurrentDegree ? "bold 12px Arial" : "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pos.note, pos.x, pos.y);

      // Draw degree number
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "9px Arial";
      ctx.fillText(`${index + 1}`, pos.x, pos.y + noteRadius + 10);
    });

    // Draw playhead
    const angle = (currentStep / track.length) * Math.PI * 2 - Math.PI / 2; // Start from top
    const playheadX = centerX + (radius + 20) * Math.cos(angle);
    const playheadY = centerY + (radius + 20) * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(playheadX, playheadY);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(playheadX, playheadY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    // Draw track step indicators around the outer circle
    for (let i = 0; i < track.length; i++) {
      const stepAngle = (i / track.length) * Math.PI * 2 - Math.PI / 2;
      const stepRadius = radius + 10;
      const stepX = centerX + stepRadius * Math.cos(stepAngle);
      const stepY = centerY + stepRadius * Math.sin(stepAngle);

      ctx.beginPath();
      ctx.arc(stepX, stepY, i % 4 === 0 ? 3 : 1, 0, Math.PI * 2);
      ctx.fillStyle = i === currentStep ? "red" : "rgba(255, 255, 255, 0.3)";
      ctx.fill();
    }

    // Highlight active notes
    track.notes.forEach((note) => {
      if (note.start === currentStep) {
        // Find which position(s) in the scale this note corresponds to
        const noteName = note.pitch.replace(/\d+$/, ""); // Remove octave
        const notePositionIndex = notePositions.findIndex((pos) => pos.note === noteName);

        if (notePositionIndex >= 0) {
          const pos = notePositions[notePositionIndex];

          // Draw highlight effect
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = `${track.color}50`;
          ctx.fill();

          // Draw ripple effect
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
          ctx.strokeStyle = track.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = `${track.color}30`;
    ctx.fill();
    ctx.strokeStyle = track.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw root note in center
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rootNote, centerX, centerY - 10);
    ctx.font = "12px Arial";
    ctx.fillText(scaleName, centerX, centerY + 10);
  }, [track, currentStep, rootNote, scaleName, scaleNotes, activeDegree]);

  // Handle click on the canvas to add notes
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate center and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;

    // Generate scale positions
    const notePositions = generateScalePositions(rootNote, scaleName, canvas.width, canvas.height, radius);

    // Check if click is on a scale note
    for (let i = 0; i < notePositions.length; i++) {
      const pos = notePositions[i];
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));

      if (distance <= 12) {
        // Clicked on a scale note
        const degree = i + 1;
        setActiveDegree(degree);

        // Generate chord for this degree
        const chord = getChordByDegree(rootNote, scaleName, degree, chordConfig.numNotes, chordConfig.step);

        // Calculate step position based on angle from center
        const angle = Math.atan2(y - centerY, x - centerX);
        const normalizedAngle = (angle + Math.PI * 2.5) % (Math.PI * 2); // Normalize to 0-2π starting from top
        const stepPosition = Math.floor((normalizedAngle / (Math.PI * 2)) * track.length);

        // Add notes for the chord
        chord.forEach((noteName, idx) => {
          // Add octave based on position in chord
          const octave = 4 + Math.floor(idx / 7) - Math.floor(chord.length / 7);
          const pitch = `${noteName}${octave}`;

          const newNote = createNote({
            start: stepPosition,
            length: 1,
            pitch,
            instrument: track.instrument as InstrumentType,
            velocity: 100 - idx * 10, // Velocity decreases for higher chord notes
          });

          onAddNote(newNote);
        });

        break;
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900 rounded">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer" onClick={handleCanvasClick} />

      {/* Controls for chord configuration */}
      <div className="absolute bottom-4 left-4 right-4 bg-gray-800 bg-opacity-80 p-2 rounded flex items-center gap-3 text-xs text-white">
        <div className="flex flex-col">
          <label>Degree</label>
          <input
            type="number"
            min="1"
            max="7"
            value={chordConfig.degree}
            onChange={(e) => setChordConfig({ ...chordConfig, degree: parseInt(e.target.value) || 1 })}
            className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-center text-xs"
          />
        </div>

        <div className="flex flex-col">
          <label>Notes</label>
          <input
            type="number"
            min="2"
            max="6"
            value={chordConfig.numNotes}
            onChange={(e) => setChordConfig({ ...chordConfig, numNotes: parseInt(e.target.value) || 3 })}
            className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-center text-xs"
          />
        </div>

        <div className="flex flex-col">
          <label>Step</label>
          <input
            type="number"
            min="1"
            max="3"
            value={chordConfig.step}
            onChange={(e) => setChordConfig({ ...chordConfig, step: parseInt(e.target.value) || 2 })}
            className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-white text-center text-xs"
          />
        </div>

        <div className="flex-1 text-right text-xs text-gray-400">Click on a note to add a chord at the current position</div>
      </div>
    </div>
  );
};

export default CircularTrack;
