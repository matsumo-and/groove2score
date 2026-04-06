import type { DrumMappingTable } from '../src/core/mapping.js';
import { applyMapping } from '../src/core/mapping.js';
import type { RawNote } from '../src/core/types.js';

const testMapping: DrumMappingTable = {
  '36': {
    name: 'Bass Drum',
    part: 'BassDrum',
    voice: 2,
    step: 'C',
    octave: 5,
    notehead: 'normal',
    stemDirection: 'down',
  },
  '38': {
    name: 'Snare',
    part: 'Snare',
    voice: 1,
    step: 'C',
    octave: 5,
    notehead: 'normal',
    stemDirection: 'up',
  },
};

const raw = (pitch: number): RawNote => ({
  pitch,
  velocity: 100,
  ticks: 0,
  durationTicks: 24,
  startTime: 0,
  duration: 0.1,
});

describe('applyMapping', () => {
  test('maps known pitches', () => {
    const result = applyMapping([raw(36), raw(38)], testMapping);
    expect(result).toHaveLength(2);
    expect(result[0].mapping.part).toBe('BassDrum');
    expect(result[1].mapping.part).toBe('Snare');
  });

  test('drops unknown pitches', () => {
    const result = applyMapping([raw(99)], testMapping);
    expect(result).toHaveLength(0);
  });
});
