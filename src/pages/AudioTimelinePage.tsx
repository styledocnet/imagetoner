import { useState, useCallback, useEffect } from "react";
import AudioTimeline from "@/components/AudioTimeline";
import { DEFAULT_TRACKS } from "@/utils/audio/audioTimelineUtils";
import { TrackMode } from "@/types/audio/audiotimeline";
import { InstrumentType, Note } from "@/types/audio";

import { getDefaultScaleForInstrument, getScaleNotes } from "@/utils/audio/scales";

const AudioTimelinePage = () => {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);

  // Track management functions
  const handleNoteRemove = useCallback((trackId: string, noteId: string) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => (track.id === trackId ? { ...track, notes: track.notes.filter((note) => note.id !== noteId) } : track)),
    );
  }, []);

  const handleAddNote = useCallback((trackId: string, note: Note) => {
    setTracks((prevTracks) => {
      // First find the track
      const track = prevTracks.find((t) => t.id === trackId);

      // If track has a scale defined, check if note is in scale or adjust it
      if (track && track.rootNote && track.scaleName && track.scaleNotes) {
        // You could add scale filtering here if needed
        // For now we'll just add the note as is
      }

      // Add the note to the track
      return prevTracks.map((track) => (track.id === trackId ? { ...track, notes: [...track.notes, note] } : track));
    });
  }, []);

  const handleTrackModeToggle = useCallback((trackId: string) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              mode: track.mode === TrackMode.STEP ? TrackMode.XY : track.mode === TrackMode.XY ? TrackMode.CIRCULAR : TrackMode.STEP,
            }
          : track,
      ),
    );
  }, []);

  const handleTrackLengthChange = useCallback((trackId: string, length: number) => {
    setTracks((prevTracks) => prevTracks.map((track) => (track.id === trackId ? { ...track, length } : track)));
  }, []);

  const handleTrackMute = useCallback((trackId: string) => {
    setTracks((prevTracks) => {
      // First update the mute state for the track
      const updatedTracks = prevTracks.map((track) => (track.id === trackId ? { ...track, mute: !track.mute } : track));

      // Then check if any track is soloed
      const anySoloed = updatedTracks.some((track) => track.solo);

      // Update scheduler muted state based on solo/mute state
      if (anySoloed) {
        return updatedTracks.map((track) => ({
          ...track,
          schedulerMuted: !track.solo,
        }));
      } else {
        return updatedTracks.map((track) => ({
          ...track,
          schedulerMuted: track.mute,
        }));
      }
    });
  }, []);

  const handleTrackSolo = useCallback(
    (trackId: string) => {
      const currentSoloState = tracks.find((t) => t.id === trackId)?.solo || false;

      setTracks((prevTracks) => {
        // If unsolo-ing, just unsolo this track
        if (currentSoloState) {
          return prevTracks.map((track) => (track.id === trackId ? { ...track, solo: false } : track));
        }

        // If solo-ing, solo this track and unsolo all others
        const updatedTracks = prevTracks.map((track) => ({
          ...track,
          solo: track.id === trackId,
        }));

        // Also update the scheduler muted state based on solo
        return updatedTracks.map((track) => ({
          ...track,
          schedulerMuted: track.solo ? false : true,
        }));
      });
    },
    [tracks],
  );

  const handleOctaveChange = useCallback((trackId: string, change: number) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              octaveOffset: (track.octaveOffset || 0) + change,
            }
          : track,
      ),
    );
  }, []);

  const handleAddTrack = useCallback(() => {
    const newTrackId = `track-${tracks.length + 1}`;
    const newTrack = {
      id: newTrackId,
      name: `Track ${tracks.length + 1}`,
      mode: TrackMode.STEP,
      notes: [],
      length: 16,
      color: getRandomColor(),
      solo: false,
      mute: false,
      schedulerMuted: false,
      instrument: InstrumentType.Sine,
      octaveOffset: 0,
      // Add default scale based on instrument
      ...getDefaultScaleForInstrument(InstrumentType.Sine),
      // Cache scale notes
      scaleNotes: getScaleNotes("C", "major"),
      // For circular mode
      loopIndependently: true,
    };

    // Check if any track is already soloed
    const anySoloed = tracks.some((track) => track.solo);
    if (anySoloed) {
      newTrack.schedulerMuted = true; // New track is muted if any track is soloed
    }

    setTracks((prev) => [...prev, newTrack]);
  }, [tracks]);

  // Helper function to generate random colors
  const getRandomColor = () => {
    const colors = ["#4a90e2", "#50e3c2", "#e2574a", "#e2c64a", "#bd10e0", "#9013fe", "#4a6fe3"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle scale changes
  const handleScaleChange = useCallback((trackId: string, rootNote: string, scaleName: string) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              rootNote,
              scaleName,
              scaleNotes: getScaleNotes(rootNote, scaleName),
            }
          : track,
      ),
    );
  }, []);

  // Initialize tracks with scheduler muted state on component mount
  useEffect(() => {
    setTracks((prevTracks) => {
      const anySoloed = prevTracks.some((track) => track.solo);

      if (anySoloed) {
        // If any track is soloed, only soloed tracks should play
        return prevTracks.map((track) => ({
          ...track,
          schedulerMuted: !track.solo,
        }));
      } else {
        // Otherwise respect individual mute settings
        return prevTracks.map((track) => ({
          ...track,
          schedulerMuted: track.mute,
        }));
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-4 pt-16 md:pt-20">
      <h1 className="text-2xl font-bold text-white mb-4 mt-2">Audio Timeline</h1>
      {/*<p className="text-gray-400 mb-4">Toggle track modes to try STEP, XY, and CIRCULAR views. Set scales for each track to constrain notes.</p>*/}
      <AudioTimeline
        tracks={tracks}
        onAddTrack={handleAddTrack}
        onTrackModeToggle={handleTrackModeToggle}
        onTrackLengthChange={handleTrackLengthChange}
        onTrackMute={handleTrackMute}
        onTrackSolo={handleTrackSolo}
        onOctaveChange={handleOctaveChange}
        onAddNote={handleAddNote}
        onScaleChange={handleScaleChange}
        onNoteRemove={handleNoteRemove}
      />
    </div>
  );
};

export default AudioTimelinePage;
