import type { Chord, QuantizedNote } from './types.js';

export interface NormalizeOptions {
  ghostThreshold: number; // velocity below this = ghost note
}

/**
 * Merge notes at the same grid position into chords.
 * A chord is marked ghost if ALL its notes are below the threshold.
 */
export function mergeIntoChords(notes: QuantizedNote[], opts: NormalizeOptions): Chord[] {
  // Group by grid position
  const groups = new Map<number, QuantizedNote[]>();

  for (const note of notes) {
    const existing = groups.get(note.gridPosition);
    if (existing) {
      existing.push(note);
    } else {
      groups.set(note.gridPosition, [note]);
    }
  }

  // Convert to Chord[]
  const chords: Chord[] = [];

  for (const [gridPosition, chordNotes] of groups) {
    const isGhost = chordNotes.every((n) => n.velocity < opts.ghostThreshold);
    chords.push({ gridPosition, notes: chordNotes, isGhost });
  }

  return chords.sort((a, b) => a.gridPosition - b.gridPosition);
}

/** Returns true if a single note is a ghost note. */
export function isGhostNote(velocity: number, threshold: number): boolean {
  return velocity < threshold;
}
