import { Note, InstrumentType } from "@/types/audio";
import { TrackMode } from "@/types/audio/audiotimeline";

// Type definition for Track
export interface Track {
  id: string;
  name: string;
  mode: TrackMode;
  notes: Note[];
  length: number;
  color: string;
  solo: boolean;
  mute: boolean;
  instrument: InstrumentType;
  octaveOffset?: number;
  loopIndependently?: boolean;
  schedulerMuted?: boolean;
  rootNote?: string;
  scaleName?: string;
  scaleNotes?: string[];
}

// Simple function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Empty tracks - start with a blank canvas
export const EMPTY_TRACKS: Track[] = [
  {
    id: "track-1",
    name: "Track 1",
    mode: TrackMode.STEP,
    notes: [],
    length: 16,
    color: "#4a90e2",
    solo: false,
    mute: false,
    instrument: InstrumentType.Sine,
    rootNote: "C",
    scaleName: "major",
    scaleNotes: ["C", "D", "E", "F", "G", "A", "B"],
  },
];

// Demo tracks setup with Bass, Drums and different view types
export const DEMO_TRACKS: Track[] = [
  {
    id: "track-1",
    name: "Bass",
    mode: TrackMode.STEP,
    notes: [
      {
        id: generateId(),
        start: 0,
        length: 4,
        pitch: "C2",
        velocity: 100,
        instrument: InstrumentType.Sine,
      },
      {
        id: generateId(),
        start: 8,
        length: 4,
        pitch: "G2",
        velocity: 100,
        instrument: InstrumentType.Sine,
      },
    ],
    length: 16,
    color: "#4a90e2",
    solo: false,
    mute: false,
    instrument: InstrumentType.Sine,
    octaveOffset: -1,
    rootNote: "E",
    scaleName: "minor pentatonic",
    scaleNotes: ["E", "G", "A", "B", "D"],
  },
  {
    id: "track-2",
    name: "Kick",
    mode: TrackMode.STEP,
    notes: [
      {
        id: generateId(),
        start: 0,
        length: 1,
        pitch: "C1",
        velocity: 120,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 4,
        length: 1,
        pitch: "C1",
        velocity: 120,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 8,
        length: 1,
        pitch: "C1",
        velocity: 120,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 12,
        length: 1,
        pitch: "C1",
        velocity: 120,
        instrument: InstrumentType.OneShotSampler,
      },
    ],
    length: 16,
    color: "#e2574a",
    solo: false,
    mute: false,
    instrument: InstrumentType.OneShotSampler,
    loopIndependently: true,
    rootNote: "C",
    scaleName: "chromatic",
    scaleNotes: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
  {
    id: "track-3",
    name: "Snare",
    mode: TrackMode.STEP,
    notes: [
      {
        id: generateId(),
        start: 4,
        length: 1,
        pitch: "D1",
        velocity: 100,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 12,
        length: 1,
        pitch: "D1",
        velocity: 100,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 14,
        length: 1,
        pitch: "D1",
        velocity: 80,
        instrument: InstrumentType.OneShotSampler,
        isGhost: true,
      },
    ],
    length: 16,
    color: "#f39c12",
    solo: false,
    mute: false,
    instrument: InstrumentType.OneShotSampler,
    loopIndependently: true,
    rootNote: "C",
    scaleName: "chromatic",
    scaleNotes: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
  {
    id: "track-4",
    name: "Hi-Hat",
    mode: TrackMode.STEP,
    notes: [
      {
        id: generateId(),
        start: 0,
        length: 1,
        pitch: "F#1",
        velocity: 80,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 2,
        length: 1,
        pitch: "F#1",
        velocity: 60,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 4,
        length: 1,
        pitch: "F#1",
        velocity: 100,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 6,
        length: 1,
        pitch: "F#1",
        velocity: 60,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 8,
        length: 1,
        pitch: "F#1",
        velocity: 80,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 10,
        length: 1,
        pitch: "F#1",
        velocity: 60,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 12,
        length: 1,
        pitch: "F#1",
        velocity: 100,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 14,
        length: 1,
        pitch: "F#1",
        velocity: 60,
        instrument: InstrumentType.OneShotSampler,
      },
    ],
    length: 16,
    color: "#f1c40f",
    solo: false,
    mute: false,
    instrument: InstrumentType.OneShotSampler,
    loopIndependently: true,
    rootNote: "C",
    scaleName: "chromatic",
    scaleNotes: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
  {
    id: "track-5",
    name: "Percussion",
    mode: TrackMode.STEP,
    notes: [
      {
        id: generateId(),
        start: 3,
        length: 1,
        pitch: "G1",
        velocity: 70,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 7,
        length: 1,
        pitch: "A1",
        velocity: 70,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 11,
        length: 1,
        pitch: "G1",
        velocity: 70,
        instrument: InstrumentType.OneShotSampler,
      },
      {
        id: generateId(),
        start: 15,
        length: 1,
        pitch: "A1",
        velocity: 70,
        instrument: InstrumentType.OneShotSampler,
      },
    ],
    length: 16,
    color: "#95a5a6",
    solo: false,
    mute: false,
    instrument: InstrumentType.OneShotSampler,
    loopIndependently: true,
    rootNote: "C",
    scaleName: "chromatic",
    scaleNotes: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
  {
    id: "track-6",
    name: "Lead Synth",
    mode: TrackMode.STEP,
    notes: [
      {
        id: generateId(),
        start: 4,
        length: 0.2,
        pitch: "E3",
        velocity: 90,
        instrument: InstrumentType.Sawtooth,
      },
      {
        id: generateId(),
        start: 8,
        length: 0.2,
        pitch: "G4",
        velocity: 90,
        instrument: InstrumentType.Sawtooth,
      },
      {
        id: generateId(),
        start: 12,
        length: 0.2,
        pitch: "C4",
        velocity: 90,
        instrument: InstrumentType.Sawtooth,
      },
    ],
    length: 16,
    color: "#50e3c2",
    solo: false,
    mute: false,
    instrument: InstrumentType.Sawtooth,
    octaveOffset: 1,
    rootNote: "C",
    scaleName: "major",
    scaleNotes: ["C", "D", "E", "F", "G", "A", "B"],
  },
  {
    id: "track-7",
    name: "FX Pad",
    mode: TrackMode.XY,
    notes: [
      {
        id: generateId(),
        start: 2,
        length: 1,
        pitch: "D4",
        velocity: 70,
        instrument: InstrumentType.PWM,
      },
      {
        id: generateId(),
        start: 5,
        length: 1,
        pitch: "A3",
        velocity: 85,
        instrument: InstrumentType.PWM,
      },
      {
        id: generateId(),
        start: 9,
        length: 1,
        pitch: "G2",
        velocity: 60,
        instrument: InstrumentType.PWM,
      },
      {
        id: generateId(),
        start: 14,
        length: 1,
        pitch: "E2",
        velocity: 90,
        instrument: InstrumentType.PWM,
      },
    ],
    length: 16,
    color: "#bd10e0",
    solo: false,
    mute: false,
    instrument: InstrumentType.PWM,
    rootNote: "G",
    scaleName: "mixolydian",
    scaleNotes: ["G", "A", "B", "C", "D", "E", "F"],
  },
];

// Generate the next track ID based on existing tracks
export function getNextTrackId(tracks: Track[] = DEMO_TRACKS): string {
  return `track-${tracks.length + 1}`;
}

// Export both as default for backwards compatibility
export const DEFAULT_TRACKS = DEMO_TRACKS;

/**
 * Toggles the solo state of a track and updates other tracks' solo states accordingly
 */
export const toggleSolo = (tracks: Track[], trackId: string): Track[] => {
  // Implementation from the original toggleSolo function
  const targetTrack = tracks.find((track) => track.id === trackId);

  if (!targetTrack) return tracks;

  // If the track is already soloed, unsolo it
  if (targetTrack.solo) {
    return tracks.map((track) => ({
      ...track,
      solo: false,
    }));
  }

  // Otherwise, solo this track and unsolo all others
  return tracks.map((track) => ({
    ...track,
    solo: track.id === trackId,
  }));
};

/**
 * Updates the scheduler based on solo and mute states of tracks
 */
export const updateSchedulerBasedOnSoloMute = (tracks: Track[]): Track[] => {
  // Implementation from original function
  const hasSoloedTrack = tracks.some((track) => track.solo);

  // Apply special logic based on whether any track is soloed
  if (hasSoloedTrack) {
    // Only allow soloed tracks to play
    return tracks.map((track) => ({
      ...track,
      schedulerMuted: !track.solo,
    }));
  } else {
    // Normal behavior - respect individual track mute settings
    return tracks.map((track) => ({
      ...track,
      schedulerMuted: track.mute, // Note the property name change from 'muted' to 'mute'
    }));
  }
};
