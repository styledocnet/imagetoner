import React, { useState, useRef, useEffect, useCallback } from "react";
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
  TrashIcon
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
  onAddTrack: (type: 'image' | 'audio' | 'video') => void;
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
  onAddKeyframe
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    trackId: string;
    type: 'track' | 'effect' | 'keyframe';
    startX: number;
    startTime: number;
  } | null>(null);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showKeyframesPanel, setShowKeyframesPanel] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  // Timeline dimensions
  const pixelsPerSecond = 50 * zoom;
  const trackHeight = 80;
  const timelineWidth = duration * pixelsPerSecond;

  // Convert time to pixel position
  const timeToPixel = (time: number) => time * pixelsPerSecond;
  const pixelToTime = (pixel: number) => pixel / pixelsPerSecond;

  // Handle timeline click to set current time
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(duration, pixelToTime(x)));
    onCurrentTimeChange(time);
  };

  // Handle track dragging
  const handleMouseDown = (e: React.MouseEvent, trackId: string, type: 'track' | 'effect' | 'keyframe') => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    setIsDragging(true);
    setDragInfo({
      trackId,
      type,
      startX: e.clientX,
      startTime: track.startTime
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragInfo || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragInfo.startX;
    const deltaTime = pixelToTime(deltaX);
    const newStartTime = Math.max(0, dragInfo.startTime + deltaTime);

    // Update track position in real-time
    const updatedTracks = tracks.map(track => {
      if (track.id === dragInfo.trackId) {
        const newEndTime = newStartTime + track.duration;
        return {
          ...track,
          startTime: newStartTime,
          endTime: newEndTime
        };
      }
      return track;
    });

    onTracksChange(updatedTracks);
  }, [isDragging, dragInfo, tracks, onTracksChange, pixelToTime]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragInfo(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Handle track resize
  const handleResizeTrack = (trackId: string, edge: 'start' | 'end', newTime: number) => {
    const updatedTracks = tracks.map(track => {
      if (track.id === trackId) {
        if (edge === 'start') {
          const newStartTime = Math.max(0, Math.min(newTime, track.endTime - 0.1));
          return {
            ...track,
            startTime: newStartTime,
            duration: track.endTime - newStartTime
          };
        } else {
          const newEndTime = Math.max(track.startTime + 0.1, newTime);
          return {
            ...track,
            endTime: newEndTime,
            duration: newEndTime - track.startTime
          };
        }
      }
      return track;
    });
    onTracksChange(updatedTracks);
  };

  // Toggle track properties
  const toggleTrackProperty = (trackId: string, property: 'enabled' | 'muted') => {
    const updatedTracks = tracks.map(track => {
      if (track.id === trackId) {
        if (property === 'enabled') {
          return { ...track, enabled: !track.enabled };
        } else {
          return { ...track, volume: track.volume === 0 ? 0.8 : 0 };
        }
      }
      return track;
    });
    onTracksChange(updatedTracks);
  };

  // Add transition effect between tracks
  const addTransition = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const transitionEffect: VideoEffect = {
      id: `transition_${Date.now()}`,
      type: 'transition',
      name: 'Fade',
      startTime: track.startTime,
      endTime: track.startTime + 0.5,
      enabled: true,
      parameters: {
        type: 'fade',
        duration: 0.5,
        easing: 'ease-in-out'
      }
    };

    onAddEffect(trackId, transitionEffect);
  };

  // Add keyframe for property animation
  const addPropertyKeyframe = (trackId: string, property: string) => {
    const keyframe: Keyframe = {
      id: `keyframe_${Date.now()}`,
      property,
      time: currentTime,
      value: property === 'opacity' ? 1.0 : property === 'volume' ? 0.8 : 0,
      easing: 'ease-in-out'
    };

    onAddKeyframe(trackId, keyframe);
  };

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const frames = Math.floor((time % 1) * fps);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  // Get track color based on type
  const getTrackColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-500';
      case 'audio': return 'bg-purple-500';
      case 'video': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <StopIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onCurrentTimeChange(Math.max(0, currentTime - 1))}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
          >
            <BackwardIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCurrentTimeChange(Math.min(duration, currentTime + 1))}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
          >
            <ForwardIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Zoom:</label>
            <input
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-8">{zoom}x</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              showEffectsPanel ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            Effects
          </button>
          <button
            onClick={() => setShowKeyframesPanel(!showKeyframesPanel)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              showKeyframesPanel ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            Keyframes
          </button>
        </div>
      </div>

      {/* Add Track Buttons */}
      <div className="flex items-center space-x-2 p-3 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">Add Track:</span>
        <button
          onClick={() => onAddTrack('image')}
          className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Image
        </button>
        <button
          onClick={() => onAddTrack('audio')}
          className="flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Audio
        </button>
        <button
          onClick={() => onAddTrack('video')}
          className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Video
        </button>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center justify-between p-3 border-b border-gray-700 ${
                selectedTrack === track.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'
              }`}
              style={{ height: trackHeight }}
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
                    toggleTrackProperty(track.id, 'enabled');
                  }}
                  className={`p-1 rounded ${track.enabled ? 'text-green-400' : 'text-gray-500'}`}
                >
                  {track.enabled ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                </button>
                {track.type === 'audio' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackProperty(track.id, 'muted');
                    }}
                    className={`p-1 rounded ${(track.volume || 0) > 0 ? 'text-blue-400' : 'text-gray-500'}`}
                  >
                    {(track.volume || 0) > 0 ? <SpeakerWaveIcon className="w-4 h-4" /> : <SpeakerXMarkIcon className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrack(track.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 relative overflow-auto" ref={timelineRef} onClick={handleTimelineClick}>
          {/* Time Ruler */}
          <div className="sticky top-0 z-10 bg-gray-700 border-b border-gray-600" style={{ width: timelineWidth }}>
            <div className="h-8 relative">
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-500 flex items-center"
                  style={{ left: timeToPixel(i) }}
                >
                  <span className="ml-1 text-xs text-gray-300">{formatTime(i)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Playhead */}
          <div
            ref={playheadRef}
            className="absolute top-0 w-0.5 bg-red-500 z-20"
            style={{
              left: timeToPixel(currentTime),
              height: tracks.length * trackHeight + 32
            }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-sm" />
          </div>

          {/* Tracks */}
          <div style={{ width: timelineWidth }}>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="relative border-b border-gray-700"
                style={{ height: trackHeight }}
              >
                {/* Track Block */}
                <div
                  className={`absolute top-2 bottom-2 rounded cursor-move ${getTrackColor(track.type)} bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 ${
                    selectedTrack === track.id ? 'ring-2 ring-blue-400' : ''
                  }`}
                  style={{
                    left: timeToPixel(track.startTime),
                    width: timeToPixel(track.duration)
                  }}
                  onMouseDown={(e) => handleMouseDown(e, track.id, 'track')}
                >
                  {/* Track Content */}
                  <div className="p-2 h-full flex items-center justify-between text-xs">
                    <div className="text-white font-medium truncate">{track.name}</div>
                    {track.type === 'audio' && track.volume !== undefined && (
                      <div className="text-white opacity-75">
                        Vol: {Math.round((track.volume || 0) * 100)}%
                      </div>
                    )}
                    {(track.type === 'image' || track.type === 'video') && track.opacity !== undefined && (
                      <div className="text-white opacity-75">
                        Opacity: {Math.round((track.opacity || 1) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Resize Handles */}
                  <div
                    className="absolute left-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      // Handle start resize
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      // Handle end resize
                    }}
                  />

                  {/* Effects Indicators */}
                  {track.effects.map((effect) => (
                    <div
                      key={effect.id}
                      className="absolute top-0 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: timeToPixel(effect.startTime - track.startTime),
                        width: timeToPixel(effect.endTime - effect.startTime)
                      }}
                    />
                  ))}

                  {/* Keyframes */}
                  {track.keyframes.map((keyframe) => (
                    <div
                      key={keyframe.id}
                      className="absolute top-1 w-2 h-2 bg-orange-400 rounded-full border border-white"
                      style={{
                        left: timeToPixel(keyframe.time - track.startTime) - 4
                      }}
                    />
                  ))}
                </div>

                {/* Quick Actions */}
                {selectedTrack === track.id && (
                  <div className="absolute top-1 right-1 flex space-x-1">
                    <button
                      onClick={() => addTransition(track.id)}
                      className="p-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                      title="Add Transition"
                    >
                      <AdjustmentsHorizontalIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onSplitTrack(track.id, currentTime)}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      title="Split at Playhead"
                    >
                      <ScissorsIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Effects Panel */}
      {showEffectsPanel && selectedTrack && (
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          <h3 className="text-sm font-medium mb-2">Effects for Track</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => addTransition(selectedTrack)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Fade Transition
            </button>
            <button
              onClick={() => {
                // Add blur effect
                const effect: VideoEffect = {
                  id: `blur_${Date.now()}`,
                  type: 'filter',
                  name: 'Blur',
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { radius: 5 }
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              Blur
            </button>
            <button
              onClick={() => {
                // Add color correction
                const effect: VideoEffect = {
                  id: `color_${Date.now()}`,
                  type: 'filter',
                  name: 'Color Correction',
                  startTime: currentTime,
                  endTime: currentTime + 1,
                  enabled: true,
                  parameters: { brightness: 1.0, contrast: 1.0, saturation: 1.0 }
                };
                onAddEffect(selectedTrack, effect);
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              Color
            </button>
          </div>
        </div>
      )}

      {/* Keyframes Panel */}
      {showKeyframesPanel && selectedTrack && (
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          <h3 className="text-sm font-medium mb-2">Add Keyframes</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, 'opacity')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Opacity
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, 'volume')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              Volume
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, 'scale')}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              Scale
            </button>
            <button
              onClick={() => addPropertyKeyframe(selectedTrack, 'position')}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              Position
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTimeline;
