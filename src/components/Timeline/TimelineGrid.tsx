import React, { useRef, useEffect } from "react";
import { Note } from "@/types/audio";

interface TimelineGridProps {
  gridLength: number;
  zoomLevel: number;
  currentStep: number;
  notes: Note[];
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ gridLength, zoomLevel, currentStep, notes }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current && cursorRef.current) {
      const stepWidth = gridRef.current.offsetWidth / gridLength;
      cursorRef.current.style.transform = `translateX(${
        currentStep * stepWidth * zoomLevel // Adjust cursor position based on zoom
      }px)`;
    }
  }, [currentStep, gridLength, zoomLevel]);

  return (
    <div
      ref={gridRef}
      className="relative w-full max-w-4xl bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
      style={{
        height: "200px",
        display: "grid",
        gridTemplateColumns: `repeat(${gridLength}, ${10 * zoomLevel}px)`, // Adjust grid columns based on zoom
      }}
    >
      {/* Grid Lines */}
      {Array.from({ length: gridLength }).map((_, idx) => (
        <div key={idx} className={`border-r border-gray-600 ${idx % 4 === 0 ? "bg-gray-700" : ""}`}></div>
      ))}

      {/* Notes */}
      {notes.map((note, idx) => {
        const noteStartPosition = (note.start / gridLength) * 100; // Position based on grid length
        // const baseWidth = 20; // Base width of 2px for each note
        // NaN: const noteWidth = Math.max(baseWidth, note.duration * zoomLevel); // Minimum width of 2px
        const noteWidth = 20; // Minimum width of 2px
        // console.log(noteWidth);
        return (
          <div
            key={idx}
            className="absolute bg-blue-500 rounded"
            style={{
              left: `${noteStartPosition}%`, // Position note relative to grid length
              top: `${50 - idx * 10}px`, // Adjust vertical position of notes
              width: `${noteWidth}px`, // Adjust width based on zoom level (with base width)
              height: "20px",
            }}
          ></div>
        );
      })}

      {/* Cursor */}
      <div ref={cursorRef} className="absolute top-0 left-0 h-full w-[2px] bg-red-500 pointer-events-none"></div>
    </div>
  );
};

export default TimelineGrid;
