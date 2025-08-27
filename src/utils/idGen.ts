let noteIdCounter = 0;

/**
 * Generates a unique note ID for use in timeline and XY pad tracks.
 * Ensures uniqueness within the current session.
 * @returns {string} A unique note ID string.
 */
export function getNextNoteId(): string {
  return `note-${noteIdCounter++}`;
}

/**
 * Creates a new Note object with consistent properties.
 * This helps avoid type inconsistencies between different components.
 *
 * @param {Object} params - Parameters for the note
 * @param {number} params.start - Start position in steps
 * @param {number} params.length - Length in steps
 * @param {string} params.pitch - Note pitch (e.g. "C4")
 * @param {string} params.instrument - Instrument type
 * @param {number} [params.velocity] - Optional velocity (0-127)
 * @returns {Object} A complete Note object
 */
export function createNote({ start, length = 1, pitch, instrument, velocity = 100 }) {
  return {
    id: getNextNoteId(),
    start,
    length,
    // Add time/duration as aliases for compatibility
    time: start,
    duration: length,
    pitch,
    instrument,
    velocity,
  };
}
