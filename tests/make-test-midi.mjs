/**
 * Create a minimal test MIDI file:
 *   - 4/4 at 120 BPM
 *   - Kick on beats 1 & 3, snare on 2 & 4, hi-hat every 8th note
 */
import pkg from '@tonejs/midi';

const { Midi } = pkg;

import { writeFileSync } from 'fs';

const midi = new Midi();
midi.header.setTempo(120);

const track = midi.addTrack();
track.channel = 9; // GM drum channel

const bpm = 120;
const beatSec = 60 / bpm;
const eighthSec = beatSec / 2;

const events = [
  // Kicks: beat 1 (t=0) and beat 3 (t=2*beatSec)
  { time: 0, midi: 36, vel: 0.9, dur: 0.05 },
  { time: 2 * beatSec, midi: 36, vel: 0.9, dur: 0.05 },
  // Snares: beat 2 (t=beatSec) and beat 4 (t=3*beatSec)
  { time: beatSec, midi: 38, vel: 0.8, dur: 0.05 },
  { time: 3 * beatSec, midi: 38, vel: 0.8, dur: 0.05 },
  // Hi-hat every 8th note
  ...Array.from({ length: 8 }, (_, i) => ({
    time: i * eighthSec,
    midi: 42,
    vel: 0.6,
    dur: 0.04,
  })),
  // Ghost snare on the "e" of beat 2 (1/16 after beat 2)
  { time: beatSec + eighthSec / 2, midi: 38, vel: 0.25, dur: 0.04 },
];

for (const e of events) {
  track.addNote({ midi: e.midi, time: e.time, velocity: e.vel, duration: e.dur });
}

writeFileSync('tests/test-groove.mid', Buffer.from(midi.toArray()));
console.log('Written tests/test-groove.mid');
