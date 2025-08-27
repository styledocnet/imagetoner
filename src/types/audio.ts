export interface AudioRecordingDocument {
  id?: number; // IndexedDB key, auto-incremented
  name: string;
  blob: Blob;
  mimeType: string;
  duration?: number; // seconds
  createdAt: string;
  updatedAt: string;
  // more metadata (e.g. pitch, note, user, device info)
}

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
  instrument: InstrumentType | string; // Instrument assigned to the note
  sampleUrl?: string; // URL of the sample if instrument is OneShotSampler
  isGhost?: boolean; // Whether this is a ghost note (lower velocity/emphasis)
  variation?: string; // Which variation this note belongs to (A, B, C, D)
  // Aliases for compatibility with some components
  time?: number; // Alias for start
  duration?: number; // Alias for length
}

export interface TimelineSettings {
  bpm: number; // Beats per minute
  isLooping: boolean; // Whether looping is enabled
  gridLength: number; // Total number of 16th note divisions in the grid
  zoom: number;
  currentVariation?: string; // Current active variation (A, B, C, D)
}

// Represents playback state of the NoteScheduler
export interface PlaybackState {
  isPlaying: boolean; // Whether playback is currently active
  currentStep: number; // Current step in the timeline (in 16th notes)
  currentVariation?: string; // Which variation is currently playing
}

// Represents user interactions with the timeline
export interface TimelineInteraction {
  selectedNoteId: string | null; // ID of the currently selected note
  isDragging: boolean; // Whether a note is being dragged
  dragStartPos?: number; // Start position of the drag (if applicable)
}
