import { snapToGrid, quantizeNotes } from "../src/core/quantizer.js";
import type { MappedNote } from "../src/core/types.js";

const dummyMapping = {
  part: "kick",
  voice: 2 as const,
  step: "C",
  octave: 5,
  notehead: "normal" as const,
  stemDirection: "down" as const,
};

describe("snapToGrid", () => {
  const opts = { subdivision: 16, bpm: 120 };
  // At 120 BPM, 1/16 = 0.125s

  test("snaps exact grid positions", () => {
    expect(snapToGrid(0, opts)).toBe(0);
    expect(snapToGrid(0.125, opts)).toBe(1);
    expect(snapToGrid(0.5, opts)).toBe(4);   // quarter note
    expect(snapToGrid(1.0, opts)).toBe(8);   // half note
    expect(snapToGrid(2.0, opts)).toBe(16);  // whole note
  });

  test("rounds off-grid positions", () => {
    expect(snapToGrid(0.06, opts)).toBe(0);   // closer to 0 than 1
    expect(snapToGrid(0.07, opts)).toBe(1);   // closer to 1 (0.125)
  });
});

describe("quantizeNotes", () => {
  test("snaps notes to nearest grid position", () => {
    const notes: MappedNote[] = [
      { pitch: 36, velocity: 100, startTime: 0.01, duration: 0.1, mapping: dummyMapping },
      { pitch: 36, velocity: 100, startTime: 0.49, duration: 0.1, mapping: dummyMapping },
    ];
    const result = quantizeNotes(notes, { subdivision: 16, bpm: 120 });
    expect(result[0].gridPosition).toBe(0);
    expect(result[1].gridPosition).toBe(4); // snaps to 0.5s = 4 sixteenths
  });
});
