import { useState, useEffect, useRef } from "react";
import { Note, TimelineSettings, PlaybackState } from "@/types/audio";
import { ToneNoteScheduler } from "@/utils/audio/ToneNoteScheduler";
import TimelineControls from "@/components/Timeline/TimelineControls";
import TimelineGrid from "@/components/Timeline/TimelineGrid";
import AddNoteDialog from "@/components/Timeline/AddNoteDialog";
import * as Tone from "tone";

const Timeline = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    bpm: 120,
    isLooping: true,
    gridLength: 32,
    zoom: 1,
  });

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);

  const noteSchedulerRef = useRef<ToneNoteScheduler | null>(null);

  useEffect(() => {
    const scheduler = new ToneNoteScheduler(timelineSettings.bpm, updateCursor, timelineSettings.isLooping);
    noteSchedulerRef.current = scheduler;

    // Add existing notes to scheduler
    notes.forEach((note) => scheduler.addNoteToScheduler(note));

    return () => {
      scheduler.stop();
    };
  }, [timelineSettings.bpm, timelineSettings.isLooping, notes]);

  const updateCursor = (step: number) => {
    setPlaybackState((prev) => ({ ...prev, currentStep: step }));
  };

  // @ts-ignore TS6133
  const handleMute = () => {
    if (isMuted) {
      Tone.Master.mute = false;
    } else {
      Tone.Master.mute = true;
    }
    setIsMuted(!isMuted);
  };

  const handleStartAudio = async () => {
    try {
      await Tone.start();
      console.log("Audio Context started!");
      // Toggle play/pause state
      setIsStarted(true);
    } catch (err) {
      console.error("Error starting the audio context:", err);
    }
  };

  const startPlayback = async () => {
    if (!isStarted) {
      await handleStartAudio();
    }
    // await Tone.start(); // Fix suspended AudioContext
    noteSchedulerRef.current?.start();
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  };

  const stopPlayback = () => {
    noteSchedulerRef.current?.stop();
    setPlaybackState({ isPlaying: false, currentStep: 0 });
  };

  const addNote = (note: Note) => {
    setNotes((prev) => [...prev, note]);
    noteSchedulerRef.current?.addNoteToScheduler(note);
  };

  const handleLoopToggle = () => {
    const newLoopState = !timelineSettings.isLooping;
    setTimelineSettings((prev) => ({
      ...prev,
      isLooping: newLoopState,
    }));
    noteSchedulerRef.current?.setLoop(newLoopState); // Update loop state in scheduler
  };

  const handleGridLengthChange = (length: number) => {
    setTimelineSettings((prev) => ({
      ...prev,
      gridLength: length,
    }));
  };

  const handleZoomIn = () => {
    setTimelineSettings((prev) => ({
      ...prev,
      zoom: (prev.zoom || 1) + 0.25,
    }));
  };

  const handleZoomOut = () => {
    setTimelineSettings((prev) => ({
      ...prev,
      zoom: (prev.zoom || 1) - 0.25,
    }));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full overflow-x-auto">
        <TimelineControls
          isPlaying={playbackState.isPlaying}
          bpm={timelineSettings.bpm}
          isLooping={timelineSettings.isLooping}
          onPlay={startPlayback}
          onPause={() => noteSchedulerRef.current?.pause()}
          onStop={stopPlayback}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onAddNote={() => setIsAddNoteDialogOpen(true)}
          onUpdateBPM={(bpm) => setTimelineSettings((prev) => ({ ...prev, bpm }))}
          onToggleLoop={handleLoopToggle}
          onUpdateGridLength={handleGridLengthChange}
        />
      </div>

      <TimelineGrid gridLength={timelineSettings.gridLength} zoomLevel={timelineSettings.zoom || 1} currentStep={playbackState.currentStep} notes={notes} />

      {isAddNoteDialogOpen && (
        <AddNoteDialog
          isOpen={isAddNoteDialogOpen}
          onClose={() => setIsAddNoteDialogOpen(false)}
          onAdd={(note) => {
            addNote(note);
            setIsAddNoteDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Timeline;
