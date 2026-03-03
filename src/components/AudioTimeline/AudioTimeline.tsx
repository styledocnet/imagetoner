import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TimelineControls } from "./TimelineControls";
import { TimelineSettings, Note } from "../../types/audio";
import { Track, TrackMode, GlobalSettings, AudioTimelineState } from "../../types/audio/audiotimeline";
import TimelineTrack from "./TimelineTrack";
import XYPadTrack from "./XYPadTrack";
import ResizableTrackPanel from "./ResizableTrackPanel";
import TimelineMinimap from "./TimelineMinimap";
import { createAudioContext } from "../../utils/audio";
import { ToneNoteScheduler } from "../../utils/audio/ToneNoteScheduler";
import * as Tone from "tone";
// Scale utilities imported elsewhere
import CircularTrack from "./CircularTrack";
import TrackerStyleBlockArranger from "./TrackerStyleBlockArranger";

// Extracted interfaces for better type management
interface ZoomConfig {
  min: number;
  max: number;
  step: number;
}

interface AudioTimelineProps {
  initialSettings?: Partial<TimelineSettings>;
  zoomConfig?: Partial<ZoomConfig>;
  tracks: Track[];
  onAddTrack: () => void;
  onTrackModeToggle: (trackId: string) => void;
  onTrackLengthChange: (trackId: string, length: number) => void;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onOctaveChange: (trackId: string, change: number) => void;
  onAddNote: (trackId: string, note: Note) => void;
  onScaleChange?: (trackId: string, rootNote: string, scaleName: string) => void;
  onVariationChange?: (trackId: string, variation: string) => void;
  onGlobalVariationChange?: (variation: string) => void;
  onNoteRemove?: (trackId: string, noteId: string) => void;
  onClearPattern?: (trackId: string) => void;
  onInstrumentChange?: (trackId: string, instrument: any) => void;
  enableBlockArranger?: boolean;
}

// Interface for the block arranger
// Interface commented out as it's not being used currently
// interface ArrangerBlock {
//   trackId: number;
//   variation: string;
// }

// Default values
const DEFAULT_SETTINGS: GlobalSettings = {
  bpm: 120,
  isPlaying: false,
  isLooping: true,
  gridLength: 64,
  totalSteps: 64,
  quantizeAmount: 1,
  swingAmount: 0,
  metronomeEnabled: false,
  currentStep: 0,
  masterVolume: 1,
  showMinimap: true,
  showControls: true,
  autoScroll: true,
  zoom: 1,
  layout: "horizontal",
  minimapEnabled: true,
  snapToGrid: true,
  gridSubdivision: 4,
  currentVariation: "A",
  showBlockArranger: false,
};

const DEFAULT_ZOOM_CONFIG: ZoomConfig = {
  min: 0.5,
  max: 5,
  step: 1.2,
};

