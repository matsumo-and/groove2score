import type { MappedNote, QuantizedNote } from "./types.js";

export interface QuantizeOptions {
  /** Grid subdivision: 4=quarter, 8=eighth, 16=sixteenth, 32=32nd */
  subdivision: number;
  /** Beats per minute (used to convert seconds → beats) */
  bpm: number;
}

/**
 * Snap a time in seconds to the nearest grid position (integer).
 * Grid unit = one subdivision (e.g. 1/16 note at the given BPM).
 */
export function snapToGrid(timeSeconds: number, opts: QuantizeOptions): number {
  const beatsPerSecond = opts.bpm / 60;
  const subdivsPerBeat = opts.subdivision / 4; // quarter note = 1 beat
  const subdivsPerSecond = beatsPerSecond * subdivsPerBeat;
  const rawGrid = timeSeconds * subdivsPerSecond;
  return Math.round(rawGrid);
}

/** Convert a grid position back to beat-based position (quarter notes). */
export function gridToBeats(
  gridPosition: number,
  subdivision: number
): number {
  return gridPosition / (subdivision / 4);
}

/**
 * Quantize all notes by snapping startTime to the nearest grid position.
 */
export function quantizeNotes(
  notes: MappedNote[],
  opts: QuantizeOptions
): QuantizedNote[] {
  return notes.map((note) => ({
    ...note,
    gridPosition: snapToGrid(note.startTime, opts),
  }));
}
