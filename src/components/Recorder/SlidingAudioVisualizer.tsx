import React, { useMemo, useEffect, useRef } from "react";
import { PlaybackVisualizationData } from "@/hooks/useAudioPlaybackWithVisualization";

interface SlidingAudioVisualizerProps {
  visualizationData: PlaybackVisualizationData | null;
  width?: number;
  height?: number;
  className?: string;
  idleMode?: boolean;
  isPlaying?: boolean; // New prop to track playing state
}

const SlidingAudioVisualizer: React.FC<SlidingAudioVisualizerProps> = ({
  visualizationData,
  width = 300,
  height = 60,
  className = "",
  idleMode = false,
  isPlaying = false,
}) => {
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const idleDataRef = useRef<Uint8Array>(new Uint8Array(64).fill(0));
  const transitionStateRef = useRef<"idle" | "fadeIn" | "active" | "fadeOut">("idle");
  const transitionProgressRef = useRef<number>(0);

  // Extract data from visualization if available, or use default values for idle mode
  const frequencyData = visualizationData?.frequencyData || idleDataRef.current;
  const progress = visualizationData?.progress || 0;
  const currentTime = visualizationData?.currentTime || 0;
  const duration = visualizationData?.duration || 60;

  // Calculate sliding window parameters
  const windowSize = Math.min(frequencyData.length, 64); // Max 64 bars for performance
  const barWidth = width / windowSize;
  const maxBarHeight = height - 16; // Leave space for playhead and labels

  // Handle transition state changes based on props
  useEffect(() => {
    // Initialize start time on first render
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    // Transition state management
    if (isPlaying) {
      transitionStateRef.current = "active";
      transitionProgressRef.current = 1;
    } else if (idleMode && !visualizationData) {
      if (transitionStateRef.current === "idle" || transitionStateRef.current === "fadeOut") {
        transitionStateRef.current = "fadeIn";
        transitionProgressRef.current = 0;
      }
    } else {
      if (transitionStateRef.current === "active" || transitionStateRef.current === "fadeIn") {
        transitionStateRef.current = "fadeOut";
        transitionProgressRef.current = 1;
      }
    }
  }, [idleMode, visualizationData, isPlaying]);

  // Idle animation update function - simplified to basic pulsating circles
  useEffect(() => {
    if (isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const updateIdleAnimation = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp;
      const elapsed = timestamp - timeRef.current;

      // Update transition progress
      if (transitionStateRef.current === "fadeIn") {
        transitionProgressRef.current = Math.min(1, transitionProgressRef.current + 0.02);
        if (transitionProgressRef.current >= 1) {
          transitionStateRef.current = "active";
        }
      } else if (transitionStateRef.current === "fadeOut") {
        transitionProgressRef.current = Math.max(0, transitionProgressRef.current - 0.04);
        if (transitionProgressRef.current <= 0) {
          transitionStateRef.current = "idle";
        }
      }

      // Simple earth-tone mountains with gentle pulsating
      const idleData = new Uint8Array(64);

      // Very slow movement for subtle effect
      const slowMovement = elapsed / 8000;

      // Fade-in effect based on startup time
      const totalRuntime = Date.now() - startTimeRef.current;
      const fadeInFactor = Math.min(1, totalRuntime / 5000); // 5-second fade in

      for (let i = 0; i < idleData.length; i++) {
        // Create gentle mountain ranges with multiple sine waves
        const mountain1 = Math.abs(Math.sin((i / idleData.length) * Math.PI * 3 + slowMovement * 0.5)) * 30;
        const mountain2 = Math.abs(Math.sin((i / idleData.length) * Math.PI * 5 + slowMovement * 0.3)) * 20;

        // Base horizon line
        const horizonLine = 10;

        // Pulsating effect - very gentle
        const pulse = Math.sin(elapsed / 3000) * 5;

        // Combine effects with fade-in
        let value = horizonLine + (mountain1 + mountain2 + pulse) * fadeInFactor;

        // Add very minimal noise for texture
        value += (Math.random() - 0.5) * 2;

        // Apply transition state
        const transitionFactor = transitionStateRef.current === "idle" ? 0 : transitionProgressRef.current;

        // Scale value and apply transition
        idleData[i] = Math.floor(value * transitionFactor);
      }

      idleDataRef.current = idleData;
      timeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(updateIdleAnimation);
    };

    animationRef.current = requestAnimationFrame(updateIdleAnimation);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [idleMode, visualizationData, isPlaying]);

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

      // Color handling - earth-tone mountains for idle mode
      let color;

      if (idleMode && !visualizationData) {
        // Simple earth tones
        const heightIntensity = barHeight / maxBarHeight;

        // Earth-tone palette - browns, tans, and soft greens
        const hue = 30 + heightIntensity * 15; // From amber to brown
        const saturation = 60 - heightIntensity * 30; // Less saturated as higher
        const lightness = 25 + heightIntensity * 30; // Darker at bottom, lighter at top

        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } else {
        // Blue to purple range for normal playback
        const hue = 220 + intensity * 60;
        color = `hsl(${hue}, 70%, ${50 + intensity * 30}%)`;
      }

      barsData.push({
        height: Math.max(2, barHeight),
        opacity,
        color,
        x: i * barWidth,
      });
    }

    return barsData;
  }, [frequencyData, progress, windowSize, barWidth, maxBarHeight]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`relative ${className}`} style={{ width, height: height + 30 }}>
      {/* Main visualization area */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ width, height }}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute border-t border-gray-600" style={{ top: `${(i + 1) * 20}%`, left: 0, right: 0 }} />
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
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${width / 2}px`, transform: "translateX(-50%)" }}>
          {/* Playhead indicator */}
          <div className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transform -translate-x-1/2">
            <div className="w-2 h-2 bg-green-400 rounded-full absolute top-0.5 left-0.5 animate-pulse"></div>
          </div>
        </div>

        {/* Progress indicator on sides - fade out when idle */}
        <div
          className="absolute left-2 top-2 text-xs text-gray-400 font-mono transition-opacity duration-500"
          style={{ opacity: idleMode && !visualizationData && !isPlaying ? 0.2 : 1 }}
        >
          {formatTime(Math.max(0, currentTime - duration * 0.1))}
        </div>
        <div
          className="absolute right-2 top-2 text-xs text-gray-400 font-mono transition-opacity duration-500"
          style={{ opacity: idleMode && !visualizationData && !isPlaying ? 0.2 : 1 }}
        >
          {formatTime(Math.min(duration, currentTime + duration * 0.1))}
        </div>

        {/* Waveform overlay for additional visual interest */}
        <div className="absolute bottom-1 left-2 right-2 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Time display and controls - fade out times when idle */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span className="font-mono transition-opacity duration-500" style={{ opacity: idleMode && !visualizationData && !isPlaying ? 0.2 : 1 }}>
          {formatTime(currentTime)}
        </span>
        <div className="flex items-center space-x-2">
          {visualizationData?.isPlaying || isPlaying ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium transition-opacity duration-300">PLAYING</span>
            </>
          ) : (
            <span className="opacity-0">READY</span>
          )}
        </div>
        <span className="font-mono transition-opacity duration-500" style={{ opacity: idleMode && !visualizationData && !isPlaying ? 0.2 : 1 }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Frequency bands indicator removed as requested */}

      {/* Idle mode indicator - simple dots only, no text */}
      {idleMode && !visualizationData && (
        <div
          className="absolute top-2 right-2 flex items-center space-x-1 transition-opacity duration-700"
          style={{
            opacity:
              transitionStateRef.current === "idle"
                ? 0
                : transitionStateRef.current === "fadeIn"
                  ? transitionProgressRef.current * 0.5
                  : transitionStateRef.current === "fadeOut"
                    ? transitionProgressRef.current * 0.5
                    : 0.5,
          }}
        >
          <div className="relative">
            <div className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse" style={{ animationDuration: "2s", boxShadow: "0 0 3px #b45309" }}></div>
          </div>
          <div className="relative">
            <div
              className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse"
              style={{ animationDuration: "2s", animationDelay: "300ms", boxShadow: "0 0 3px #d97706" }}
            ></div>
          </div>
          <div className="relative">
            <div
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"
              style={{ animationDuration: "2s", animationDelay: "600ms", boxShadow: "0 0 3px #f59e0b" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidingAudioVisualizer;
