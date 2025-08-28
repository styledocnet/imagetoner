// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";
import { Track } from "../../types/audio/audiotimeline";

interface TimelineMinimapProps {
  tracks: Track[];
  visibleTimeRange: {
    start: number;
    end: number;
  };
  zoom: number;
  onRangeChange: (range: { start: number; end: number }) => void;
}

export default function TimelineMinimap({ tracks, visibleTimeRange, onRangeChange }: TimelineMinimapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [viewportOffset, setViewportOffset] = useState(visibleTimeRange.start);

  // Calculate dimensions and scaling
  const calculatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, position));
  }, []);

  // Handle mouse interactions
  const handleMouseDown = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(calculatePosition(e.clientX));
  };

  const handleMouseMove = useCallback(
    (e: any) => {
      if (!isDragging) return;

      const currentPos = calculatePosition(e.clientX);
      const delta = currentPos - dragStart;
      const rangeWidth = visibleTimeRange.end - visibleTimeRange.start;
      const maxStart = Math.max(0, 1 - rangeWidth);
      const newStart = Math.min(maxStart, Math.max(0, viewportOffset + delta));

      onRangeChange({
        start: newStart,
        end: newStart + rangeWidth,
      });
    },
    [isDragging, dragStart, visibleTimeRange, viewportOffset, onRangeChange, calculatePosition],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  // Update viewport offset when visible range changes
  useEffect(() => {
    setViewportOffset(visibleTimeRange.start);
  }, [visibleTimeRange.start]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="relative h-full w-full rounded cursor-pointer shinglass"
        style={{ backgroundColor: "#111827" }}
        onMouseDown={handleMouseDown}
      >
        {/* Track previews */}
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="absolute h-1 rounded"
            style={{
              top: `${(index * 100) / Math.max(tracks.length, 1)}%`,
              backgroundColor: track.color,
              opacity: track.mute ? 0.3 : 0.7,
              left: 0,
              right: 0,
            }}
          >
            {/* Note indicators */}
            {track.notes.map((note) => (
              <div
                key={note.id}
                className="absolute h-full"
                style={{
                  left: `${(note.start / track.length) * 100}%`,
                  width: `${(note.length / track.length) * 100}%`,
                  backgroundColor: track.color,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        ))}

        {/* Viewport indicator */}
        <div
          className="absolute h-full rounded shinitem-shadowfocus"
          style={{
            left: `${visibleTimeRange.start * 100}%`,
            width: `${(visibleTimeRange.end - visibleTimeRange.start) * 100}%`,
            boxShadow: "0 0 4px rgba(59, 130, 246, 0.5)",
            borderWidth: "1px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "#3b82f6",
          }}
        >
          {/* Drag handles */}
          <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize shin-border-glow" style={{ backgroundColor: "#3b82f6" }} />
          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize shin-border-glow" style={{ backgroundColor: "#3b82f6" }} />
        </div>
      </div>
    </div>
  );
}
