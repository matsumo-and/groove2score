import type { Chord, QuantizedNote } from "../core/types.js";
import { isGhostNote } from "../core/normalizer.js";

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
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Grid units per measure (e.g. 16 for 4/4 with 1/16 subdivision) */
function gridsPerMeasure(opts: BuildOptions): number {
  const beatsPerMeasure = opts.beatsPerMeasure;
  const subdivsPerBeat = opts.subdivision / opts.beatUnit;
  return beatsPerMeasure * subdivsPerBeat;
}

/** Duration type name for MusicXML given a subdivision. */
function durationTypeName(subdivision: number): string {
  const map: Record<number, string> = {
    1: "whole",
    2: "half",
    4: "quarter",
    8: "eighth",
    16: "16th",
    32: "32nd",
    64: "64th",
  };
  return map[subdivision] ?? "16th";
}

/** Number of MusicXML <divisions> units per quarter note. We use subdivision. */
function divisionsPerQuarter(subdivision: number): number {
  // divisions per quarter = subdivision / 4 ticks if subdivision is per whole note
  // We keep it simple: 1 division = 1 grid unit; quarter = subdivision/4 divisions
  return subdivision / 4;
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
 * Returns a sorted list of {gridPosition, voice, duration} for each gap.
 */
function computeRests(
  chords: Chord[],
  voice: 1 | 2,
  gpm: number,
  totalMeasures: number
): RestEntry[] {
  const totalGrids = gpm * totalMeasures;
  const occupied = new Set<number>();

  for (const chord of chords) {
    const voiceNotes = chord.notes.filter((n) => n.mapping.voice === voice);
    if (voiceNotes.length > 0) occupied.add(chord.gridPosition);
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

function noteheadXml(type: string): string {
  if (type === "x") return `        <notehead>x</notehead>\n`;
  if (type === "diamond") return `        <notehead>diamond</notehead>\n`;
  return "";
}

function buildNoteXml(
  note: QuantizedNote,
  isChordContinuation: boolean,
  subdivision: number,
  ghostThreshold: number,
  divisionsPerQ: number
): string {
  const { mapping, velocity } = note;
  const ghost = isGhostNote(velocity, ghostThreshold);
  const divisions = divisionsPerQ; // duration = 1 grid unit = divisionsPerQ / (subdivision/4)
  // Each grid unit = 1/(subdivision) of a whole note = (4/subdivision) quarter notes
  const dur = 1; // 1 grid position wide

  let xml = "      <note>\n";
  if (isChordContinuation) xml += "        <chord/>\n";
  xml += `        <unpitched>\n`;
  xml += `          <display-step>${escapeXml(mapping.step)}</display-step>\n`;
  xml += `          <display-octave>${mapping.octave}</display-octave>\n`;
  xml += `        </unpitched>\n`;
  xml += `        <duration>${dur}</duration>\n`;
  xml += `        <voice>${mapping.voice}</voice>\n`;
  xml += `        <type>${durationTypeName(subdivision)}</type>\n`;
  if (ghost) xml += `        <notations><technical><other-technical>ghost</other-technical></technical></notations>\n`;
  xml += noteheadXml(mapping.notehead);
  xml += `        <stem>${mapping.stemDirection}</stem>\n`;
  xml += "      </note>\n";
  return xml;
}

function buildRestXml(voice: 1 | 2, duration: number, subdivision: number): string {
  // For simplicity, always emit 1-grid-unit rests (could be merged later)
  let xml = "";
  for (let i = 0; i < duration; i++) {
    xml += "      <note>\n";
    xml += "        <rest/>\n";
    xml += "        <duration>1</duration>\n";
    xml += `        <voice>${voice}</voice>\n`;
    xml += `        <type>${durationTypeName(subdivision)}</type>\n`;
    xml += "      </note>\n";
  }
  return xml;
}

// ---------------------------------------------------------------------------
// Measure builder
// ---------------------------------------------------------------------------

interface MeasureEvent {
  gridPosition: number; // relative to measure start
  type: "chord" | "rest";
  chord?: Chord;
  rest?: RestEntry;
}

function buildMeasureXml(
  measureIndex: number,
  events: MeasureEvent[],
  opts: BuildOptions,
  divisionsPerQ: number,
  isFirst: boolean
): string {
  let xml = `    <measure number="${measureIndex + 1}">\n`;

  // Attributes block (first measure only)
  if (isFirst) {
    xml += "      <attributes>\n";
    xml += `        <divisions>${divisionsPerQ}</divisions>\n`;
    xml += "        <key><fifths>0</fifths></key>\n";
    xml += `        <time><beats>${opts.beatsPerMeasure}</beats><beat-type>${opts.beatUnit}</beat-type></time>\n`;
    xml += "        <clef><sign>percussion</sign></clef>\n";
    xml += "      </attributes>\n";
  }

  // Separate voice 1 and voice 2 events
  const v1 = events.filter(
    (e) =>
      (e.type === "chord" && e.chord!.notes.some((n) => n.mapping.voice === 1)) ||
      (e.type === "rest" && e.rest!.voice === 1)
  );
  const v2 = events.filter(
    (e) =>
      (e.type === "chord" && e.chord!.notes.some((n) => n.mapping.voice === 2)) ||
      (e.type === "rest" && e.rest!.voice === 2)
  );

  // Emit voice 1 notes
  for (const ev of v1) {
    if (ev.type === "rest") {
      xml += buildRestXml(1, ev.rest!.duration, opts.subdivision);
    } else {
      const chord = ev.chord!;
      const v1Notes = chord.notes.filter((n) => n.mapping.voice === 1);
      v1Notes.forEach((note, idx) => {
        xml += buildNoteXml(
          note,
          idx > 0,
          opts.subdivision,
          opts.ghostThreshold,
          divisionsPerQ
        );
      });
    }
  }

  // Backup to beginning of measure before voice 2
  if (v2.length > 0) {
    const gpm = gridsPerMeasure(opts);
    xml += `      <backup><duration>${gpm}</duration></backup>\n`;

    for (const ev of v2) {
      if (ev.type === "rest") {
        xml += buildRestXml(2, ev.rest!.duration, opts.subdivision);
      } else {
        const chord = ev.chord!;
        const v2Notes = chord.notes.filter((n) => n.mapping.voice === 2);
        v2Notes.forEach((note, idx) => {
          xml += buildNoteXml(
            note,
            idx > 0,
            opts.subdivision,
            opts.ghostThreshold,
            divisionsPerQ
          );
        });
      }
    }
  }

  xml += "    </measure>\n";
  return xml;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildMusicXml(chords: Chord[], opts: BuildOptions): string {
  const gpm = gridsPerMeasure(opts);
  const maxGrid =
    chords.length > 0
      ? Math.max(...chords.map((c) => c.gridPosition)) + 1
      : gpm;
  const totalMeasures = Math.ceil(maxGrid / gpm);
  const divisionsPerQ = divisionsPerQuarter(opts.subdivision);

  // Precompute rests for both voices
  const rests1 = computeRests(chords, 1, gpm, totalMeasures);
  const rests2 = computeRests(chords, 2, gpm, totalMeasures);

  let measuresXml = "";

  for (let m = 0; m < totalMeasures; m++) {
    const measureStart = m * gpm;
    const measureEnd = measureStart + gpm;

    const events: MeasureEvent[] = [];

    // Chords in this measure
    for (const chord of chords) {
      if (chord.gridPosition >= measureStart && chord.gridPosition < measureEnd) {
        events.push({
          gridPosition: chord.gridPosition - measureStart,
          type: "chord",
          chord,
        });
      }
    }

    // Rests in this measure (voice 1)
    for (const rest of rests1) {
      if (rest.gridPosition >= measureStart && rest.gridPosition < measureEnd) {
        const clipped = Math.min(rest.duration, measureEnd - rest.gridPosition);
        events.push({
          gridPosition: rest.gridPosition - measureStart,
          type: "rest",
          rest: { ...rest, duration: clipped },
        });
      }
    }

    // Rests in this measure (voice 2)
    for (const rest of rests2) {
      if (rest.gridPosition >= measureStart && rest.gridPosition < measureEnd) {
        const clipped = Math.min(rest.duration, measureEnd - rest.gridPosition);
        events.push({
          gridPosition: rest.gridPosition - measureStart,
          type: "rest",
          rest: { ...rest, duration: clipped },
        });
      }
    }

    events.sort((a, b) => a.gridPosition - b.gridPosition);

    measuresXml += buildMeasureXml(m, events, opts, divisionsPerQ, m === 0);
  }

  const title = opts.title ?? "Drum Score";

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
      <score-instrument id="P1-I1">
        <instrument-name>Standard Kit</instrument-name>
      </score-instrument>
    </score-part>
  </part-list>
  <part id="P1">
${measuresXml}  </part>
</score-partwise>
`;
}
