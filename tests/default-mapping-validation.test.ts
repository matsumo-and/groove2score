import { readFileSync } from 'fs';
import { DrumMappingEntry, drumMappingSchema } from '../src/core/drum-parts.js';

describe('default.json validation', () => {
  test('default.json conforms to drumMappingSchema', () => {
    const mappingPath = new URL('../mappings/default.json', import.meta.url).pathname;
    const raw = readFileSync(mappingPath, 'utf-8');
    const data = JSON.parse(raw);

    const result = drumMappingSchema.safeParse(data);

    if (!result.success) {
      console.error('Validation errors:', result.error.issues);
    }

    expect(result.success).toBe(true);
  });

  test('default.json uses only valid part types', () => {
    const mappingPath = new URL('../mappings/default.json', import.meta.url).pathname;
    const raw = readFileSync(mappingPath, 'utf-8');
    const data = JSON.parse(raw);

    const validPartTypes = new Set([
      'BassDrum',
      'Snare',
      'HiHat',
      'Crash',
      'Ride',
      'Tom',
      'FloorTom',
      'Splash',
      'China',
      'Cowbell',
      'Clap',
      'Tambourine',
      'Conga',
      'Bongo',
      'Timbale',
      'Agogo',
      'Cabasa',
      'Maracas',
      'Whistle',
      'Guiro',
      'Claves',
      'WoodBlock',
      'Cuica',
      'Triangle',
      'Vibraslap',
    ]);

    for (const [_, mapping] of Object.entries(data)) {
      expect(validPartTypes.has((mapping as DrumMappingEntry).part)).toBe(true);
    }
  });
});
