import * as Tone from "tone";
import { Note, InstrumentType } from "@/types/audio";

// Define scheduled note type
interface ScheduledNote extends Note {
  trackId?: string;
}
// Define scheduled note type
interface ScheduledNote extends Note {
  trackId?: string;
  trackLength?: number;
  loopIndependently?: boolean;
}

export class ToneNoteScheduler {
  private notes: Map<string, ScheduledNote> = new Map();
  public isLooping: boolean = true;
  private trackInfo: Map<string, { length: number; loopIndependently: boolean }> = new Map();
  private synths: Map<string, Tone.Synth | any> = new Map();
  private transportIds: Map<string, number> = new Map();
  private scheduleIds: number[] = [];

  constructor(bpm: number, onStep: (step: number) => void, isLoop: boolean = true) {
    // Set initial BPM
    Tone.Transport.bpm.value = bpm;
    this.isLooping = isLoop;

    // Set up looping
    Tone.Transport.loop = isLoop;
    Tone.Transport.loopEnd = 16; // 16 measures (256 steps) to accommodate longer patterns

    // Reset transport position
    Tone.Transport.position = 0;

    // Schedule step counter
    const stepEvent = Tone.Transport.scheduleRepeat((_time) => {
      try {
        // Calculate current step based on 16th notes (4 per beat)
        const sixteenths = Tone.Transport.position.toString().split(":");
        const measure = parseInt(sixteenths[0]);
        const beat = parseInt(sixteenths[1]);
        const sixteenth = Math.round(parseFloat(sixteenths[2]) * 4);
        const currentStep = measure * 16 + beat * 4 + sixteenth;
        onStep(currentStep);
      } catch (error) {
        console.error("Error in step counter:", error);
      }
    }, "16n"); // 16th note intervals

    this.scheduleIds.push(stepEvent);
  }

  addNoteToScheduler(note: ScheduledNote) {
    // Create a unique internal ID if not provided
    const noteId = note.id || `note-${Math.random().toString(36).substr(2, 9)}`;

    // Normalize the note properties to handle both naming conventions
    const normalizedNote = {
      ...note,
      id: noteId,
      // Ensure start and length are set
      start: note.start !== undefined ? note.start : note.time || 0,
      length: note.length !== undefined ? note.length : note.duration || 1,
      // Ensure required properties are present
      pitch: note.pitch || "C4",
      instrument: note.instrument || InstrumentType.Sine,
      // Track-specific looping
      trackLength: note.trackLength || 16, // Default to 16 steps if not specified
      loopIndependently: note.loopIndependently || true, // Default to true for independent looping
      trackId: note.trackId || undefined,
    };

    console.log(`Adding note to scheduler: ${normalizedNote.pitch} at step ${normalizedNote.start} with length ${normalizedNote.length}`);

    // Store track info for independent looping if available
    if (normalizedNote.trackId && normalizedNote.trackLength && normalizedNote.loopIndependently) {
      this.trackInfo.set(normalizedNote.trackId, {
        length: normalizedNote.trackLength,
        loopIndependently: normalizedNote.loopIndependently,
      });
    }

    // Store the note with its track information
    this.notes.set(noteId, normalizedNote);

    // Calculate time values, with track-specific looping if applicable
    const startTime = this.calculateTimeFromStep(normalizedNote.start, normalizedNote.trackId);
    const duration = this.calculateDurationFromLength(normalizedNote.length);

    // Add to Tone.js transport with looping if needed
    let transportId: number;

    if (normalizedNote.trackId && normalizedNote.trackLength && normalizedNote.loopIndependently) {
      // For independently looping tracks, schedule repeated playback
      const trackLength = normalizedNote.trackLength;
      const loopInterval = `0:${Math.floor(trackLength / 4)}:${trackLength % 4}`; // Convert to bars:beats:sixteenths

      transportId = Tone.Transport.scheduleRepeat(
        (time) => {
          this.playNote(normalizedNote, time, duration);
        },
        loopInterval, // Loop interval based on track length
        startTime, // Start time
        undefined, // End time (undefined = forever)
      );
    } else {
      // For non-looping notes, schedule once
      transportId = Tone.Transport.schedule((time) => {
        this.playNote(normalizedNote, time, duration);
      }, startTime);
    }

    // Store transport ID for cleanup
    this.transportIds.set(noteId, transportId);

    return noteId;
  }

