import { readFileSync } from 'fs';
import { type DrumMappingTable, drumMappingSchema } from './drum-parts.js';
import type { MappedNote, RawNote } from './types.js';

export type { DrumMappingTable };

/** Load and validate a drum mapping from a JSON file path. */
export function loadMapping(filePath: string): DrumMappingTable {
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  // Validate the mapping with Zod
  const result = drumMappingSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid drum mapping in ${filePath}:\n${result.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')}`,
    );
  }

  return result.data;
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
