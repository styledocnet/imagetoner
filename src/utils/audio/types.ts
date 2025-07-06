// export type InstrumentType =
//   | "Sawtooth"
//   | "Sine"
//   | "Square"
//   | "PWM"
//   | "OneShotSampler";

export enum InstrumentType {
  Sawtooth = "Sawtooth",
  Sine = "Sine",
  Square = "Square",
  PWM = "PWM",
  OneShotSampler = "OneShotSampler",
}

// Represents a musical note placed on the timeline
export interface Note {
  id: string; // Unique identifier for the note
  start: number; // Start position in 16th notes (relative to the timeline)
  length: number; // Length in 16th notes
  pitch: string; // Note pitch (e.g., C4, D#5)
  velocity?: number; // Velocity (optional, range 0-127)
  instrument: InstrumentType; // Instrument assigned to the note
  sampleUrl?: string; // URL of the sample if instrument is OneShotSampler
}

export interface TimelineSettings {
  bpm: number; // Beats per minute
  isLooping: boolean; // Whether looping is enabled
  gridLength: number; // Total number of 16th note divisions in the grid
  zoom: number;
}

// Represents playback state of the NoteScheduler
export interface PlaybackState {
  isPlaying: boolean; // Whether playback is currently active
  currentStep: number; // Current step in the timeline (in 16th notes)
}

// Represents user interactions with the timeline
export interface TimelineInteraction {
  selectedNoteId: string | null; // ID of the currently selected note
  isDragging: boolean; // Whether a note is being dragged
  dragStartPos?: number; // Start position of the drag (if applicable)
}
