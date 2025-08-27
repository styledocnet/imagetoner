import { Note, InstrumentType } from "../audio";

export enum TrackMode {
  STEP = "step",
  XY = "xypad",
  CIRCULAR = "circular",
}

export interface ChordConfig {
  degree: number;
  numNotes: number;
  step: number;
}

export interface Track {
  id: string;
  name: string;
  notes: Note[];
  mode: TrackMode | string;
  length: number; // Number of steps in the pattern
  color: string; // Color for visual representation
  mute: boolean; // Whether the track is muted
  solo: boolean; // Whether the track is soloed
  schedulerMuted?: boolean; // Internal mute state managed by the scheduler
  octave?: number; // Base octave for the track
  octaveOffset?: number; // Octave offset for the track
  rootNote?: string; // Root note for scales (e.g., C, F#)
  scaleName?: string; // Scale name (e.g., major, minor, dorian)
  scaleNotes?: string[]; // Array of note names in the scale
  instrument?: InstrumentType | string; // Instrument type for this track
  muted?: boolean; // Alias for mute
  looping?: boolean; // Whether this track loops independently
  currentVariation?: string; // Currently active variation (A, B, C, etc.)
  variations?: {
    [key: string]: {
      notes: Note[];
    };
  }; // Different variations of the pattern
}

export interface GlobalSettings {
  bpm: number;
  isPlaying: boolean;
  isLooping: boolean;
  gridLength: number;
  totalSteps: number;
  quantizeAmount: number;
  swingAmount: number;
  metronomeEnabled: boolean;
  currentStep: number;
  masterVolume: number;
  showMinimap: boolean;
  showControls: boolean;
  autoScroll: boolean;
  zoom: number;
  layout: "horizontal" | "vertical";
  minimapEnabled: boolean;
  snapToGrid: boolean;
  gridSubdivision: number;
  currentVariation: string;
  showBlockArranger: boolean;
}

export interface AudioTimelineState {
  tracks: Track[];
  globalSettings: GlobalSettings;
  visibleTimeRange: { start: number; end: number };
  minimapZoom: number;
  selectedTrackId: string | null;
  selectedNoteId: string | null;
  isDragging: boolean;
  currentVariation: string;
  playbackState: {
    isPlaying: boolean;
    currentStep: number;
    currentVariation: string;
    currentBar?: number;
    lastTickTime?: number;
    nextNoteTime?: number;
    scheduleAheadTime?: number;
  };
}

export interface ScheduledNote extends Note {
  trackId: string;
  absoluteStartTime: number; // Start time in seconds
  absoluteEndTime: number; // End time in seconds
  cancelled?: boolean; // Whether this note's playback has been cancelled
}

export interface ZoomConfig {
  level: number; // Current zoom level
  min: number; // Minimum zoom level
  max: number; // Maximum zoom level
  step: number; // Zoom step increment/decrement
}
