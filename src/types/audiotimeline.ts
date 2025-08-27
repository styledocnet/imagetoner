import { InstrumentType } from "@/types/audio";

export enum TrackMode {
  STEP = "STEP",
  XY = "XY",
  CIRCULAR = "CIRCULAR", // New circular mode for radial note display
}

/**
 * Extended track properties that enhance the AudioTimeline functionality
 */
export interface ExtendedTrack extends Track {
  octaveOffset?: number; // Track's octave adjustment
  loopIndependently?: boolean; // Whether the track should loop based on its own length
}

export type Track = {
  id: string;
  name: string;
  mode: TrackMode;
  notes: any[]; // Use any[] to avoid direct dependency on Note type
  length: number; // Individual track length in steps
  color: string;
  solo: boolean;
  mute: boolean;
  instrument: InstrumentType;
  // Optional properties added for extended functionality
  octaveOffset?: number;
  octave?: number; // Current octave for the track (0-8)
  loopIndependently?: boolean;
  gainDb?: number; // Track volume in decibels
  pan?: number; // Track stereo position (-1 to 1)
  // Scale properties
  rootNote?: string; // Root note of the scale (e.g., "C", "F#")
  scaleName?: string; // Name of the scale (e.g., "major", "minor pentatonic")
  scaleNotes?: string[]; // Cached notes in the scale
  // Variation properties
  currentVariation?: string; // Current active variation (A, B, C, D)
  variations?: { [key: string]: { notes: any[] } }; // Map of variation name to notes
  looping?: boolean; // Whether track looping is enabled
};

export type GlobalSettings = {
  bpm: number;
  isLooping: boolean;
  zoom: number;
  totalSteps: number; // Global timeline length in steps
  minimapEnabled: boolean;
  layout: "horizontal" | "vertical";
  snapToGrid: boolean;
  gridSubdivision: number; // e.g., 4 for quarter notes, 8 for eighth notes
  currentVariation?: string; // Current global variation (A, B, C, D)
  showBlockArranger?: boolean; // Whether to show the block arranger
};

export type PlaybackState = {
  isPlaying: boolean;
  currentStep: number;
  currentBar: number;
  lastTickTime: number;
  nextNoteTime: number;
  scheduleAheadTime: number;
  currentVariation?: string; // Current active variation during playback
};

export type AudioTimelineState = {
  tracks: Track[];
  globalSettings: GlobalSettings;
  playbackState: PlaybackState;
  selectedTrackId: string | null;
  minimapZoom: number;
  visibleTimeRange: {
    start: number;
    end: number;
  };
};

export type ScheduledNote = {
  id: string;
  trackId?: string;
  // Support both field naming conventions
  start: number;
  length: number;
  time?: number;
  duration?: number;
  pitch: string;
  velocity?: number;
  instrument: InstrumentType;
  sampleUrl?: string;
  // Track-specific properties for independent looping
  trackLength?: number;
  loopIndependently?: boolean;
  // Variation and ghost notes
  variation?: string; // Which variation this note belongs to (A, B, C, D)
  isGhost?: boolean; // Whether this is a ghost note (lower velocity/emphasis)
};

// Only re-export InstrumentType
export { InstrumentType };

// Chord generation configuration
export interface ChordConfig {
  degree: number; // Degree of the chord (1-7)
  numNotes: number; // Number of notes in chord (3 for triad, 4 for seventh, etc.)
  step: number; // Step size for building chord (2 for thirds, 1 for seconds)
}
