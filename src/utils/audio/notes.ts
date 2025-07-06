// Define the frequencies for all notes from A0 (27.5 Hz) to C8 (4186 Hz)
export const noteFrequencies: number[] = [
  // A0 to G#0
  27.5, 29.1352, 30.8677, 32.7032, 34.6478, 36.7081, 38.8909, 41.2034, 43.6535,
  46.2493, 48.9994, 51.9131,
  // A1 to G#1
  55.0, 58.2705, 61.7354, 65.4064, 69.2957, 73.4162, 77.7817, 82.4069, 87.3071,
  92.4986, 97.9989, 103.826,
  // A2 to G#2
  110.0, 116.541, 123.471, 130.813, 138.591, 146.832, 155.563, 164.814, 174.614,
  184.997, 195.998, 207.652,
  // A3 to G#3
  220.0, 233.082, 246.942, 261.626, 277.183, 293.665, 311.127, 329.628, 349.228,
  369.994, 391.995, 415.305,
  // A4 to G#4
  440.0, 466.164, 493.883, 523.251, 554.365, 587.33, 622.254, 659.255, 698.456,
  739.989, 783.991, 830.609,
  // A5 to G#5
  880.0, 932.328, 987.767, 1046.5, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91,
  1479.98, 1567.98, 1661.22,
  // A6 to G#6
  1760.0, 1864.66, 1975.53, 2093.0, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83,
  2959.96, 3135.96, 3322.44,
  // A7 to G#7
  3520.0, 3729.31, 3951.07, 4186.01,
];

// Define the note names corresponding to the frequencies
export const noteNames: string[] = [
  // A0 to G#0
  "A0",
  "A#0",
  "B0",
  "C1",
  "C#1",
  "D1",
  "D#1",
  "E1",
  "F1",
  "F#1",
  "G1",
  "G#1",
  // A1 to G#1
  "A1",
  "A#1",
  "B1",
  "C2",
  "C#2",
  "D2",
  "D#2",
  "E2",
  "F2",
  "F#2",
  "G2",
  "G#2",
  // A2 to G#2
  "A2",
  "A#2",
  "B2",
  "C3",
  "C#3",
  "D3",
  "D#3",
  "E3",
  "F3",
  "F#3",
  "G3",
  "G#3",
  // A3 to G#3
  "A3",
  "A#3",
  "B3",
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  // A4 to G#4
  "A4",
  "A#4",
  "B4",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  // A5 to G#5
  "A5",
  "A#5",
  "B5",
  "C6",
  "C#6",
  "D6",
  "D#6",
  "E6",
  "F6",
  "F#6",
  "G6",
  "G#6",
  // A6 to G#6
  "A6",
  "A#6",
  "B6",
  "C7",
  "C#7",
  "D7",
  "D#7",
  "E7",
  "F7",
  "F#7",
  "G7",
  "G#7",
  // A7 to G#7
  "A7",
  "A#7",
  "B7",
  "C8",
];

// Function to map a frequency to the nearest musical note and calculate cents offset
export const freqToNote = (
  frequency: number,
): { note: string; cents: number } | null => {
  let closestNoteIndex = 0;
  let minDiff = Infinity;

  for (let i = 0; i < noteFrequencies.length; i++) {
    const diff = Math.abs(frequency - noteFrequencies[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closestNoteIndex = i;
    }
  }

  if (minDiff === Infinity) return null;

  const note = noteNames[closestNoteIndex];
  const idealFrequency = noteFrequencies[closestNoteIndex];
  const cents = Math.round(1200 * Math.log2(frequency / idealFrequency));

  return { note, cents };
};