const AudioTimeline: React.FC<AudioTimelineProps> = ({
  initialSettings = {},
  // zoomConfig = {}, // Uncomment when needed
  tracks,
  onAddTrack,
  onTrackModeToggle,
  onTrackLengthChange,
  onTrackMute,
  onTrackSolo,
  onOctaveChange,
  onAddNote,
  onScaleChange,
  onVariationChange,
  onGlobalVariationChange,
  onClearPattern,
  onInstrumentChange,
  enableBlockArranger,
}) => {
  const audioContextRef = useRef<AudioContext>();
  const schedulerRef = useRef<ToneNoteScheduler | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Initialize state with default values
  const [state, setState] = useState<AudioTimelineState>({
    tracks,
    globalSettings: { ...DEFAULT_SETTINGS, ...initialSettings },
    playbackState: {
      isPlaying: false,
      currentStep: 0,
      currentBar: 0,
      lastTickTime: 0,
      nextNoteTime: 0,
      scheduleAheadTime: 0.1,
      currentVariation: "A",
    },
    selectedTrackId: null,
    selectedNoteId: null,
    isDragging: false,
    currentVariation: "A",
    minimapZoom: 1,
    visibleTimeRange: {
      start: 0,
      end: DEFAULT_SETTINGS.totalSteps,
    },
  });

  // Helper refs
  const requestAnimationFrameIdRef = useRef<number | null>(null);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isComponentMounted = useRef(true);

  // Variation system
  const [globalVariation, setGlobalVariation] = useState<string>("A");
  const [totalBars] = useState<number>(64); // For block arranger
  // State variables kept for future implementation
  // const [currentArrangerPosition, setCurrentArrangerPosition] = useState<number>(0);
  // const [blockLength, setBlockLength] = useState<number>(8); // Default block length for arranger
  const [showBlockArranger, setShowBlockArranger] = useState<boolean>(enableBlockArranger || false);

  // Toggle block arranger visibility
  const toggleBlockArranger = useCallback(() => {
    setShowBlockArranger((prev) => !prev);
  }, []);

  // The following block was removed as it duplicated the state declarations above

  // Helper function to rebuild the scheduler with current track states
  const rebuildScheduler = useCallback(() => {
    try {
      console.log("Rebuilding audio scheduler");

      // Clean up existing scheduler if it exists
      if (schedulerRef.current) {
        schedulerRef.current.cleanup();
        schedulerRef.current = null;
      }

      // Create a new scheduler with current settings
      schedulerRef.current = new ToneNoteScheduler(
        state.globalSettings.bpm,
        (step) => {
          setState((prev) => ({
            ...prev,
            playbackState: {
              ...prev.playbackState,
              currentStep: step % state.globalSettings.totalSteps, // Keep step within bounds
            },
          }));
        },
        state.globalSettings.isLooping,
      );

      // Check if any track is soloed to determine playback behavior
      const anySoloed = state.tracks.some((t) => t.solo);

      // Add notes from all tracks based on their mute/solo status
      state.tracks.forEach((track) => {
        // If a track is soloed, play only soloed tracks
        // Otherwise, play non-muted tracks
        const shouldPlay = anySoloed ? track.solo : !track.mute;

        // Set track-specific looping
        schedulerRef.current?.setTrackLoop(track.id, true, track.length);

        if (shouldPlay) {
          // Filter notes by current variation if available
          const currentVariation = track.currentVariation || state.playbackState.currentVariation || "A";
          const notesToPlay = track.notes.filter((note) => !note.variation || note.variation === currentVariation);

          notesToPlay.forEach((note) => {
            // Adjust velocity for ghost notes
            const velocity = note.isGhost ? (note.velocity ? note.velocity * 0.6 : 0.6) : note.velocity;

            schedulerRef.current?.addNoteToScheduler({
              ...note,
              velocity,
              trackId: track.id,
              trackLength: track.length,
              loopIndependently: true, // Always use independent looping
            });
          });
        }
      });

      return true;
    } catch (error) {
      console.error("Error rebuilding scheduler:", error);
      return false;
    }
  }, [state.tracks, state.globalSettings.bpm, state.globalSettings.isLooping, state.globalSettings.totalSteps, state.playbackState.currentVariation]);

  // Toggle playback functions
  const togglePlayback = useCallback(() => {
    try {
      // Start Tone.js context (needed for browser autoplay policy)
      Tone.start()
        .then(() => {
          // Resume audio context for playback
          Tone.context.resume().catch(console.error);

          // Make sure scheduler is built and up-to-date
          if (!schedulerRef.current) {
            rebuildScheduler();
          }

          if (state.playbackState.isPlaying) {
            schedulerRef.current?.pause();
          } else {
            // Start playback
            schedulerRef.current?.start();
          }
        })
        .catch((error) => {
          console.error("Failed to initialize Tone.js:", error);
        });
    } catch (error) {
      console.error("Error controlling playback:", error);
    }

    // Ensure Tone's audio context is running (browser autoplay policy requires user interaction)
    if (Tone.context.state !== "running") {
      Tone.context.resume().catch(console.error);
    }

    setState((prev) => ({
      ...prev,
      playbackState: {
        ...prev.playbackState,
        isPlaying: !prev.playbackState.isPlaying,
        nextNoteTime: audioContextRef.current?.currentTime || 0,
      },
    }));
  }, [state.tracks, state.globalSettings.bpm, state.globalSettings.isLooping, state.playbackState.isPlaying]);

  // Handle variation changes
  const handleVariationChange = useCallback(
    (trackId: string, variation: string) => {
      if (onVariationChange) {
        onVariationChange(trackId, variation);
      }

      setState((prevState) => ({
        ...prevState,
        tracks: prevState.tracks.map((track) => (track.id === trackId ? { ...track, currentVariation: variation } : track)),
      }));

      // Update block arranger position to reflect the correct variation
      // Update scheduler for variation-specific notes
      if (schedulerRef.current) {
        schedulerRef.current.cleanup();
        schedulerRef.current = null;
      }
    },
    [onVariationChange],
  );

  // Handle global variation changes
  const handleGlobalVariationChange = useCallback(
    (variation: string) => {
      if (onGlobalVariationChange) {
        onGlobalVariationChange(variation);
      }

      setGlobalVariation(variation);

      setState((prevState) => ({
        ...prevState,
        playbackState: {
          ...prevState.playbackState,
          currentVariation: variation,
        },
        tracks: prevState.tracks.map((track) => ({
          ...track,
          currentVariation: variation,
        })),
      }));

      // Update scheduler for global variation changes
      if (schedulerRef.current) {
        schedulerRef.current.cleanup();
        schedulerRef.current = null;
      }
    },
    [onGlobalVariationChange],
  );

  // Remove a note from a track
  // Function commented out as it's not being used currently
  /*
  const handleNoteRemove = useCallback(
    (trackId: string, noteId: string) => {
      if (onNoteRemove) {
        onNoteRemove(trackId, noteId);
      }

      setState((prevState) => ({
        ...prevState,
        tracks: prevState.tracks.map((track) => {
          if (track.id !== trackId) return track;

          return {
            ...track,
            notes: track.notes.filter((note) => note.id !== noteId),
          };
        }),
      }));
    },
    [onNoteRemove],
  );
  */

  // Stop playback and reset playhead
  const stopPlayback = useCallback(() => {
    try {
      // Cancel any pending animation frame
      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current);
        requestAnimationFrameIdRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        playbackState: {
          ...prev.playbackState,
          isPlaying: false,
          currentStep: 0,
          nextNoteTime: 0,
        },
      }));

      // Stop playback using the ToneNoteScheduler
      if (schedulerRef.current) {
        schedulerRef.current.stop();
        // Cleanup and recreate the scheduler on next play
        schedulerRef.current.cleanup();
        schedulerRef.current = undefined;
      }

      // Make sure Tone.js transport is stopped and reset
      Tone.Transport.stop();
      Tone.Transport.position = 0;
    } catch (error) {
      console.error("Error stopping playback:", error);
    }
  }, []);

  // Extracted zoom function for reusability
  const changeZoom = useCallback((direction: "in" | "out") => {
    setState((prev) => {
      const { min, max, step } = DEFAULT_ZOOM_CONFIG;
      const newZoom = direction === "in" ? Math.min(prev.globalSettings.zoom * step, max) : Math.max(prev.globalSettings.zoom / step, min);

      return {
        ...prev,
        globalSettings: { ...prev.globalSettings, zoom: newZoom },
      };
    });
  }, []);

  const handleOctaveChange = useCallback((direction: "up" | "down") => {
    // Implement octave change logic
    console.log(`Octave change: ${direction}`);
  }, []);

  // Helper function to cycle through track modes
  // Commented out as it's not being used currently
  /*
  const cycleTrackMode = useCallback(
    (trackId: string) => {
      const track = state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Cycle through modes: STEP -> XY -> CIRCULAR -> STEP
      const currentMode = track.mode;
      // Use currentMode in logic but we don't need to store it in a variable
      if (currentMode === TrackMode.STEP) {
        // Will change to XY mode
      } else if (currentMode === TrackMode.XY) {
        // Will change to CIRCULAR mode
      } else {
        // Will change to STEP mode
      }

      // This actually calls the parent component's handler, which will toggle the mode
      // Note: The parent component will need to be updated to handle CIRCULAR mode
      onTrackModeToggle(trackId);
    },
    [state.tracks, onTrackModeToggle],
  );
  */

  const changeBpm = useCallback((bpm: number) => {
    try {
      // Set BPM in global settings and reset timing
      setState((prev) => ({
        ...prev,
        globalSettings: { ...prev.globalSettings, bpm },
        playbackState: {
          ...prev.playbackState,
          nextNoteTime: audioContextRef.current?.currentTime || 0,
        },
      }));

      // Update BPM in the scheduler
      if (schedulerRef.current) {
        schedulerRef.current.setBpm(bpm);
      }
    } catch (error) {
      console.error("Error changing BPM:", error);
    }
  }, []);

  const toggleLooping = useCallback(() => {
    try {
      const newLoopingState = !state.globalSettings.isLooping;
      setState((prev) => ({
        ...prev,
        globalSettings: { ...prev.globalSettings, isLooping: newLoopingState },
      }));

      // Update looping in the scheduler
      if (schedulerRef.current) {
        schedulerRef.current.setLoop(newLoopingState);
      }
    } catch (error) {
      console.error("Error toggling loop state:", error);
    }
  }, [state.globalSettings.isLooping]);

  // React-hotkeys-hook implementation
  useHotkeys("space", togglePlayback, { preventDefault: true, enableOnFormTags: true });
  useHotkeys("escape", stopPlayback, { enableOnFormTags: true });
  useHotkeys("+", () => changeZoom("in"), { enableOnFormTags: true });
  useHotkeys("-", () => changeZoom("out"), { enableOnFormTags: true });
  useHotkeys("up", () => handleOctaveChange("up"), { enableOnFormTags: true });
  useHotkeys("down", () => handleOctaveChange("down"), { enableOnFormTags: true });
  useHotkeys("l", toggleLooping, { enableOnFormTags: true });
  useHotkeys("s", stopPlayback, { enableOnFormTags: true });

  // Variation key shortcuts (Alt+1 through Alt+4 for variations A-D)
  useHotkeys("alt+1", () => handleGlobalVariationChange("A"), { enableOnFormTags: true });
  useHotkeys("alt+2", () => handleGlobalVariationChange("B"), { enableOnFormTags: true });
  useHotkeys("alt+3", () => handleGlobalVariationChange("C"), { enableOnFormTags: true });
  useHotkeys("alt+4", () => handleGlobalVariationChange("D"), { enableOnFormTags: true });

  // Number keys for track muting (1-9)
  for (let i = 1; i <= 9; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkeys(`${i}`, () => {
      const track = tracks[i - 1];
      if (track) {
        handleTrackMuteChange(track.id);
      }
    });
  }

  // Shift+Number for track solo
  for (let i = 1; i <= 9; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkeys(`shift+${i}`, () => {
      const track = tracks[i - 1];
      if (track) {
        handleTrackSoloChange(track.id);
      }
    });
  }

  // Set up audio playback effect
  // Initialize Tone.js when component mounts
  useEffect(() => {
    const initTone = async () => {
      try {
        await Tone.start();
        console.log("Tone.js initialized on component mount");
        // Audio context is now ready for user interaction
      } catch (err) {
        console.error("Failed to initialize Tone.js:", err);
      }
    };

    initTone();

    return () => {
      // Clean up audio resources
      if (schedulerRef.current) {
        schedulerRef.current.cleanup();
        schedulerRef.current = undefined;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = createAudioContext();
    } catch (error) {
      console.error("Failed to create audio context:", error);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((err) => {
          console.error("Error closing audio context:", err);
        });
      }
    };
  }, []);

  // Helper function to toggle expanded track
  const toggleExpandTrack = useCallback((trackId: string) => {
    setExpandedTrackId((prev) => (prev === trackId ? null : trackId));
  }, []);

  // Scheduler update logic - we'll use this for UI updates but not for audio scheduling
  const updateUI = useCallback(() => {
    if (!isComponentMounted.current) return;

    // Schedule next frame for UI updates
    requestAnimationFrameIdRef.current = requestAnimationFrame(updateUI);
  }, []);

  // Sync tracks from props whenever they change
  useEffect(() => {
    setState((prevState) => {
      // Only update if tracks actually changed to avoid infinite loops
      if (prevState.tracks !== tracks) {
        return {
          ...prevState,
          tracks: tracks,
        };
      }
      return prevState;
    });
  }, [tracks]);

  // Handle track updates - when notes change or when mute/solo status changes
  useEffect(() => {
    // Only rebuild if we have valid tracks
    if (state.tracks && state.tracks.length > 0) {
      const updated = rebuildScheduler();

      if (updated && state.playbackState.isPlaying) {
        // Resume playback if we were already playing
        schedulerRef.current?.start();
      }
    }
  }, [state.tracks, rebuildScheduler, state.playbackState.isPlaying]);

  // Handle specific track mute/solo changes
  const handleTrackMuteChange = useCallback(
    (trackId: string) => {
      // Call the parent component's handler to update parent state
      onTrackMute(trackId);

      // Rebuild scheduler immediately to reflect mute state
      setTimeout(() => {
        rebuildScheduler();
        if (state.playbackState.isPlaying) {
          schedulerRef.current?.start();
        }
      }, 0);
    },
    [onTrackMute, rebuildScheduler, state.playbackState.isPlaying, state.tracks],
  );

  // Handle clearing pattern
  const handleClearPattern = useCallback(
    (trackId: string) => {
      if (onClearPattern) {
        onClearPattern(trackId);
      }

      // Cleanup scheduler with a slight delay to allow state to sync
      setTimeout(() => {
        if (schedulerRef.current) {
          schedulerRef.current.cleanup();
          schedulerRef.current = null;
        }
        // Rebuild scheduler after cleanup
        rebuildScheduler();
        if (state.playbackState.isPlaying) {
          schedulerRef.current?.start();
        }
      }, 0);
    },
    [onClearPattern, rebuildScheduler, state.playbackState.isPlaying],
  );

  const handleTrackSoloChange = useCallback(
    (trackId: string) => {
      // Call the parent component's handler to update parent state
      onTrackSolo(trackId);

      // Rebuild scheduler immediately to reflect solo state
      setTimeout(() => {
        rebuildScheduler();
        if (state.playbackState.isPlaying) {
          schedulerRef.current?.start();
        }
      }, 0);
    },
    [onTrackSolo, rebuildScheduler, state.playbackState.isPlaying, state.tracks],
  );

  // This section has been refactored into the rebuildScheduler function

  // Handle timeline updates during playback
  useEffect(() => {
    if (state.playbackState.isPlaying) {
      // Start UI updates
      requestAnimationFrameIdRef.current = requestAnimationFrame(updateUI);
    } else if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current);
    }

    return () => {
      if (requestAnimationFrameIdRef.current) {
        cancelAnimationFrame(requestAnimationFrameIdRef.current);
      }
    };
  }, [state.playbackState.isPlaying, updateUI]);

  // Helper function to add note to a specific track
  const handleAddNoteToTrack = useCallback(
    (trackId: string) => (note: Note) => {
      onAddNote(trackId, note);

      try {
        // If playing, add the note to the scheduler
        if (state.playbackState.isPlaying && schedulerRef.current) {
          const track = state.tracks.find((t) => t.id === trackId);
          if (!track) return;

          // Check if any track is soloed
          const anySoloed = state.tracks.some((t) => t.solo);
          // If a track is soloed, play only soloed tracks
          // Otherwise, play non-muted tracks
          const shouldPlay = anySoloed ? track.solo : !track.mute;

          if (shouldPlay) {
            schedulerRef.current.addNoteToScheduler({
              ...note,
              trackId,
              trackLength: track.length,
              loopIndependently: true, // Always use independent looping for tracks
            });
          }
        }
      } catch (error) {
        console.error(`Error adding note to track ${trackId}:`, error);
      }
    },
    [onAddNote, state.playbackState.isPlaying, state.tracks],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;

      try {
        if (requestAnimationFrameIdRef.current) {
          cancelAnimationFrame(requestAnimationFrameIdRef.current);
        }

        if (schedulerRef.current) {
          schedulerRef.current.cleanup();
        }

        if (audioContextRef.current) {
          audioContextRef.current.close().catch((err) => {
            console.error("Error closing audio context during cleanup:", err);
          });
        }
      } catch (error) {
        console.error("Error during component cleanup:", error);
      }
    };
  }, []);

  // For TypeScript errors about modules, we need to ensure the project has proper dependencies
  // These would need to be installed with npm/yarn if they're missing

  // Render the timeline
  return (
    <div
      ref={timelineRef}
      className={`bg-gray-900 rounded-lg shadow-xl overflow-hidden relative ${state.globalSettings.layout === "vertical" ? "flex-col" : ""}`}
      style={{ zIndex: 30 }}
    >
      <TimelineControls
        settings={state.globalSettings}
        isPlaying={state.playbackState.isPlaying}
        onTogglePlayback={togglePlayback}
        onStopPlayback={stopPlayback}
        onChangeBpm={changeBpm}
        onChangeZoom={changeZoom}
        onToggleLooping={toggleLooping}
        onAddTrack={onAddTrack}
        showBlockArranger={showBlockArranger}
        onToggleBlockArranger={toggleBlockArranger}
        showVariationControls={true}
        currentVariation={globalVariation}
        onVariationChange={handleGlobalVariationChange}
        onLayoutChange={(layout) =>
          setState((prev) => ({
            ...prev,
            globalSettings: { ...prev.globalSettings, layout },
          }))
        }
      />
      {state.globalSettings.minimapEnabled && (
        <div className="bg-gray-800 border-b border-gray-700 p-2">
          <div className="text-xs text-gray-400 mb-1 px-1 flex justify-between">
            <span>Timeline Overview</span>
            <span>
              {tracks.length} Tracks • {state.globalSettings.totalSteps} Steps
            </span>
          </div>
          <div className="h-12 bg-gray-900 rounded">
            <TimelineMinimap
              tracks={state.tracks}
              visibleTimeRange={state.visibleTimeRange}
              zoom={state.minimapZoom}
              onRangeChange={(range) =>
                setState((prev) => ({
                  ...prev,
                  visibleTimeRange: range,
                }))
              }
            />
          </div>
        </div>
      )}

      <div
        className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 auto-rows-min bg-gray-900"
        style={{
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          pointerEvents: "auto",
          zIndex: 5,
        }}
      >
        {tracks.map((track) => (
          <ResizableTrackPanel
            key={track.id}
            track={track}
            onModeToggle={() => onTrackModeToggle(track.id)}
            onLengthChange={(length) => onTrackLengthChange(track.id, length)}
            onMute={() => handleTrackMuteChange(track.id)}
            onSolo={() => handleTrackSoloChange(track.id)}
            onOctaveChange={onOctaveChange}
            onScaleChange={onScaleChange}
            onInstrumentChange={(trackId, instrument, parameters) => {
              // Call parent callback to update tracks in parent component
              if (onInstrumentChange) {
                onInstrumentChange(trackId, instrument);
              }
            }}
            isExpanded={expandedTrackId === track.id}
            onToggleExpand={() => toggleExpandTrack(track.id)}
            currentStep={state.playbackState.currentStep}
            onClearPattern={() => handleClearPattern(track.id)}
          >
            {track.mode === TrackMode.STEP ? (
              <TimelineTrack
                track={track}
                currentStep={state.playbackState.currentStep}
                zoom={state.globalSettings.zoom}
                onAddNote={handleAddNoteToTrack(track.id)}
              />
            ) : track.mode === TrackMode.XY ? (
              <XYPadTrack track={track} currentStep={state.playbackState.currentStep} onAddNote={handleAddNoteToTrack(track.id)} />
            ) : (
              <CircularTrack track={track} currentStep={state.playbackState.currentStep} onAddNote={handleAddNoteToTrack(track.id)} />
            )}
          </ResizableTrackPanel>
        ))}
      </div>

      {/* Info icon with keyboard shortcuts on hover */}
      <div
        className="absolute bottom-2 right-2 text-xs z-40"
        onMouseEnter={() => setShowKeyboardShortcuts(true)}
        onMouseLeave={() => setShowKeyboardShortcuts(false)}
      >
        <div className="bg-gray-700 hover:bg-gray-600 rounded-full h-6 w-6 flex items-center justify-center cursor-help text-gray-300">
          <span>i</span>
        </div>

        {showKeyboardShortcuts && (
          <div className="absolute bottom-6 right-0 text-xs text-gray-400 bg-gray-800 bg-opacity-80 p-2 rounded shadow min-w-[180px]">
            <div className="font-bold mb-1 text-gray-300">Keyboard Shortcuts:</div>
            <div>
              <span className="px-1 bg-gray-700 rounded mr-1">Space</span> Play/Pause
            </div>
            <div>
              <span className="px-1 bg-gray-700 rounded mr-1">S</span> Stop
            </div>
            <div>
              <span className="px-1 bg-gray-700 rounded mr-1">L</span> Toggle Loop
            </div>
            <div>
              <span className="px-1 bg-gray-700 rounded mr-1">+/-</span> Zoom
            </div>
            <div>
              <span className="px-1 bg-gray-700 rounded mr-1">↑/↓</span> Octave
            </div>
            <div>
              <span className="px-1 bg-gray-700 rounded mr-1">1-9</span> Toggle Mute
            </div>
          </div>
        )}
      </div>

      {/* Add Block Arranger */}
      {showBlockArranger && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-white text-lg font-medium mb-2 px-4">Track Arrangement</h3>
          <TrackerStyleBlockArranger
            tracks={state.tracks.map((t) => ({ id: parseInt(t.id), name: t.name }))}
            onVariationChange={(trackId, variation) => handleVariationChange(String(trackId), variation)}
            onGlobalVariationChange={handleGlobalVariationChange}
            totalBars={totalBars}
            currentBar={state.playbackState.currentBar}
            isPlaying={state.playbackState.isPlaying}
            currentVariation={globalVariation}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to find blocks at a specific position in the arrangement
// Function commented out as it's not being used
/*
// Unused function but kept for future reference
// const findBlocksAtPosition = (position: number) => {
//   // This would normally use the block arranger's state
//   // For now, we'll return a default pattern:
//   // A-A-B-A-A-A-C-D (repeating pattern)

//   const variations = ["A", "A", "B", "A", "A", "A", "C", "D"];
//   const variationIndex = position % variations.length;
//   const variation = variations[variationIndex];

//   // Simulate blocks for all tracks
//   return [{ trackId: 1, variation }];
// };
*/

export default AudioTimeline;
