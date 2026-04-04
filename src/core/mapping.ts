import { readFileSync } from 'fs';
import type { DrumMapping, MappedNote, RawNote } from './types.js';

export type DrumMappingTable = Record<string, DrumMapping>;

/** Load a drum mapping from a JSON file path. */
export function loadMapping(filePath: string): DrumMappingTable {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as DrumMappingTable;
}

/**
 * Apply drum mapping to raw notes.
 * Notes with no mapping entry are silently dropped.
 */
export function applyMapping(notes: RawNote[], mapping: DrumMappingTable): MappedNote[] {
  const result: MappedNote[] = [];

  for (const note of notes) {
    const entry = mapping[String(note.pitch)];
    if (!entry) continue; // unknown pitch — skip
    result.push({ ...note, mapping: entry });
  }

  return result;
}
