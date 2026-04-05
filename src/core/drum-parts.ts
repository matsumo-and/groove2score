import { z } from 'zod';

// Standard drum part types (consistent across all mappings)
export const DRUM_PARTS = {
  BassDrum: 'BassDrum',
  Snare: 'Snare',
  HiHat: 'HiHat',
  Crash: 'Crash',
  Ride: 'Ride',
  Tom: 'Tom',
  FloorTom: 'FloorTom',
  Splash: 'Splash',
  China: 'China',
  Cowbell: 'Cowbell',
  Clap: 'Clap',
  Tambourine: 'Tambourine',
  Conga: 'Conga',
  Bongo: 'Bongo',
  Timbale: 'Timbale',
  Agogo: 'Agogo',
  Cabasa: 'Cabasa',
  Maracas: 'Maracas',
  Whistle: 'Whistle',
  Guiro: 'Guiro',
  Claves: 'Claves',
  WoodBlock: 'WoodBlock',
  Cuica: 'Cuica',
  Triangle: 'Triangle',
  Vibraslap: 'Vibraslap',
} as const;

export type DrumPart = (typeof DRUM_PARTS)[keyof typeof DRUM_PARTS];

// Notehead types
export const NOTEHEAD_TYPES = {
  normal: 'normal',
  x: 'x',
  'circle-x': 'circle-x',
  diamond: 'diamond',
  triangle: 'triangle',
} as const;

export type NoteheadType = (typeof NOTEHEAD_TYPES)[keyof typeof NOTEHEAD_TYPES];

// Voice types
export const VOICE_TYPES = {
  Upper: 1,
  Lower: 2,
} as const;

export type VoiceType = (typeof VOICE_TYPES)[keyof typeof VOICE_TYPES];

// Stem direction types
export const STEM_DIRECTIONS = {
  Up: 'up',
  Down: 'down',
} as const;

export type StemDirection = (typeof STEM_DIRECTIONS)[keyof typeof STEM_DIRECTIONS];

// Zod schemas for validation
export const drumPartSchema = z.enum(Object.values(DRUM_PARTS) as [string, ...string[]]);
export const noteheadSchema = z.enum(Object.values(NOTEHEAD_TYPES) as [string, ...string[]]);
export const voiceSchema = z.union([z.literal(1), z.literal(2)]);
export const stemDirectionSchema = z.enum(Object.values(STEM_DIRECTIONS) as [string, ...string[]]);

// Drum mapping entry schema
export const drumMappingEntrySchema = z.object({
  name: z.string().describe('Human-readable instrument name'),
  part: drumPartSchema.describe('Standardized part type'),
  voice: voiceSchema.describe('Voice number (1 or 2)'),
  step: z.enum(['C', 'D', 'E', 'F', 'G', 'A', 'B']).describe('Note step'),
  octave: z.number().min(0).max(9).describe('Octave number'),
  notehead: noteheadSchema.describe('Notehead type'),
  stemDirection: stemDirectionSchema.describe('Stem direction'),
});

export type DrumMappingEntry = z.infer<typeof drumMappingEntrySchema>;

// Full drum mapping schema
export const drumMappingSchema = z.record(z.string(), drumMappingEntrySchema);

export type DrumMappingTable = z.infer<typeof drumMappingSchema>;