  removeNoteFromScheduler(noteId: string) {
    // Clear from transport
    const transportId = this.transportIds.get(noteId);
    if (transportId !== undefined) {
      Tone.Transport.clear();
      this.transportIds.delete(noteId);
    }

    // Remove from notes collection
    this.notes.delete(noteId);
  }

  // Helper method to convert step to time, with optional track-specific looping
  private calculateTimeFromStep(step: number, trackId?: string): string {
    // Handle track-specific looping if applicable
    if (trackId && this.trackInfo.has(trackId) && this.trackInfo.get(trackId)?.loopIndependently) {
      const trackLength = this.trackInfo.get(trackId)!.length;
      if (trackLength > 0) {
        // Loop the step within the track's length
        step = step % trackLength;
      }
    }

    // Ensure step is non-negative
    step = Math.max(0, step);

    // Convert step (in 16th notes) to musical notation time
    const measure = Math.floor(step / 16);
    const beat = Math.floor((step % 16) / 4);
    const sixteenth = step % 4;

    const timeString = `${measure}:${beat}:${sixteenth}`;
    return timeString;
  }

  // Helper method to convert length to duration
  private calculateDurationFromLength(length: number): string {
    // Convert length (in 16th notes) to musical notation duration
    return `${length / 4}n`;
  }

  // Play a note with the appropriate instrument
  private playNote(note: ScheduledNote, time: number, duration: string) {
    try {
      // Get or create an appropriate instrument based on the note type
      let instrument;
      const instrumentKey = `${note.instrument || "default"}_${note.trackId || "global"}`;

      if (!this.synths.has(instrumentKey)) {
        // Create a new instrument based on the type
        switch (note.instrument) {
          case InstrumentType.Sawtooth:
            instrument = new Tone.Synth({
              oscillator: { type: "sawtooth" },
              envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 },
            }).toDestination();
            break;
          case InstrumentType.Sine:
            instrument = new Tone.Synth({
              oscillator: { type: "sine" },
              envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4 },
            }).toDestination();
            break;
          case InstrumentType.Square:
            instrument = new Tone.Synth({
              oscillator: { type: "square" },
              envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
            }).toDestination();
            break;
          case InstrumentType.PWM:
            instrument = new Tone.Synth({
              oscillator: { type: "pwm" },
              envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
            }).toDestination();
            break;
          case InstrumentType.OneShotSampler:
            // Simple sampler for percussion sounds
            instrument = new Tone.Synth({
              oscillator: { type: "triangle" },
              envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
            }).toDestination();
            break;
          default:
            instrument = new Tone.Synth({
              oscillator: { type: "triangle" },
              envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 },
            }).toDestination();
        }

