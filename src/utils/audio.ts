import { InstrumentType } from "../types/audio";
import { ScheduledNote } from "../types/audio/audiotimeline";

// Audio Context singleton
let audioContext: AudioContext | null = null;

export const createAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Oscillator configurations
const OSCILLATOR_CONFIGS = {
  [InstrumentType.Sine]: { type: "sine" as OscillatorType },
  [InstrumentType.Sawtooth]: { type: "sawtooth" as OscillatorType },
  [InstrumentType.Square]: { type: "square" as OscillatorType },
  [InstrumentType.PWM]: {
    type: "square" as OscillatorType,
    pulseWidth: 0.5,
  },
};

// Convert MIDI note number to frequency
export const noteToFrequency = (note: string): number => {
  const noteMap: { [key: string]: number } = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const match = note.match(/([A-G][#b]?)([0-9])/);
  if (!match) return 440; // A4 as fallback

  const [, noteName, octave] = match;
  const noteNumber = noteMap[noteName] + (parseInt(octave) + 1) * 12;
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
};

// Create and configure an oscillator
const createOscillator = (context: AudioContext, type: InstrumentType, frequency: number): OscillatorNode => {
  const oscillator = context.createOscillator();
  const config = OSCILLATOR_CONFIGS[type];

  if (config) {
    oscillator.type = config.type;
    if (type === InstrumentType.PWM && "pulseWidth" in config) {
      // Implement PWM using two oscillators if needed
      // This is a simplified version
      oscillator.type = "square";
    }
  }

  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  return oscillator;
};

// Create an envelope for the sound
const createEnvelope = (gainNode: GainNode, now: number, duration: number): void => {
  const attackTime = 0.01;
  const decayTime = 0.1;
  const sustainLevel = 0.7;
  const releaseTime = 0.1;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
  gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
  gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
};

// Schedule a note to play
export const scheduleNote = (context: AudioContext, note: ScheduledNote): void => {
  const now = note.time || context.currentTime;
  const frequency = noteToFrequency(note.pitch);
  const duration = note.duration || note.length || 0.25; // Default to quarter note

  // Create audio nodes
  const oscillator = createOscillator(context, note.instrument as InstrumentType, frequency);
  const gainNode = context.createGain();
  const panNode = context.createStereoPanner();

  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(context.destination);

  // Set pan if specified
  if (typeof (note as any).pan === "number") {
    panNode.pan.setValueAtTime((note as any).pan, now);
  }

  // Apply envelope
  createEnvelope(gainNode, now, duration);

  // Schedule note start and stop
  oscillator.start(now);
  oscillator.stop(now + duration);
};

// Stop all currently playing notes
export const stopAllNotes = (context: AudioContext): void => {
  context.resume().then(() => {
    // Create a new AudioContext to effectively stop all sounds
    // This is a bit heavy-handed but effective
    if (audioContext) {
      audioContext.close();
      audioContext = new AudioContext();
    }
  });
};

// Convert decibels to gain value
export const dbToGain = (db: number): number => {
  return Math.pow(10, db / 20);
};

// Create a compressor node with default settings
export const createCompressor = (context: AudioContext): DynamicsCompressorNode => {
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-24, context.currentTime);
  compressor.knee.setValueAtTime(30, context.currentTime);
  compressor.ratio.setValueAtTime(12, context.currentTime);
  compressor.attack.setValueAtTime(0.003, context.currentTime);
  compressor.release.setValueAtTime(0.25, context.currentTime);
  return compressor;
};
