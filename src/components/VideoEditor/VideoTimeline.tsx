import React, { useState, useRef, useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { VideoTrack, VideoEffect, Keyframe } from "../../storage/videoStorage";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  BackwardIcon,
  ForwardIcon,
  PlusIcon,
  ScissorsIcon,
  EyeIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface VideoTimelineProps {
  tracks: VideoTrack[];
  duration: number;
  currentTime: number;
  fps: number;
  isPlaying: boolean;
  onTracksChange: (tracks: VideoTrack[]) => void;
  onCurrentTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onStop: () => void;
  onAddTrack: (type: "image" | "audio" | "video") => void;
  onDeleteTrack: (trackId: string) => void;
  onSplitTrack: (trackId: string, time: number) => void;
  onAddEffect: (trackId: string, effect: VideoEffect) => void;
  onAddKeyframe: (trackId: string, keyframe: Keyframe) => void;
}

const VideoTimeline: React.FC<VideoTimelineProps> = ({
  tracks,
  duration,
  currentTime,
  fps,
  isPlaying,
  onTracksChange,
  onCurrentTimeChange,
  onPlayPause,
  onStop,
  onAddTrack,
  onDeleteTrack,
  onSplitTrack,
  onAddEffect,
  onAddKeyframe,
}) => {
  // State
  const [zoom, setZoom] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    trackId: string;
    type: "track" | "effect" | "keyframe" | "resize";
    edge?: "start" | "end";
    startX: number;
    startTime: number;
    startWidth?: number;
  } | null>(null);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showKeyframesPanel, setShowKeyframesPanel] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);

  // Timeline dimensions
  const pixelsPerSecond = 50 * zoom;
  const trackHeight = 80;
  const trackSpacing = 8; // Y offset between tracks
  const timelineWidth = Math.max(duration * pixelsPerSecond, 1000); // Ensure minimum width

  // Time and pixel conversion utilities
  const timeToPixel = useCallback((time: number) => time * pixelsPerSecond, [pixelsPerSecond]);
  const pixelToTime = useCallback((pixel: number) => pixel / pixelsPerSecond, [pixelsPerSecond]);

  // Timeline hover effect
  const handleTimelineHover = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverPosition(x);
  }, []);

  // Handle timeline click to set current time
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + (timelineRef.current.scrollLeft || 0);
      const time = Math.max(0, Math.min(duration, pixelToTime(x)));
      onCurrentTimeChange(time);
    },
    [timelineRef, duration, pixelToTime, onCurrentTimeChange],
  );

  // Handle track dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, trackId: string, type: "track" | "effect" | "keyframe") => {
      e.stopPropagation();
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      setSelectedTrack(trackId);
      setIsDragging(true);
      setDragInfo({
        trackId,
        type,
        startX: e.clientX,
        startTime: track.startTime,
      });

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [tracks],
  );

  // Handle track resizing
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, trackId: string, edge: "start" | "end") => {
      e.stopPropagation();
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      setSelectedTrack(trackId);
      setIsDragging(true);
      setDragInfo({
        trackId,
        type: "resize",
        edge,
        startX: e.clientX,
        startTime: edge === "start" ? track.startTime : track.endTime,
        startWidth: track.duration,
      });

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [tracks],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragInfo || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragInfo.startX;
      const deltaTime = pixelToTime(deltaX);

      if (dragInfo.type === "resize") {
        // Handle track resizing
        const track = tracks.find((t) => t.id === dragInfo.trackId);
        if (!track) return;

        const updatedTracks = tracks.map((t) => {
          if (t.id === dragInfo.trackId && dragInfo.edge) {
            if (dragInfo.edge === "start") {
              // Resizing from the start edge
              const newStartTime = Math.max(0, Math.min(dragInfo.startTime + deltaTime, t.endTime - 0.1));
              return {
                ...t,
                startTime: newStartTime,
                duration: t.endTime - newStartTime,
              };
            } else {
              // Resizing from the end edge
              const newEndTime = Math.max(t.startTime + 0.1, dragInfo.startTime + deltaTime);
              return {
                ...t,
                endTime: newEndTime,
                duration: newEndTime - t.startTime,
              };
            }
          }
          return t;
        });

        onTracksChange(updatedTracks);
      } else if (dragInfo.type === "track") {
        // Handle track dragging
        const newStartTime = Math.max(0, dragInfo.startTime + deltaTime);

        const updatedTracks = tracks.map((track) => {
          if (track.id === dragInfo.trackId) {
            const newEndTime = newStartTime + track.duration;
            return {
              ...track,
              startTime: newStartTime,
              endTime: newEndTime,
            };
          }
          return track;
        });

        onTracksChange(updatedTracks);
      }
    },
    [isDragging, dragInfo, tracks, onTracksChange, pixelToTime],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragInfo(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // Keyboard shortcuts
  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      onPlayPause();
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    "shift+s",
    (e) => {
      e.preventDefault();
      if (selectedTrack) {
        onSplitTrack(selectedTrack, currentTime);
      }
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    "delete,backspace",
    (e) => {
      e.preventDefault();
      if (selectedTrack) {
        onDeleteTrack(selectedTrack);
        setSelectedTrack(null);
      }
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    "left",
    (e) => {
      e.preventDefault();
      onCurrentTimeChange(Math.max(0, currentTime - (e.shiftKey ? 1 : 0.1)));
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    "right",
    (e) => {
      e.preventDefault();
      onCurrentTimeChange(Math.min(duration, currentTime + (e.shiftKey ? 1 : 0.1)));
    },
    { enableOnFormTags: true },
  );

  // Toggle track properties
  const toggleTrackProperty = useCallback(
    (trackId: string, property: "enabled" | "muted") => {
      const updatedTracks = tracks.map((track) => {
        if (track.id === trackId) {
          if (property === "enabled") {
            return { ...track, enabled: !track.enabled };
          } else {
            return { ...track, volume: track.volume === 0 ? 0.8 : 0 };
          }
        }
        return track;
      });
      onTracksChange(updatedTracks);
    },
    [tracks, onTracksChange],
  );

  // Add transition effect between tracks
  const addTransition = useCallback(
    (trackId: string) => {
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      const transitionEffect: VideoEffect = {
        id: `transition_${Date.now()}`,
        type: "transition",
        name: "Fade",
        startTime: track.startTime,
        endTime: track.startTime + 0.5,
        enabled: true,
        parameters: {
          type: "fade",
          duration: 0.5,
          easing: "ease-in-out",
        },
      };

      onAddEffect(trackId, transitionEffect);
    },
    [tracks, onAddEffect],
  );

  // Add keyframe for property animation
  const addPropertyKeyframe = useCallback(
    (trackId: string, property: string) => {
      const keyframe: Keyframe = {
        id: `keyframe_${Date.now()}`,
        property,
        time: currentTime,
        value: property === "opacity" ? 1.0 : property === "volume" ? 0.8 : 0,
        easing: "ease-in-out",
      };

      onAddKeyframe(trackId, keyframe);
    },
    [currentTime, onAddKeyframe],
  );

  // Format time display
  const formatTime = useCallback(
    (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const frames = Math.floor((time % 1) * fps);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
    },
    [fps],
  );

  // Get track color based on type
  const getTrackColor = useCallback((type: string) => {
    switch (type) {
      case "image":
        return "bg-green-500";
      case "audio":
        return "bg-purple-500";
      case "video":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  }, []);

  // Auto-scroll to current time when it changes
  useEffect(() => {
    if (timelineRef.current && playheadRef.current) {
      const container = timelineRef.current;
      const playheadX = timeToPixel(currentTime);
      const containerWidth = container.clientWidth;

      // Check if playhead is outside visible area
      if (playheadX < container.scrollLeft || playheadX > container.scrollLeft + containerWidth) {
        container.scrollLeft = playheadX - containerWidth / 2;
      }
    }
  }, [currentTime, timeToPixel]);

  // Render a track item directly
  const renderTrackItem = (track: VideoTrack, index: number) => {
    return (
      <div
        key={`track-${track.id}-${index}`}
        className="relative border-b border-gray-700"
        style={{
          height: trackHeight,
          marginTop: index > 0 ? trackSpacing : 0,
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Track Block */}
        <div
          className={`absolute top-2 bottom-2 rounded cursor-move ${getTrackColor(track.type)} bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 z-10 ${
            selectedTrack === track.id ? "ring-2 ring-blue-400" : ""
          }`}
          style={{
            left: timeToPixel(track.startTime),
            width: Math.max(timeToPixel(track.duration), 50),
          }}
          onMouseDown={(e) => handleMouseDown(e, track.id, "track")}
        >
          {/* Track Content */}
          <div className="p-2 h-full flex items-center justify-between text-xs">
            <div className="text-white font-medium truncate">{track.name}</div>
            {track.type === "audio" && track.volume !== undefined && <div className="text-white opacity-75">Vol: {Math.round((track.volume || 0) * 100)}%</div>}
            {(track.type === "image" || track.type === "video") && track.opacity !== undefined && (
              <div className="text-white opacity-75">Opacity: {Math.round((track.opacity || 1) * 100)}%</div>
            )}
          </div>

          {/* Resize Handles */}
          <div
            className="absolute left-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-20 z-20"
            onMouseDown={(e) => handleResizeMouseDown(e, track.id, "start")}
          />
          <div
            className="absolute right-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-20 z-20"
            onMouseDown={(e) => handleResizeMouseDown(e, track.id, "end")}
          />

          {/* Effects Indicators */}
          {track.effects.map((effect) => (
            <div
              key={effect.id}
              className="absolute top-0 h-2 bg-yellow-400 rounded-full"
              style={{
                left: timeToPixel(effect.startTime - track.startTime),
                width: timeToPixel(effect.endTime - effect.startTime),
              }}
            />
          ))}

          {/* Keyframes */}
          {track.keyframes.map((keyframe) => (
            <div
              key={keyframe.id}
              className="absolute top-1 w-3 h-3 bg-orange-400 rounded-full border border-white"
              style={{
                left: timeToPixel(keyframe.time - track.startTime) - 4,
              }}
            />
          ))}
        </div>

        {/* Quick Actions */}
        {selectedTrack === track.id && (
          <div className="absolute top-1 right-1 flex space-x-1 z-10">
            <button onClick={() => addTransition(track.id)} className="p-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs" title="Add Transition">
              <AdjustmentsHorizontalIcon className="w-3 h-3" />
            </button>
            <button onClick={() => onSplitTrack(track.id, currentTime)} className="p-1 bg-red-600 hover:bg-red-700 rounded text-xs" title="Split at Playhead">
              <ScissorsIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            title="Stop"
          >
            <StopIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onCurrentTimeChange(Math.max(0, currentTime - 1))}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
            title="Previous Second (Left Arrow)"
          >
            <BackwardIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCurrentTimeChange(Math.min(duration, currentTime + 1))}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
            title="Next Second (Right Arrow)"
          >
            <ForwardIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm font-mono bg-gray-700 px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Zoom:</label>
            <input type="range" min="0.25" max="4" step="0.25" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-20" />
            <span className="text-sm w-8 bg-gray-700 px-2 py-1 rounded">{zoom}x</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${showEffectsPanel ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
            title="Toggle Effects Panel"
          >
            Effects
          </button>
          <button
            onClick={() => setShowKeyframesPanel(!showKeyframesPanel)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${showKeyframesPanel ? "bg-green-600" : "bg-gray-600 hover:bg-gray-500"}`}
            title="Toggle Keyframes Panel"
          >
            Keyframes
          </button>
        </div>
      </div>

      {/* Add Track Buttons */}
      <div className="flex items-center space-x-2 p-3 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">Add Track:</span>
        <button
          onClick={() => onAddTrack("image")}
          className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
          title="Add Image Track"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Image
        </button>
        <button
          onClick={() => onAddTrack("audio")}
          className="flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
          title="Add Audio Track"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Audio
        </button>
        <button
          onClick={() => onAddTrack("video")}
          className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          title="Add Video Track"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Video
        </button>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {/* Add a spacer to match the time ruler height */}
          <div className="h-8 bg-gray-700 border-b border-gray-600 sticky top-0 z-20"></div>
          <div>
            {tracks.map((track, index) => (
              <div
                key={`track-header-${track.id}`}
                className={`flex items-center justify-between p-3 border-b border-gray-700 ${
                  selectedTrack === track.id ? "bg-gray-700" : "hover:bg-gray-700/50"
                }`}
                style={{
                  height: trackHeight,
                  marginTop: index > 0 ? trackSpacing : 0,
                }}
                onClick={() => setSelectedTrack(track.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-3 h-3 rounded ${getTrackColor(track.type)}`} />
                    <span className="text-sm font-medium truncate">{track.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Layer {track.layer} • {track.duration.toFixed(1)}s
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackProperty(track.id, "enabled");
                    }}
                    className={`p-1 rounded ${track.enabled ? "text-green-400 hover:bg-gray-600" : "text-gray-500 hover:bg-gray-600"}`}
                    title={track.enabled ? "Hide Track" : "Show Track"}
                  >
                    {track.enabled ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                  </button>
                  {track.type === "audio" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrackProperty(track.id, "muted");
                      }}
                      className={`p-1 rounded ${(track.volume || 0) > 0 ? "text-blue-400 hover:bg-gray-600" : "text-gray-500 hover:bg-gray-600"}`}
                      title={(track.volume || 0) > 0 ? "Mute Track" : "Unmute Track"}
                    >
                      {(track.volume || 0) > 0 ? <SpeakerWaveIcon className="w-4 h-4" /> : <SpeakerXMarkIcon className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTrack(track.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded"
                    title="Delete Track (Del)"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div
          className="flex-1 relative overflow-auto"
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineHover}
          onMouseLeave={() => setHoverPosition(null)}
        >
          {/* Time Ruler */}
          <div className="sticky top-0 z-30 bg-gray-700 border-b border-gray-600" style={{ width: timelineWidth, height: "32px", overflow: "hidden" }}>
            <div className="h-8 relative">
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div key={i} className="absolute top-0 h-full border-l border-gray-500 flex items-center" style={{ left: timeToPixel(i) }}>
                  <span className="ml-1 text-xs text-gray-300">{formatTime(i)}</span>
                </div>
              ))}

              {/* Sub-second markers */}
              {zoom > 1 &&
                Array.from({ length: Math.ceil(duration) * 4 }, (_, i) => (
                  <div key={`sub-${i}`} className="absolute top-0 h-1/2 border-l border-gray-500/50" style={{ left: timeToPixel(i * 0.25) }} />
                ))}
            </div>
          </div>

          <div style={{ width: timelineWidth, position: "relative" }}>
            {tracks.length > 0 ? (
              tracks.map((track, index) => renderTrackItem(track, index))
            ) : (
              <div className="p-8 text-center text-gray-400">No tracks added yet. Click "Add Track" above to get started.</div>
            )}
          </div>

          {/* Current position indicator (hover) */}
          {hoverPosition !== null && (
            <div className="absolute top-8 bottom-0 w-px bg-blue-400 opacity-50 z-20 pointer-events-none" style={{ left: hoverPosition }} />
          )}

          {/* Playhead */}
          <div
            ref={playheadRef}
            className="absolute top-0 w-0.5 bg-red-500 z-40"
            style={{
              left: timeToPixel(currentTime),
              height: tracks.length * (trackHeight + trackSpacing) + 32,
              pointerEvents: "none",
            }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Effects Panel */}
      {showEffectsPanel && selectedTrack && (
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Effects for Track</h3>
            <div className="text-xs text-gray-400">Effects will apply at current time: {formatTime(currentTime)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addTransition(selectedTrack)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Fade Transition
            </button>
            <button
              onClick={() => {
                // Add blur effect
                const effect: VideoEffect = {
                  id: `blur_${Date.now()}`,
                  type: "filter",
                  name: "Blur",
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { radius: 5 },
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Blur
            </button>
            <button
              onClick={() => {
                // Add color correction
                const effect: VideoEffect = {
                  id: `color_${Date.now()}`,
                  type: "filter",
                  name: "Color Correction",
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { brightness: 1.0, contrast: 1.0, saturation: 1.0 },
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Color
            </button>
            <button
              onClick={() => {
                // Add rotation effect
                const effect: VideoEffect = {
                  id: `rotate_${Date.now()}`,
                  type: "transform",
                  name: "Rotation",
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { angle: 90 },
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Rotate
            </button>
          </div>
        </div>
      )}

      {/* Keyframes Panel */}
      {showKeyframesPanel && selectedTrack && (
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Add Keyframes</h3>
            <div className="text-xs text-gray-400">Keyframe will be added at: {formatTime(currentTime)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "opacity")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Opacity
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "volume")}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Volume
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "scale")}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Scale
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "position")}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Position
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "rotation")}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Rotation
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex justify-center">
        <div className="flex space-x-4 text-xs text-gray-400">
          <span>Space: Play/Pause</span>
          <span>←/→: Move by 0.1s</span>
          <span>Shift+←/→: Move by 1s</span>
          <span>Shift+S: Split Track</span>
          <span>Del: Delete Selected Track</span>
        </div>
      </div>

      {/* Effects Panel */}
      {showEffectsPanel && selectedTrack && (
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Effects for Track</h3>
            <div className="text-xs text-gray-400">Effects will apply at current time: {formatTime(currentTime)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addTransition(selectedTrack)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Fade Transition
            </button>
            <button
              onClick={() => {
                // Add blur effect
                const effect: VideoEffect = {
                  id: `blur_${Date.now()}`,
                  type: "filter",
                  name: "Blur",
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { radius: 5 },
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Blur
            </button>
            <button
              onClick={() => {
                // Add color correction
                const effect: VideoEffect = {
                  id: `color_${Date.now()}`,
                  type: "filter",
                  name: "Color Correction",
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { brightness: 1.0, contrast: 1.0, saturation: 1.0 },
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Color
            </button>
            <button
              onClick={() => {
                // Add rotation effect
                const effect: VideoEffect = {
                  id: `rotate_${Date.now()}`,
                  type: "transform",
                  name: "Rotation",
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { angle: 90 },
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              Rotate
            </button>
          </div>
        </div>
      )}

      {/* Keyframes Panel */}
      {showKeyframesPanel && selectedTrack && (
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Add Keyframes</h3>
            <div className="text-xs text-gray-400">Keyframe will be added at: {formatTime(currentTime)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "opacity")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Opacity
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "volume")}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Volume
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "scale")}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Scale
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "position")}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Position
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, "rotation")}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center"
            >
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              Rotation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTimeline;
