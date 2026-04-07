import type { Chord } from '../src/core/types.js';
import { buildMusicXml } from '../src/xml/builder.js';

const opts = {
  title: 'Test',
  subdivision: 16,
  beatsPerMeasure: 4,
  beatUnit: 4,
  ghostThreshold: 40,
  bpm: 120,
};

function kickChord(gridPosition: number): Chord {
  return {
    gridPosition,
    isGhost: false,
    notes: [
      {
        pitch: 36,
        velocity: 100,
        ticks: 0,
        durationTicks: 24,
        durationGrids: 1,
        startTime: 0,
        duration: 0.1,
        gridPosition,
        mapping: {
          name: 'Bass Drum 1',
          part: 'BassDrum',
          voice: 2,
          step: 'C',
          octave: 5,
          notehead: 'normal',
          stemDirection: 'down',
        },
      },
    ],
  };
}

describe('buildMusicXml', () => {
  test('produces valid XML wrapper', () => {
    const xml = buildMusicXml([kickChord(0)], opts);
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<score-partwise');
    expect(xml).toContain('</score-partwise>');
  });

  test('includes percussion clef', () => {
    const xml = buildMusicXml([kickChord(0)], opts);
    expect(xml).toContain('<sign>percussion</sign>');
  });

  test('single kick at beat 0 produces one note element', () => {
    const xml = buildMusicXml([kickChord(0)], opts);
    const noteCount = (xml.match(/<note>/g) ?? []).length;
    // 1 kick note + rests for gap filling; check at least 1
    expect(noteCount).toBeGreaterThanOrEqual(1);
  });

  test('correct time signature', () => {
    const xml = buildMusicXml([kickChord(0)], opts);
    expect(xml).toContain('<beats>4</beats>');
    expect(xml).toContain('<beat-type>4</beat-type>');
  });

  test('empty chords produces at least one measure with rests', () => {
    // gridsPerMeasure default when no chords: 1 measure of rests
    const xml = buildMusicXml([], opts);
    expect(xml).toContain('<measure number="1">');
    expect(xml).toContain('<rest/>');
  });
});
