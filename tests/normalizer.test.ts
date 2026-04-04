import { isGhostNote, mergeIntoChords } from '../src/core/normalizer.js';
import type { QuantizedNote } from '../src/core/types.js';

const kick = (gridPosition: number, velocity = 100): QuantizedNote => ({
  pitch: 36,
  velocity,
  startTime: 0,
  duration: 0.1,
  gridPosition,
  mapping: {
    part: 'kick',
    voice: 2,
    step: 'C',
    octave: 5,
    notehead: 'normal',
    stemDirection: 'down',
  },
});

const snare = (gridPosition: number, velocity = 100): QuantizedNote => ({
  pitch: 38,
  velocity,
  startTime: 0,
  duration: 0.1,
  gridPosition,
  mapping: {
    part: 'snare',
    voice: 1,
    step: 'C',
    octave: 5,
    notehead: 'normal',
    stemDirection: 'up',
  },
});

describe('mergeIntoChords', () => {
  test('single kick on beat 0', () => {
    const chords = mergeIntoChords([kick(0)], { ghostThreshold: 40 });
    expect(chords).toHaveLength(1);
    expect(chords[0].gridPosition).toBe(0);
    expect(chords[0].notes).toHaveLength(1);
  });

  test('kick + snare at same position forms one chord', () => {
    const chords = mergeIntoChords([kick(0), snare(0)], { ghostThreshold: 40 });
    expect(chords).toHaveLength(1);
    expect(chords[0].notes).toHaveLength(2);
  });

  test('notes at different positions form separate chords', () => {
    const chords = mergeIntoChords([kick(0), snare(4)], { ghostThreshold: 40 });
    expect(chords).toHaveLength(2);
    expect(chords[0].gridPosition).toBe(0);
    expect(chords[1].gridPosition).toBe(4);
  });

  test('hi-hat 8th note pattern (8 notes in 16 steps)', () => {
    const hihat = (pos: number): QuantizedNote => ({
      pitch: 42,
      velocity: 80,
      startTime: 0,
      duration: 0.1,
      gridPosition: pos,
      mapping: {
        part: 'hihat-closed',
        voice: 1,
        step: 'G',
        octave: 5,
        notehead: 'x',
        stemDirection: 'up',
      },
    });
    const notes = [0, 2, 4, 6, 8, 10, 12, 14].map(hihat);
    const chords = mergeIntoChords(notes, { ghostThreshold: 40 });
    expect(chords).toHaveLength(8);
  });

  test('ghost note detection', () => {
    const chords = mergeIntoChords([kick(0, 30)], { ghostThreshold: 40 });
    expect(chords[0].isGhost).toBe(true);
  });

  test('non-ghost note', () => {
    const chords = mergeIntoChords([kick(0, 80)], { ghostThreshold: 40 });
    expect(chords[0].isGhost).toBe(false);
  });
});

describe('isGhostNote', () => {
  test('returns true below threshold', () => expect(isGhostNote(39, 40)).toBe(true));
  test('returns false at threshold', () => expect(isGhostNote(40, 40)).toBe(false));
  test('returns false above threshold', () => expect(isGhostNote(100, 40)).toBe(false));
});
