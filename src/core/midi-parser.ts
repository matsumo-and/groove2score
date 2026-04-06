// @tonejs/midi is CJS — use default import
import MidiPkg from '@tonejs/midi';

const { Midi } = MidiPkg as typeof import('@tonejs/midi');

import { readFileSync } from 'fs';
import type { RawNote } from './types.js';

export interface ParsedMidi {
  notes: RawNote[];
  /** Ticks per quarter note (PPQ) from the MIDI header. */
  ppq: number;
  /** Tempo in BPM read from the MIDI file, or null if not present. */
  bpm: number | null;
}

/**
 * Parse a MIDI file and return all notes from drum tracks.
 * Drum tracks are identified by channel 9 (0-indexed),
 * percussion instrument flag, or track name containing "drum"/"perc".
 * Falls back to the first track if none match.
 */
export function parseMidi(filePath: string): ParsedMidi {
  const buffer = readFileSync(filePath);
  const midi = new Midi(buffer);

  const notes: RawNote[] = [];

  let drumTracks = midi.tracks.filter(
    (t) =>
      t.channel === 9 ||
      t.instrument.percussion ||
      t.name.toLowerCase().includes('drum') ||
      t.name.toLowerCase().includes('perc'),
  );

  // Fallback: if no drum track found by heuristic, use all tracks
  if (drumTracks.length === 0) {
    drumTracks = midi.tracks;
  }

  for (const track of drumTracks) {
    for (const note of track.notes) {
      notes.push({
        pitch: note.midi,
        velocity: Math.round(note.velocity * 127),
        ticks: note.ticks,
        startTime: note.time,
        duration: note.duration,
      });
    }
  }

  const firstTempo = midi.header.tempos[0];

  return {
    notes: notes.sort((a, b) => a.ticks - b.ticks),
    ppq: midi.header.ppq,
    bpm: firstTempo ? Math.round(firstTempo.bpm) : null,
  };
}
