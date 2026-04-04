/** A note as parsed directly from MIDI, in seconds. */
export interface RawNote {
  pitch: number;       // MIDI note number (0–127)
  velocity: number;    // 0–127
  startTime: number;   // seconds
  duration: number;    // seconds
}

/** Drum mapping entry loaded from mapping.json. */
export interface DrumMapping {
  part: string;
  voice: 1 | 2;
  step: string;        // e.g. "C", "G"
  octave: number;
  notehead: "normal" | "x" | "diamond";
  stemDirection: "up" | "down";
}

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
  isGhost: boolean;     // true if ALL notes are ghost notes
}