        this.synths.set(instrumentKey, instrument);
        console.log(`Created new instrument: ${instrumentKey}`);
      } else {
        instrument = this.synths.get(instrumentKey);
      }

      // Adjust velocity if present
      const velocity = note.velocity ? note.velocity / 127 : 0.7;

      // Play the note
      if (instrument) {
        console.log(`Playing note: ${note.pitch} at time ${time} with velocity ${velocity} and duration ${duration}`);
        instrument.triggerAttackRelease(note.pitch, duration, time, velocity);
      } else {
        console.warn("Instrument not found for note:", note);
      }
    } catch (error) {
      console.error("Error playing note:", error);
    }
  }

  start() {
    // Ensure Tone.js is started
    if (Tone.context.state !== "running") {
      Tone.context.resume().catch(console.error);
    }

    // Ensure notes play from the beginning
    if (Tone.Transport.state === "stopped") {
      Tone.Transport.position = 0;
    }

    Tone.Transport.start();
  }

  stop() {
    // Stop all synths that might be playing
    this.synths.forEach((synth) => {
      if (synth && typeof synth.triggerRelease === "function") {
        try {
          synth.triggerRelease("+0.1");
        } catch (e) {
          console.warn("Error releasing synth:", e);
        }
      }
    });

    // Make sure to dispose synths to prevent memory leaks
    this.synths.forEach((synth) => {
      if (synth && typeof synth.dispose === "function") {
        try {
          synth.dispose();
        } catch (e) {
          console.warn("Error disposing synth:", e);
        }
      }
    });
    this.synths.clear();

    Tone.Transport.stop();
    Tone.Transport.position = 0;

    // Cancel any scheduled events
    Tone.Transport.cancel();
  }

  pause() {
    Tone.Transport.stop();
  }

  setLoop(shouldLoop: boolean) {
    this.isLooping = shouldLoop;
    Tone.Transport.loop = shouldLoop;
    Tone.Transport.loopEnd = 16; // 16 measures for global looping (256 steps)
  }

  // Add a method to set track-specific looping
  setTrackLoop(trackId: string, shouldLoop: boolean, trackLength: number) {
    if (shouldLoop) {
      this.trackInfo.set(trackId, { length: trackLength, loopIndependently: shouldLoop });

      // For each note in this track, reschedule it to use track-specific looping
      this.notes.forEach((note, noteId) => {
        if (note.trackId === trackId) {
          // Remove the old scheduled event
          const oldTransportId = this.transportIds.get(noteId);
          if (oldTransportId !== undefined) {
            Tone.Transport.clear();
          }

          // Reschedule with track-specific looping
          const startTime = this.calculateTimeFromStep(note.start, trackId);
          const duration = this.calculateDurationFromLength(note.length);

          // Add to Tone.js transport again
          let transportId: number;

          if (shouldLoop) {
            const loopInterval = `0:${Math.floor(trackLength / 4)}:${trackLength % 4}`;
            transportId = Tone.Transport.scheduleRepeat(
              (time) => {
                this.playNote(note, time, duration);
              },
              loopInterval,
              startTime,
              undefined,
            );
          } else {
            transportId = Tone.Transport.schedule((time) => {
              this.playNote(note, time, duration);
            }, startTime);
          }

          // Update transport ID
          this.transportIds.set(noteId, transportId);
        }
      });
    } else {
      this.trackInfo.delete(trackId);
    }
  }

  setBpm(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }

  cleanup() {
    try {
      console.log("Cleaning up ToneNoteScheduler...");

      // Stop transport first
      if (Tone.Transport.state !== "stopped") {
        Tone.Transport.stop();
      }

      // Clear all scheduled events
      this.scheduleIds.forEach((id) => {
        if (id) Tone.Transport.clear();
      });

      this.transportIds.forEach((id) => {
        if (id) Tone.Transport.clear();
      });

      // Cancel all Transport events
      Tone.Transport.cancel();

      // Stop all synths that might be playing
      this.synths.forEach((synth) => {
        if (synth && typeof synth.triggerRelease === "function") {
          try {
            synth.triggerRelease("+0.1");
          } catch (e) {
            console.warn("Error releasing synth:", e);
          }
        }
      });

      // Dispose of synths with a small delay to allow release to complete
      setTimeout(() => {
        this.synths.forEach((synth) => {
          if (synth && typeof synth.dispose === "function") {
            try {
              synth.dispose();
            } catch (e) {
              console.warn("Error disposing synth:", e);
            }
          }
        });
        this.synths.clear();
      }, 100);

      // Clear all collections
      this.scheduleIds = [];
      this.transportIds.clear();
      this.notes.clear();
      this.trackInfo.clear();

      console.log("ToneNoteScheduler cleanup complete");
    } catch (error) {
      console.error("Error during ToneNoteScheduler cleanup:", error);
    }
  }
}
