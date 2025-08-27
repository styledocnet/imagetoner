// Define our own scale implementation since Tone.js doesn't have Scale.get

export interface ScaleOption {
  label: string;
  value: string;
  notes: string[];
}

export type ScaleCategory = "common" | "diatonic" | "pentatonic" | "blues" | "jazz" | "world" | "other";

// Define scale patterns as semitone intervals from the root note
const scalePatterns: Record<string, number[]> = {
  // Common scales
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  "major pentatonic": [0, 2, 4, 7, 9],
  "minor pentatonic": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],

  // Modes
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],

  // Other scales
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  "whole tone": [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
  augmented: [0, 3, 4, 7, 8, 11],
  bebop: [0, 2, 4, 5, 7, 9, 10, 11],
  "hungarian minor": [0, 2, 3, 6, 7, 8, 11],
  enigmatic: [0, 1, 4, 6, 8, 10, 11],
  // World scales
  kumoi: [0, 2, 3, 7, 9],
  "augmented lydian": [0, 2, 4, 6, 8, 9, 11],
  neapolitan: [0, 1, 3, 5, 7, 8, 11],
  egyptian: [0, 2, 5, 7, 10],
  ritusen: [0, 2, 5, 7, 9],
};

// All notes in order for creating scales
const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Helper to get all notes in a scale
export const getScaleNotes = (rootNote: string, scaleName: string): string[] => {
  try {
    // Get the pattern for the scale
    const pattern = scalePatterns[scaleName.toLowerCase()];
    if (!pattern) {
      console.warn(`Scale "${scaleName}" not found, defaulting to chromatic`);
      return allNotes;
    }

    // Find the root note index
    const rootIndex = allNotes.findIndex((note) => note.toLowerCase() === rootNote.toLowerCase());

    if (rootIndex === -1) {
      console.warn(`Root note "${rootNote}" not found, defaulting to C`);
      return pattern.map((interval) => allNotes[interval % 12]);
    }

    // Generate the scale notes
    return pattern.map((interval) => {
      const noteIndex = (rootIndex + interval) % 12;
      return allNotes[noteIndex];
    });
  } catch (error) {
    console.error(`Error getting scale ${rootNote} ${scaleName}:`, error);
    return [];
  }
};

// Root notes options
export const rootNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Create a map of scale types organized by category
export const scalesByCategory: Record<ScaleCategory, string[]> = {
  common: ["major", "minor", "major pentatonic", "minor pentatonic", "blues"],
  diatonic: ["major", "minor", "dorian", "phrygian", "lydian", "mixolydian", "locrian"],
  pentatonic: ["major pentatonic", "minor pentatonic", "egyptian", "ritusen"],
  blues: ["blues"],
  jazz: ["bebop"],
  world: ["hungarian minor", "kumoi"],
  other: ["chromatic", "whole tone", "augmented", "augmented lydian", "enigmatic", "neapolitan"],
};

// Create a flattened list of all scale types
export const allScaleTypes = Object.values(scalesByCategory).flat();

// Generate scale options for a select dropdown
export const generateScaleOptions = (rootNote: string = "C", category?: ScaleCategory): ScaleOption[] => {
  const scaleTypes = category ? scalesByCategory[category] : allScaleTypes;

  return scaleTypes.map((scale) => {
    const notes = getScaleNotes(rootNote, scale);
    return {
      label: `${rootNote} ${scale}`,
      value: `${rootNote}|${scale}`,
      notes,
    };
  });
};

// Format for dropdown display
export const formatScaleOptionsForDropdown = (scales: ScaleOption[]): { label: string; value: string }[] => {
  return scales.map((scale) => ({
    label: scale.label,
    value: scale.value,
  }));
};

// Parse scale string from the format "rootNote|scaleName"
export const parseScaleString = (scaleString: string): { rootNote: string; scaleName: string } => {
  const [rootNote, scaleName] = scaleString.split("|");
  return { rootNote, scaleName };
};

// Get all notes in a scale across multiple octaves
export const getScaleNotesWithOctaves = (rootNote: string, scaleName: string, startOctave: number = 3, endOctave: number = 5): string[] => {
  const baseNotes = getScaleNotes(rootNote, scaleName);
  const notesWithOctaves: string[] = [];

  for (let octave = startOctave; octave <= endOctave; octave++) {
    baseNotes.forEach((note) => {
      // Extract the note name without octave info
      const noteName = note.replace(/\d+$/, "");
      notesWithOctaves.push(`${noteName}${octave}`);
    });
  }

  return notesWithOctaves;
};

// Generate chord from a scale by degree
export const getChordByDegree = (rootNote: string, scaleName: string, degree: number = 1, numNotes: number = 3, step: number = 2): string[] => {
  const notes = getScaleNotes(rootNote, scaleName);
  if (notes.length === 0) return [];

  // Adjust degree to be 0-indexed
  const adjustedDegree = degree - 1;

  // Create chord by stacking notes according to step
  const chord: string[] = [];
  for (let i = 0; i < numNotes; i++) {
    const noteIndex = (adjustedDegree + i * step) % notes.length;
    chord.push(notes[noteIndex]);
  }

  return chord;
};

// Default scales for different instruments
export const getDefaultScaleForInstrument = (instrument: string): { rootNote: string; scaleName: string } => {
  switch (instrument.toLowerCase()) {
    case "drums":
    case "percussion":
    case "onesampler":
      return { rootNote: "C", scaleName: "chromatic" };
    case "bass":
      return { rootNote: "E", scaleName: "minor pentatonic" };
    case "lead":
    case "sine":
    case "sawtooth":
      return { rootNote: "C", scaleName: "major" };
    case "pad":
    case "square":
    case "pwm":
      return { rootNote: "G", scaleName: "mixolydian" };
    default:
      return { rootNote: "C", scaleName: "major" };
  }
};

// Generate scale-specific notes at specific positions for visualization
export const generateScalePositions = (
  rootNote: string,
  scaleName: string,
  width: number,
  height: number,
  radius: number = Math.min(width, height) / 2.5,
): { note: string; x: number; y: number }[] => {
  const notes = getScaleNotes(rootNote, scaleName);
  const positions: { note: string; x: number; y: number }[] = [];

  const centerX = width / 2;
  const centerY = height / 2;

  notes.forEach((note, index) => {
    const angle = (index / notes.length) * Math.PI * 2 - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    positions.push({ note, x, y });
  });

  return positions;
};
