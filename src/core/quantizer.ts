import type { MappedNote, QuantizedNote } from './types.js';

export interface QuantizeOptions {
  /** Grid subdivision: 4=quarter, 8=eighth, 16=sixteenth, 32=32nd */
  subdivision: number;
  /** Ticks per quarter note (PPQ) from the MIDI header. */
  ppq: number;
}

/**
 * Snap a MIDI tick position to the nearest grid position (integer).
 * Grid unit = one subdivision tick (e.g. ppq/4 ticks for 1/16 note).
 * This is BPM-independent and uses the raw MIDI timing directly.
 */
export function snapToGrid(ticks: number, opts: QuantizeOptions): number {
  // ticks per one grid unit (e.g. ppq/4 for 1/16th note subdivision)
  const ticksPerGrid = opts.ppq / (opts.subdivision / 4);
  return Math.round(ticks / ticksPerGrid);
}

/** Convert a grid position back to beat-based position (quarter notes). */
export function gridToBeats(gridPosition: number, subdivision: number): number {
  return gridPosition / (subdivision / 4);
}

/**
 * Quantize all notes by snapping ticks to the nearest grid position.
 */
export function quantizeNotes(notes: MappedNote[], opts: QuantizeOptions): QuantizedNote[] {
  return notes.map((note) => ({
    ...note,
    gridPosition: snapToGrid(note.ticks, opts),
  }));
}
