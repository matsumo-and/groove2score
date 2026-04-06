import { quantizeNotes, snapToGrid } from '../src/core/quantizer.js';
import type { MappedNote } from '../src/core/types.js';

const dummyMapping = {
  name: 'Bass Drum 1',
  part: 'BassDrum' as const,
  voice: 2 as const,
  step: 'C' as const,
  octave: 5,
  notehead: 'normal' as const,
  stemDirection: 'down' as const,
};

describe('snapToGrid', () => {
  // ppq=480 is a common DAW default; subdivision=16 → ticksPerGrid = 480/4 = 120
  const opts = { subdivision: 16, ppq: 480 };

  test('snaps exact grid positions', () => {
    expect(snapToGrid(0, opts)).toBe(0);
    expect(snapToGrid(120, opts)).toBe(1); // 1/16 note
    expect(snapToGrid(480, opts)).toBe(4); // quarter note
    expect(snapToGrid(960, opts)).toBe(8); // half note
    expect(snapToGrid(1920, opts)).toBe(16); // whole note
  });

  test('rounds off-grid positions', () => {
    expect(snapToGrid(50, opts)).toBe(0); // closer to 0 than 120
    expect(snapToGrid(70, opts)).toBe(1); // closer to 120
  });
});

describe('quantizeNotes', () => {
  // ppq=96 matches the test MIDI file; ticksPerGrid = 96/4 = 24
  const opts = { subdivision: 16, ppq: 96 };

  test('snaps notes to nearest grid position', () => {
    const notes: MappedNote[] = [
      { pitch: 36, velocity: 100, ticks: 2, durationTicks: 24, startTime: 0, duration: 0.1, mapping: dummyMapping },
      { pitch: 36, velocity: 100, ticks: 96, durationTicks: 96, startTime: 0.5, duration: 0.1, mapping: dummyMapping },
    ];
    const result = quantizeNotes(notes, opts);
    expect(result[0].gridPosition).toBe(0); // ticks=2 → round(2/24)=0
    expect(result[1].gridPosition).toBe(4); // ticks=96 → round(96/24)=4 (quarter note)
  });

  test('durationGrids is quantized from durationTicks', () => {
    const notes: MappedNote[] = [
      { pitch: 36, velocity: 100, ticks: 0, durationTicks: 96, startTime: 0, duration: 0.5, mapping: dummyMapping },
      { pitch: 36, velocity: 100, ticks: 0, durationTicks: 48, startTime: 0, duration: 0.25, mapping: dummyMapping },
      { pitch: 36, velocity: 100, ticks: 0, durationTicks: 10, startTime: 0, duration: 0.05, mapping: dummyMapping },
    ];
    const result = quantizeNotes(notes, opts);
    expect(result[0].durationGrids).toBe(4); // 96 ticks → 4 grids (quarter note)
    expect(result[1].durationGrids).toBe(2); // 48 ticks → 2 grids (eighth note)
    expect(result[2].durationGrids).toBe(1); // 10 ticks → round(10/24)=0 → clamped to 1
  });

  test('eighth note lands on grid=2', () => {
    const notes: MappedNote[] = [
      { pitch: 38, velocity: 100, ticks: 48, durationTicks: 24, startTime: 0.25, duration: 0.1, mapping: dummyMapping },
    ];
    const result = quantizeNotes(notes, opts);
    expect(result[0].gridPosition).toBe(2); // ticks=48 → 48/24=2
  });
});
