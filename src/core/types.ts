/** A note as parsed directly from MIDI. */
export interface RawNote {
  pitch: number; // MIDI note number (0–127)
  velocity: number; // 0–127
  ticks: number; // MIDI tick position (absolute)
  startTime: number; // seconds (for reference only)
  duration: number; // seconds
}

import type { DrumMappingEntry } from './drum-parts.js';

/** Drum mapping entry loaded from mapping.json. */
export type DrumMapping = DrumMappingEntry;

/** A note after applying drum mapping. */
export interface MappedNote extends RawNote {
  mapping: DrumMapping;
}

/** A note after quantization (startTime snapped to grid). */
export interface QuantizedNote extends MappedNote {
  gridPosition: number; // beat position in units of the grid subdivision
}

/** One or more simultaneous notes merged into a chord beat. */
export interface Chord {
  gridPosition: number;
  notes: QuantizedNote[];
  isGhost: boolean; // true if ALL notes are ghost notes
}
