import type { DrumMappingEntry } from '../core/drum-parts.js';
import { isGhostNote } from '../core/normalizer.js';
import type { Chord, QuantizedNote } from '../core/types.js';

export interface BuildOptions {
  title?: string;
  /** Subdivision used during quantization (e.g. 16 for 1/16) */
  subdivision: number;
  /** Time signature numerator */
  beatsPerMeasure: number;
  /** Time signature denominator (beat unit) */
  beatUnit: number;
  /** Velocity threshold for ghost notes */
  ghostThreshold: number;
  /** Tempo in BPM for <sound> and <metronome> tags */
  bpm: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Grid units per measure (e.g. 16 for 4/4 with 1/16 subdivision) */
function gridsPerMeasure(opts: BuildOptions): number {
  const subdivsPerBeat = opts.subdivision / opts.beatUnit;
  return opts.beatsPerMeasure * subdivsPerBeat;
}

/** Number of MusicXML <divisions> units per quarter note. */
function divisionsPerQuarter(subdivision: number): number {
  return subdivision / 4;
}

interface NoteValue {
  type: string;
  dots: number;
}

/**
 * Convert a duration in grid units to a MusicXML note type + dot count.
 * A whole note = subdivision grids (e.g. 16 grids for subdivision=16).
 * Returns null if the duration cannot be expressed as a simple note value.
 */
function gridsToDuration(grids: number, subdivision: number): NoteValue | null {
  const table: Array<[number, string]> = [
    [subdivision, 'whole'],
    [(subdivision * 3) / 4, 'half'], // dotted half
    [subdivision / 2, 'half'],
    [(subdivision * 3) / 8, 'quarter'], // dotted quarter
    [subdivision / 4, 'quarter'],
    [(subdivision * 3) / 16, 'eighth'], // dotted eighth
    [subdivision / 8, 'eighth'],
    [(subdivision * 3) / 32, '16th'], // dotted 16th
    [subdivision / 16, '16th'],
    [subdivision / 32, '32nd'],
  ];

  for (let i = 0; i < table.length; i++) {
    const [gridCount, typeName] = table[i];
    if (Number.isInteger(gridCount) && grids === gridCount) {
      const plainGridCount = table[i + 1]?.[0];
      const dots = plainGridCount && grids * 2 === plainGridCount * 3 ? 1 : 0;
      return { type: typeName, dots };
    }
  }
  return null;
}

/**
 * Decompose a duration in grids into tied note values (largest-first greedy).
 * e.g. 5 grids (subdivision=16) → [4, 1] = quarter + 16th
 */
function decomposeGrids(grids: number, subdivision: number): number[] {
  const result: number[] = [];
  let remaining = grids;

  const candidates: number[] = [];
  for (let exp = 0; exp <= 5; exp++) {
    const base = subdivision / 2 ** exp;
    if (Number.isInteger(base) && base >= 1) {
      candidates.push((base * 3) / 2); // dotted
      candidates.push(base);
    }
  }
  const sorted = [...new Set(candidates.filter(Number.isInteger))].sort((a, b) => b - a);

  while (remaining > 0) {
    const fit = sorted.find((v) => v <= remaining);
    if (!fit) {
      result.push(remaining);
      break;
    }
    result.push(fit);
    remaining -= fit;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Rest generation
// ---------------------------------------------------------------------------

interface RestEntry {
  gridPosition: number;
  voice: 1 | 2;
  duration: number; // in grid units
}

/**
 * Fill gaps in a voice with rests so MusicXML is valid.
 */
function computeRests(
  chords: Chord[],
  voice: 1 | 2,
  gpm: number,
  totalMeasures: number,
): RestEntry[] {
  const totalGrids = gpm * totalMeasures;
  const occupied = new Set<number>();

  for (const chord of chords) {
    if (chord.notes.some((n) => n.mapping.voice === voice)) {
      occupied.add(chord.gridPosition);
    }
  }

  const rests: RestEntry[] = [];
  let pos = 0;
  while (pos < totalGrids) {
    if (!occupied.has(pos)) {
      let len = 0;
      while (pos + len < totalGrids && !occupied.has(pos + len)) len++;
      rests.push({ gridPosition: pos, voice, duration: len });
      pos += len;
    } else {
      pos++;
    }
  }
  return rests;
}

// ---------------------------------------------------------------------------
// Note XML
// ---------------------------------------------------------------------------

/** Collect unique (MIDI pitch → mapping) pairs from all chords, sorted by pitch. */
function collectInstruments(chords: Chord[]): Map<number, DrumMappingEntry> {
  const instruments = new Map<number, DrumMappingEntry>();
  for (const chord of chords) {
    for (const note of chord.notes) {
      if (!instruments.has(note.pitch)) {
        instruments.set(note.pitch, note.mapping);
      }
    }
  }
  return new Map([...instruments].sort((a, b) => a[0] - b[0]));
}

function noteheadXml(type: string): string {
  if (type === 'x') return `        <notehead>x</notehead>\n`;
  if (type === 'circle-x') return `        <notehead>circle-x</notehead>\n`;
  if (type === 'diamond') return `        <notehead>diamond</notehead>\n`;
  if (type === 'triangle') return `        <notehead>triangle</notehead>\n`;
  return '';
}

function buildNoteXml(
  note: QuantizedNote,
  isChordContinuation: boolean,
  subdivision: number,
  ghostThreshold: number,
): string {
  const { mapping, velocity, durationGrids } = note;
  const ghost = isGhostNote(velocity, ghostThreshold);
  const nv = gridsToDuration(durationGrids, subdivision) ?? { type: '16th', dots: 0 };

  let xml = '      <note>\n';
  if (isChordContinuation) xml += '        <chord/>\n';
  xml += `        <unpitched>\n`;
  xml += `          <display-step>${escapeXml(mapping.step)}</display-step>\n`;
  xml += `          <display-octave>${mapping.octave}</display-octave>\n`;
  xml += `        </unpitched>\n`;
  xml += `        <duration>${durationGrids}</duration>\n`;
  xml += `        <instrument id="P1-X${note.pitch}"/>\n`;
  xml += `        <voice>${mapping.voice}</voice>\n`;
  xml += `        <type>${nv.type}</type>\n`;
  for (let d = 0; d < nv.dots; d++) xml += '        <dot/>\n';
  if (ghost)
    xml += `        <notations><technical><other-technical>ghost</other-technical></technical></notations>\n`;
  xml += noteheadXml(mapping.notehead);
  xml += `        <stem>${mapping.stemDirection}</stem>\n`;
  xml += '      </note>\n';
  return xml;
}

function buildRestXml(voice: 1 | 2, totalDuration: number, subdivision: number): string {
  const parts = decomposeGrids(totalDuration, subdivision);
  let xml = '';
  for (const dur of parts) {
    const nv = gridsToDuration(dur, subdivision) ?? { type: '16th', dots: 0 };
    xml += '      <note>\n';
    xml += '        <rest/>\n';
    xml += `        <duration>${dur}</duration>\n`;
    xml += `        <voice>${voice}</voice>\n`;
    xml += `        <type>${nv.type}</type>\n`;
    for (let d = 0; d < nv.dots; d++) xml += '        <dot/>\n';
    xml += '      </note>\n';
  }
  return xml;
}

// ---------------------------------------------------------------------------
// Measure builder
// ---------------------------------------------------------------------------

interface MeasureEvent {
  gridPosition: number; // relative to measure start
  type: 'chord' | 'rest';
  chord?: Chord;
  rest?: RestEntry;
}

function buildMeasureXml(
  measureIndex: number,
  events: MeasureEvent[],
  opts: BuildOptions,
  divisionsPerQ: number,
  isFirst: boolean,
): string {
  let xml = `    <measure number="${measureIndex + 1}">\n`;

  if (isFirst) {
    xml += '      <attributes>\n';
    xml += `        <divisions>${divisionsPerQ}</divisions>\n`;
    xml += '        <key><fifths>0</fifths></key>\n';
    xml += `        <time><beats>${opts.beatsPerMeasure}</beats><beat-type>${opts.beatUnit}</beat-type></time>\n`;
    xml += '        <clef><sign>percussion</sign></clef>\n';
    xml += '      </attributes>\n';
    xml += '      <direction placement="above">\n';
    xml += '        <direction-type>\n';
    xml += `          <metronome parentheses="no">\n`;
    xml += `            <beat-unit>quarter</beat-unit>\n`;
    xml += `            <per-minute>${opts.bpm}</per-minute>\n`;
    xml += '          </metronome>\n';
    xml += '        </direction-type>\n';
    xml += `        <sound tempo="${opts.bpm}"/>\n`;
    xml += '      </direction>\n';
  }

  const gpm = gridsPerMeasure(opts);

  const v1 = events.filter(
    (e) =>
      (e.type === 'chord' && e.chord!.notes.some((n) => n.mapping.voice === 1)) ||
      (e.type === 'rest' && e.rest!.voice === 1),
  );
  const v2 = events.filter(
    (e) =>
      (e.type === 'chord' && e.chord!.notes.some((n) => n.mapping.voice === 2)) ||
      (e.type === 'rest' && e.rest!.voice === 2),
  );

  for (const ev of v1) {
    if (ev.type === 'rest') {
      xml += buildRestXml(1, ev.rest!.duration, opts.subdivision);
    } else {
      const v1Notes = ev.chord!.notes.filter((n) => n.mapping.voice === 1);
      v1Notes.forEach((note, idx) => {
        xml += buildNoteXml(note, idx > 0, opts.subdivision, opts.ghostThreshold);
      });
    }
  }

  if (v2.length > 0) {
    xml += `      <backup><duration>${gpm}</duration></backup>\n`;
    for (const ev of v2) {
      if (ev.type === 'rest') {
        xml += buildRestXml(2, ev.rest!.duration, opts.subdivision);
      } else {
        const v2Notes = ev.chord!.notes.filter((n) => n.mapping.voice === 2);
        v2Notes.forEach((note, idx) => {
          xml += buildNoteXml(note, idx > 0, opts.subdivision, opts.ghostThreshold);
        });
      }
    }
  }

  xml += '    </measure>\n';
  return xml;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildMusicXml(chords: Chord[], opts: BuildOptions): string {
  const gpm = gridsPerMeasure(opts);
  const maxGrid = chords.length > 0 ? Math.max(...chords.map((c) => c.gridPosition)) + 1 : gpm;
  const totalMeasures = Math.ceil(maxGrid / gpm);
  const divisionsPerQ = divisionsPerQuarter(opts.subdivision);

  const rests1 = computeRests(chords, 1, gpm, totalMeasures);
  const rests2 = computeRests(chords, 2, gpm, totalMeasures);

  let measuresXml = '';

  for (let m = 0; m < totalMeasures; m++) {
    const measureStart = m * gpm;
    const measureEnd = measureStart + gpm;

    const events: MeasureEvent[] = [];

    for (const chord of chords) {
      if (chord.gridPosition >= measureStart && chord.gridPosition < measureEnd) {
        events.push({ gridPosition: chord.gridPosition - measureStart, type: 'chord', chord });
      }
    }

    for (const rest of rests1) {
      if (rest.gridPosition >= measureStart && rest.gridPosition < measureEnd) {
        const clipped = Math.min(rest.duration, measureEnd - rest.gridPosition);
        events.push({
          gridPosition: rest.gridPosition - measureStart,
          type: 'rest',
          rest: { ...rest, duration: clipped },
        });
      }
    }

    for (const rest of rests2) {
      if (rest.gridPosition >= measureStart && rest.gridPosition < measureEnd) {
        const clipped = Math.min(rest.duration, measureEnd - rest.gridPosition);
        events.push({
          gridPosition: rest.gridPosition - measureStart,
          type: 'rest',
          rest: { ...rest, duration: clipped },
        });
      }
    }

    events.sort((a, b) => a.gridPosition - b.gridPosition);
    measuresXml += buildMeasureXml(m, events, opts, divisionsPerQ, m === 0);
  }

  const title = opts.title ?? 'Drum Score';
  const instruments = collectInstruments(chords);

  let scoreInstruments = '';
  let midiInstruments = '';
  for (const [pitch, mapping] of instruments) {
    scoreInstruments += `      <score-instrument id="P1-X${pitch}">\n`;
    scoreInstruments += `        <instrument-name>${escapeXml(mapping.name)}</instrument-name>\n`;
    scoreInstruments += `      </score-instrument>\n`;
    midiInstruments += `      <midi-instrument id="P1-X${pitch}">\n`;
    midiInstruments += `        <midi-channel>10</midi-channel>\n`;
    midiInstruments += `        <midi-program>1</midi-program>\n`;
    midiInstruments += `        <midi-unpitched>${pitch}</midi-unpitched>\n`;
    midiInstruments += `      </midi-instrument>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
  "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
  "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work><work-title>${escapeXml(title)}</work-title></work>
  <identification>
    <encoding>
      <software>groove2score</software>
      <encoding-date>${new Date().toISOString().slice(0, 10)}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Drums</part-name>
${scoreInstruments}${midiInstruments}    </score-part>
  </part-list>
  <part id="P1">
${measuresXml}  </part>
</score-partwise>
`;
}
