import { useState, useCallback } from "react";
import { getNextTrackId, toggleSolo, updateSchedulerBasedOnSoloMute, DEFAULT_TRACKS, Track } from "@/utils/audio/audioTimelineUtils";
import { Note } from "@/types/audio";

// Define the Track interface based on your app structure
export interface AudioTrack {
  id: string;
  name: string;
  notes: Note[];
  muted: boolean;
  solo: boolean;
  looping: boolean;
  schedulerMuted?: boolean;
  octave: number;
  instrument: string;
  currentVariation: string;
  variations: {
    [key: string]: {
      notes: Note[];
    };
  };
  // Properties needed to match Track interface
  mode: string;
  length: number;
  color: string;
  mute: boolean;
  // Add other track properties
}

export function useAudioTrackManagement(initialTracks = DEFAULT_TRACKS) {
  const [tracks, setTracks] = useState<AudioTrack[]>(initialTracks.length > 0 ? (initialTracks as AudioTrack[]) : createDefaultTracks());
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  // Function to create default tracks
  function createDefaultTracks(): AudioTrack[] {
    // Create a lead track with a funky pattern
    const leadTrack = createTrack("Lead Synth", "lead", createFunkyLeadPattern());

    // Create a bass track
    const bassTrack = createTrack("Bass", "bass", createBasicBassPattern());

    // Create drum tracks
    const snareTrack = createTrack("Snare", "snare", createSnarePattern(true)); // with ghost notes
    const hihatTrack = createTrack("Hi-Hats", "hihat", createHiHatPattern());

    // Create a kick drum track
    const kickTrack = createTrack("Kick", "kick", createKickPattern());

    // Create an additional percussion track
    const percTrack = createTrack("Percussion", "percussion", createPercussionPattern());

    return [leadTrack, bassTrack, kickTrack, snareTrack, hihatTrack, percTrack];
  }

  // Helper to create a track with variations
  function createTrack(name: string, instrument: string, notes: Note[]): AudioTrack {
    return {
      id: getNextTrackId() as unknown as string,
      name,
      notes,
      muted: false,
      solo: false,
      looping: true,
      octave: 4,
      instrument,
      currentVariation: "A",
      variations: {
        A: { notes },
        B: { notes: [] },
        C: { notes: [] },
        D: { notes: [] },
      },
      // Add required properties to match Track interface
      mode: "STEP",
      length: 16,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      mute: false,
    };
  }

  const addTrack = useCallback(() => {
    const newTrack = {
      id: getNextTrackId(),
      name: `Track ${tracks.length + 1}`,
      notes: [],
      muted: false,
      solo: false,
      looping: true,
      octave: 4,
      instrument: "Sawtooth",
      currentVariation: "A",
      variations: {
        A: { notes: [] },
        B: { notes: [] },
        C: { notes: [] },
        D: { notes: [] },
      },
      // Add required properties to match Track interface
      mode: "STEP",
      length: 16,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      mute: false,
    };

    setTracks((prev) => [...prev, newTrack as AudioTrack]);
    setSelectedTrackId(String(newTrack.id));
  }, [tracks]);

  const deleteTrack = useCallback(
    (trackId: number) => {
      setTracks((prev) => prev.filter((track) => track.id !== (trackId as unknown as string)));

      // If we're deleting the selected track, clear the selection
      if (selectedTrackId === trackId.toString()) {
        setSelectedTrackId(null);
      }
    },
    [selectedTrackId],
  );

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks((prev) => {
      const updatedTracks = prev.map((track) => (track.id === trackId ? { ...track, muted: !track.muted } : track));

      // Update scheduler muted states
      return updateSchedulerBasedOnSoloMute(updatedTracks as unknown as Track[]) as unknown as AudioTrack[];
    });
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks((prev) => {
      // Convert AudioTrack[] to Track[] for toggleSolo function
      const tracksAsAny = prev as any;
      const updatedTracks = toggleSolo(tracksAsAny, trackId);

      // Convert Track[] back to AudioTrack[] after scheduler update
      return updateSchedulerBasedOnSoloMute(updatedTracks as any) as any as AudioTrack[];
    });
  }, []);

  const toggleTrackLoopMode = useCallback((trackId: string) => {
    setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, looping: !track.looping } : track)));
  }, []);

  const shiftTrackOctave = useCallback((trackId: string, direction: "up" | "down") => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== (trackId as unknown as string)) return track;

        // Apply octave shift (typically up/down by 1)
        const octaveChange = direction === "up" ? 1 : -1;
        const newOctave = Math.min(Math.max(0, track.octave + octaveChange), 8); // Limit octaves between 0-8

        // Update notes with new octave for the current variation
        const variation = track.currentVariation;
        const updatedVariations = { ...track.variations };

        // Update notes for current variation
        if (variation && updatedVariations[variation]) {
          updatedVariations[variation].notes = updatedVariations[variation].notes.map((note) => ({
            ...note,
            pitch: updateNotePitch(note.pitch, newOctave - track.octave),
          }));
        }

        // Also update the main notes array for backward compatibility
        const updatedNotes = track.notes.map((note) => ({
          ...note,
          pitch: updateNotePitch(note.pitch, newOctave - track.octave),
        }));

        return {
          ...track,
          octave: newOctave,
          notes: updatedNotes,
          variations: updatedVariations,
        };
      }),
    );
  }, []);

  // Helper function to update a note's pitch based on octave change
  const updateNotePitch = (pitch: string, octaveChange: number) => {
    // This implementation depends on your pitch representation format
    // Example: If pitch is "C4", this would change it to "C5" for octaveChange=1
    // Adapt based on your actual note pitch format

    // For a simple format like "C4", "D#3", etc:
    const noteName = pitch.replace(/\d+$/, "");
    const octave = parseInt(pitch.match(/\d+$/)?.[0] || "4", 10);
    return `${noteName}${octave + octaveChange}`;
  };

  const removeNote = useCallback((trackId: number, noteId: string | number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId.toString()) return track;

        // Remove note from the current variation
        const variation = track.currentVariation;
        const updatedVariations = { ...track.variations };

        if (variation && updatedVariations[variation]) {
          updatedVariations[variation].notes = updatedVariations[variation].notes.filter((note) => note.id !== noteId);
        }

        // Also update the main notes array
        const updatedNotes = track.notes.filter((note) => note.id !== noteId);

        return {
          ...track,
          notes: updatedNotes,
          variations: updatedVariations,
        };
      }),
    );
  }, []);

  // Switch track variation (A, B, C, D)
  const switchVariation = useCallback((trackId: number, variation: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== trackId.toString()) return track;

        // If switching to the same variation, no change needed
        if (track.currentVariation === variation) return track;

        // Keep track of current notes
        const currentVariation = track.currentVariation;
        const updatedVariations = { ...track.variations };

        // Store current notes in the current variation
        if (currentVariation) {
          updatedVariations[currentVariation].notes = [...track.notes];
        }

        // Get notes from the target variation or use empty array if no notes
        const targetNotes = (variation && updatedVariations[variation] && updatedVariations[variation].notes) || [];

        return {
          ...track,
          currentVariation: variation,
          notes: [...targetNotes],
          variations: updatedVariations,
        };
      }),
    );
  }, []);

  // Create a funky lead pattern
  const createFunkyLeadPattern = useCallback(() => {
    const notes: Note[] = [];

    // Add some funky notes with syncopation (Variation A - Main pattern)
    notes.push({ id: "lead-1", start: 0, length: 1, pitch: "C3", instrument: "lead", variation: "A" });
    notes.push({ id: "lead-2", start: 1.5, length: 0.5, pitch: "E2", instrument: "lead", variation: "A" });
    notes.push({ id: "lead-3", start: 2, length: 1, pitch: "G4", instrument: "lead", variation: "A" });
    notes.push({ id: "lead-4", start: 3.5, length: 2, pitch: "A2", instrument: "lead", variation: "A" }); // hanging note
    notes.push({ id: "lead-5", start: 6, length: 0.5, pitch: "D4", instrument: "lead", variation: "A" });
    notes.push({ id: "lead-6", start: 7, length: 0.2, pitch: "C3", instrument: "lead", variation: "A" });

    // Add a B variation with a different pattern (Variation B - Chorus)
    notes.push({ id: "lead-b-1", start: 0, length: 0.5, pitch: "E4", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-2", start: 1, length: 0.5, pitch: "G4", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-3", start: 2, length: 0.5, pitch: "A4", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-4", start: 3, length: 0.5, pitch: "C5", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-5", start: 4, length: 0.5, pitch: "E4", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-6", start: 5, length: 0.5, pitch: "G4", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-7", start: 6, length: 0.5, pitch: "A4", instrument: "lead", variation: "B" });
    notes.push({ id: "lead-b-8", start: 7, length: 0.5, pitch: "D5", instrument: "lead", variation: "B" });

    // Add a C variation (Variation C - Break)
    notes.push({ id: "lead-c-1", start: 0, length: 2, pitch: "C5", instrument: "lead", variation: "C" });
    notes.push({ id: "lead-c-2", start: 4, length: 2, pitch: "G4", instrument: "lead", variation: "C" });
    notes.push({ id: "lead-c-3", start: 8, length: 4, pitch: "E4", instrument: "lead", variation: "C" });

    // Add a D variation with a fill pattern (Variation D - Fill)
    notes.push({ id: "lead-d-1", start: 0, length: 0.25, pitch: "C5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-2", start: 0.25, length: 0.25, pitch: "D5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-3", start: 0.5, length: 0.25, pitch: "E5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-4", start: 0.75, length: 0.25, pitch: "G5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-5", start: 1, length: 0.25, pitch: "A5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-6", start: 1.25, length: 0.25, pitch: "G5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-7", start: 1.5, length: 0.25, pitch: "E5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-8", start: 1.75, length: 0.25, pitch: "D5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-9", start: 2, length: 2, pitch: "C5", instrument: "lead", variation: "D" });
    notes.push({ id: "lead-d-10", start: 4, length: 4, pitch: "G4", instrument: "lead", variation: "D" });

    return notes;
  }, []);

  // Create a basic bass pattern
  const createBasicBassPattern = useCallback(() => {
    const notes: Note[] = [];

    // Add some bass notes (Variation A - Main pattern)
    notes.push({ id: "bass-1", start: 0, length: 1, pitch: "C2", instrument: "bass", variation: "A" });
    notes.push({ id: "bass-2", start: 2, length: 1, pitch: "G2", instrument: "bass", variation: "A" });
    notes.push({ id: "bass-3", start: 4, length: 1, pitch: "A2", instrument: "bass", variation: "A" });
    notes.push({ id: "bass-4", start: 6, length: 1, pitch: "F2", instrument: "bass", variation: "A" });

    // Variation B - More active bass line
    notes.push({ id: "bass-b-1", start: 0, length: 0.5, pitch: "C2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-2", start: 1, length: 0.5, pitch: "C2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-3", start: 2, length: 0.5, pitch: "G2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-4", start: 3, length: 0.5, pitch: "G2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-5", start: 4, length: 0.5, pitch: "A2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-6", start: 5, length: 0.5, pitch: "A2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-7", start: 6, length: 0.5, pitch: "F2", instrument: "bass", variation: "B" });
    notes.push({ id: "bass-b-8", start: 7, length: 0.5, pitch: "F2", instrument: "bass", variation: "B" });

    // Variation C - Sparse bass for break section
    notes.push({ id: "bass-c-1", start: 0, length: 2, pitch: "C2", instrument: "bass", variation: "C" });
    notes.push({ id: "bass-c-2", start: 4, length: 2, pitch: "G1", instrument: "bass", variation: "C" });

    // Variation D - Fill pattern with octave jumps
    notes.push({ id: "bass-d-1", start: 0, length: 0.5, pitch: "C2", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-2", start: 0.5, length: 0.5, pitch: "C3", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-3", start: 1, length: 0.5, pitch: "C2", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-4", start: 1.5, length: 0.5, pitch: "C3", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-5", start: 2, length: 0.5, pitch: "G2", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-6", start: 2.5, length: 0.5, pitch: "G3", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-7", start: 3, length: 0.5, pitch: "G2", instrument: "bass", variation: "D" });
    notes.push({ id: "bass-d-8", start: 3.5, length: 0.5, pitch: "G3", instrument: "bass", variation: "D" });

    return notes;
  }, []);

  // Create a snare pattern with ghost notes
  const createSnarePattern = useCallback((includeGhostNotes: boolean = false) => {
    const notes: Note[] = [];

    // Main snare hits on 2 and 4 (Variation A - Standard backbeat)
    notes.push({ id: "snare-1", start: 4, length: 0.5, pitch: "D3", instrument: "snare", variation: "A" });
    notes.push({ id: "snare-2", start: 12, length: 0.5, pitch: "D3", instrument: "snare", variation: "A" });

    // Add ghost notes if requested
    if (includeGhostNotes) {
      notes.push({
        id: "snare-g1",
        start: 6.5,
        length: 0.25,
        pitch: "D3",
        instrument: "snare",
        isGhost: true,
        variation: "A",
      });
      notes.push({
        id: "snare-g2",
        start: 7.5,
        length: 0.25,
        pitch: "D3",
        instrument: "snare",
        isGhost: true,
        variation: "A",
      });
      notes.push({
        id: "snare-g3",
        start: 10.5,
        length: 0.25,
        pitch: "D3",
        instrument: "snare",
        isGhost: true,
        variation: "A",
      });
    }

    // Variation B - Busier pattern with more hits
    notes.push({ id: "snare-b-1", start: 4, length: 0.5, pitch: "D3", instrument: "snare", variation: "B" });
    notes.push({ id: "snare-b-2", start: 8, length: 0.5, pitch: "D3", instrument: "snare", variation: "B" });
    notes.push({ id: "snare-b-3", start: 10, length: 0.5, pitch: "D3", instrument: "snare", variation: "B" });
    notes.push({ id: "snare-b-4", start: 12, length: 0.5, pitch: "D3", instrument: "snare", variation: "B" });

    // Variation C - Break pattern with rim shots
    notes.push({
      id: "snare-c-1",
      start: 4,
      length: 0.5,
      pitch: "E3", // Rim shot
      instrument: "snare",
      variation: "C",
    });
    notes.push({
      id: "snare-c-2",
      start: 12,
      length: 0.5,
      pitch: "E3", // Rim shot
      instrument: "snare",
      variation: "C",
    });

    // Variation D - Fill pattern (typical snare fill at the end of a phrase)
    notes.push({ id: "snare-d-1", start: 0, length: 0.5, pitch: "D3", instrument: "snare", variation: "D" });
    notes.push({ id: "snare-d-2", start: 2, length: 0.5, pitch: "D3", instrument: "snare", variation: "D" });
    notes.push({ id: "snare-d-3", start: 4, length: 0.5, pitch: "D3", instrument: "snare", variation: "D" });

    // Add sixteenth note fill at the end
    for (let i = 0; i < 8; i++) {
      notes.push({
        id: `snare-d-fill-${i}`,
        start: 8 + i * 0.5,
        length: 0.5,
        pitch: "D3",
        instrument: "snare",
        variation: "D",
      });
    }

    return notes;
  }, []);

  // Create a hi-hat pattern
  const createHiHatPattern = useCallback(() => {
    const notes: Note[] = [];

    // Create a funky hi-hat pattern (Variation A - Main pattern)
    for (let i = 0; i < 16; i++) {
      // Closed hi-hats on all 8th notes
      notes.push({
        id: `hihat-${i}`,
        start: i * 2,
        length: 0.5,
        pitch: "F#3", // Closed hi-hat
        instrument: "hihat",
        variation: "A",
      });

      // Add some open hi-hats for variety on offbeats
      if (i % 2 === 1 && i !== 3 && i !== 7) {
        notes.push({
          id: `hihat-open-${i}`,
          start: i * 2 + 1,
          length: 0.5,
          pitch: "A#3", // Open hi-hat
          instrument: "hihat",
          variation: "A",
        });
      }
    }

    // Create a simpler B variation (Variation B - Half-time feel)
    for (let i = 0; i < 8; i++) {
      notes.push({
        id: `hihat-b-${i}`,
        start: i * 4,
        length: 0.5,
        pitch: "F#3", // Closed hi-hat
        instrument: "hihat",
        variation: "B",
      });

      // Add open hi-hats on the off-beats
      if (i % 2 === 0) {
        notes.push({
          id: `hihat-b-open-${i}`,
          start: i * 4 + 2,
          length: 0.5,
          pitch: "A#3", // Open hi-hat
          instrument: "hihat",
          variation: "B",
        });
      }
    }

    // Variation C - Break pattern (ride cymbal instead of hi-hat)
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) {
        notes.push({
          id: `hihat-c-${i}`,
          start: i * 4,
          length: 0.5,
          pitch: "C#4", // Ride cymbal
          instrument: "hihat",
          variation: "C",
        });
      }
    }

    // Variation D - Build-up/fill pattern (increasing intensity)
    // Quarter notes
    for (let i = 0; i < 4; i++) {
      notes.push({
        id: `hihat-d-q-${i}`,
        start: i * 4,
        length: 0.5,
        pitch: "F#3", // Closed hi-hat
        instrument: "hihat",
        variation: "D",
      });
    }

    // Eighth notes
    for (let i = 0; i < 4; i++) {
      notes.push({
        id: `hihat-d-e-${i}`,
        start: 16 + i * 2,
        length: 0.5,
        pitch: "F#3", // Closed hi-hat
        instrument: "hihat",
        variation: "D",
      });
    }

    // Sixteenth notes (building up intensity)
    for (let i = 0; i < 8; i++) {
      notes.push({
        id: `hihat-d-s-${i}`,
        start: 24 + i,
        length: 0.25,
        pitch: "F#3", // Closed hi-hat
        instrument: "hihat",
        variation: "D",
      });
    }

    // Thirty-second notes for the final build-up
    for (let i = 0; i < 16; i++) {
      notes.push({
        id: `hihat-d-t-${i}`,
        start: 28 + i * 0.5,
        length: 0.125,
        pitch: i % 2 === 0 ? "F#3" : "A#3", // Alternating closed and open
        instrument: "hihat",
        variation: "D",
      });
    }

    return notes;
  }, []);

  // Create a kick drum pattern
  const createKickPattern = useCallback(() => {
    const notes: Note[] = [];

    // Variation A - Basic four-on-the-floor pattern
    for (let i = 0; i < 4; i++) {
      notes.push({
        id: `kick-a-${i}`,
        start: i * 4,
        length: 0.5,
        pitch: "C1",
        instrument: "kick",
        variation: "A",
      });
    }

    // Variation B - More complex kick pattern
    notes.push({ id: "kick-b-1", start: 0, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-2", start: 3, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-3", start: 4, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-4", start: 7, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-5", start: 8, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-6", start: 10, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-7", start: 12, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });
    notes.push({ id: "kick-b-8", start: 14, length: 0.5, pitch: "C1", instrument: "kick", variation: "B" });

    // Variation C - Sparse kick for break
    notes.push({ id: "kick-c-1", start: 0, length: 0.5, pitch: "C1", instrument: "kick", variation: "C" });
    notes.push({ id: "kick-c-2", start: 8, length: 0.5, pitch: "C1", instrument: "kick", variation: "C" });

    // Variation D - Fill pattern
    notes.push({ id: "kick-d-1", start: 0, length: 0.5, pitch: "C1", instrument: "kick", variation: "D" });
    notes.push({ id: "kick-d-2", start: 4, length: 0.5, pitch: "C1", instrument: "kick", variation: "D" });
    // Double kicks at the end
    notes.push({ id: "kick-d-3", start: 12, length: 0.25, pitch: "C1", instrument: "kick", variation: "D" });
    notes.push({ id: "kick-d-4", start: 12.5, length: 0.25, pitch: "C1", instrument: "kick", variation: "D" });
    notes.push({ id: "kick-d-5", start: 13, length: 0.25, pitch: "C1", instrument: "kick", variation: "D" });
    notes.push({ id: "kick-d-6", start: 13.5, length: 0.25, pitch: "C1", instrument: "kick", variation: "D" });

    return notes;
  }, []);

  // Create percussion pattern
  const createPercussionPattern = useCallback(() => {
    const notes: Note[] = [];

    // Variation A - Basic percussion pattern
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 1) {
        notes.push({
          id: `perc-a-${i}`,
          start: i * 2,
          length: 0.5,
          pitch: "D#3", // Conga
          instrument: "percussion",
          variation: "A",
        });
      }
    }

    // Variation B - More complex percussion
    notes.push({ id: "perc-b-1", start: 2, length: 0.5, pitch: "D#3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-2", start: 3, length: 0.5, pitch: "F3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-3", start: 6, length: 0.5, pitch: "D#3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-4", start: 7, length: 0.5, pitch: "F3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-5", start: 10, length: 0.5, pitch: "D#3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-6", start: 11, length: 0.5, pitch: "F3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-7", start: 14, length: 0.5, pitch: "D#3", instrument: "percussion", variation: "B" });
    notes.push({ id: "perc-b-8", start: 15, length: 0.5, pitch: "F3", instrument: "percussion", variation: "B" });

    // Variation C - Shaker pattern for break
    for (let i = 0; i < 16; i++) {
      notes.push({
        id: `perc-c-${i}`,
        start: i,
        length: 0.25,
        pitch: "A#3", // Shaker
        instrument: "percussion",
        variation: "C",
        isGhost: i % 2 === 0, // Alternating accents
      });
    }

    // Variation D - Fill pattern
    for (let i = 0; i < 8; i++) {
      notes.push({
        id: `perc-d-${i}`,
        start: 8 + i * 0.5,
        length: 0.25,
        pitch: i % 3 === 0 ? "F3" : i % 3 === 1 ? "D#3" : "G3", // Different percussion sounds
        instrument: "percussion",
        variation: "D",
      });
    }

    return notes;
  }, []);

  return {
    tracks,
    selectedTrackId,
    setSelectedTrackId,
    addTrack,
    deleteTrack,
    toggleTrackMute,
    toggleTrackSolo,
    toggleTrackLoopMode,
    shiftTrackOctave,
    removeNote,
    switchVariation,
    createFunkyLeadPattern,
    createBasicBassPattern,
    createSnarePattern,
    createHiHatPattern,
    createKickPattern,
    createPercussionPattern,
  };
}
