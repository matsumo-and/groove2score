// @tonejs/midi is CJS — use default import
import MidiPkg from "@tonejs/midi";
const { Midi } = MidiPkg as typeof import("@tonejs/midi");
import { readFileSync } from "fs";
import type { RawNote } from "./types.js";

/**
 * Parse a MIDI file and return all notes from drum tracks.
 * Drum tracks are identified by channel 9 (0-indexed) or
 * any track whose instrument is a drum kit.
 */
export function parseMidi(filePath: string): RawNote[] {
  const buffer = readFileSync(filePath);
  const midi = new Midi(buffer);

  const notes: RawNote[] = [];

  for (const track of midi.tracks) {
    // Channel 9 (0-indexed) is the GM drum channel
    const isDrumTrack =
      track.channel === 9 ||
      track.instrument.percussion ||
      track.name.toLowerCase().includes("drum") ||
      track.name.toLowerCase().includes("perc");

    if (!isDrumTrack) continue;

    for (const note of track.notes) {
      notes.push({
        pitch: note.midi,
        velocity: Math.round(note.velocity * 127),
        startTime: note.time,
        duration: note.duration,
      });
    }
  }

  // Sort by start time
  return notes.sort((a, b) => a.startTime - b.startTime);
}
