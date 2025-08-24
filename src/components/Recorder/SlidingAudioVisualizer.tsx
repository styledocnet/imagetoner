import React, { useMemo } from "react";
import { PlaybackVisualizationData } from "@/hooks/useAudioPlaybackWithVisualization";

interface SlidingAudioVisualizerProps {
  visualizationData: PlaybackVisualizationData;
  width?: number;
  height?: number;
  className?: string;
}

const SlidingAudioVisualizer: React.FC<SlidingAudioVisualizerProps> = ({
  visualizationData,
  width = 300,
  height = 60,
  className = "",
}) => {
  const { frequencyData, progress, currentTime, duration } = visualizationData;

  // Calculate sliding window parameters
  const windowSize = Math.min(frequencyData.length, 64); // Max 64 bars for performance
  const barWidth = width / windowSize;
  const maxBarHeight = height - 16; // Leave space for playhead and labels

  // Create sliding window effect based on progress
  const bars = useMemo(() => {
    if (!frequencyData || frequencyData.length === 0) return [];

    // For sliding effect, we want to show a window of frequency data
    // that appears to scroll as the audio progresses
    const totalBars = frequencyData.length;
    const visibleBars = windowSize;

    // Calculate which section of frequency data to show
    // This creates a sliding window effect
    const progressOffset = Math.floor(progress * (totalBars - visibleBars));
    const startIndex = Math.max(0, progressOffset);
    const endIndex = Math.min(totalBars, startIndex + visibleBars);

    const barsData = [];
    for (let i = 0; i < visibleBars; i++) {
      const dataIndex = startIndex + i;
      const value = dataIndex < endIndex ? frequencyData[dataIndex] : 0;

      // Normalize to bar height (0-255 -> 0-maxBarHeight)
      const barHeight = (value / 255) * maxBarHeight;

      // Color based on frequency intensity and position relative to playhead
      const distanceFromCenter = Math.abs(i - visibleBars / 2) / (visibleBars / 2);
      const intensity = value / 255;

      // Bars closer to center (playhead) are more prominent
      const opacity = Math.max(0.3, 1 - distanceFromCenter * 0.7);
      const hue = 220 + (intensity * 60); // Blue to purple range

      barsData.push({
        height: Math.max(2, barHeight),
        opacity,
        color: `hsl(${hue}, 70%, ${50 + intensity * 30}%)`,
        x: i * barWidth,
      });
    }

    return barsData;
  }, [frequencyData, progress, windowSize, barWidth, maxBarHeight]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative ${className}`} style={{ width, height: height + 30 }}>
      {/* Main visualization area */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ width, height }}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-t border-gray-600"
              style={{ top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
            />
          ))}
        </div>

        {/* Frequency bars */}
        <svg width={width} height={height} className="absolute inset-0">
          {bars.map((bar, index) => (
            <rect
              key={index}
              x={bar.x}
              y={height - bar.height - 8}
              width={Math.max(1, barWidth - 1)}
              height={bar.height}
              fill={bar.color}
              opacity={bar.opacity}
              rx={0.5}
            />
          ))}
        </svg>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${width / 2}px`, transform: 'translateX(-50%)' }}
        >
          {/* Playhead indicator */}
          <div className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transform -translate-x-1/2">
            <div className="w-2 h-2 bg-green-400 rounded-full absolute top-0.5 left-0.5 animate-pulse"></div>
          </div>
        </div>

        {/* Progress indicator on sides */}
        <div className="absolute left-2 top-2 text-xs text-gray-400 font-mono">
          {formatTime(Math.max(0, currentTime - duration * 0.1))}
        </div>
        <div className="absolute right-2 top-2 text-xs text-gray-400 font-mono">
          {formatTime(Math.min(duration, currentTime + duration * 0.1))}
        </div>

        {/* Waveform overlay for additional visual interest */}
        <div className="absolute bottom-1 left-2 right-2 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Time display and controls */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>PLAYING</span>
        </div>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>

      {/* Frequency bands indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-gray-600 rounded-full transition-all duration-150"
            style={{
              height: `${4 + (bars[i * Math.floor(bars.length / 8)]?.height || 0) / maxBarHeight * 8}px`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SlidingAudioVisualizer;
