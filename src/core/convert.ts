import ToneMidi from '@tonejs/midi';

const { Midi } = ToneMidi;

import { AD2_MAPPING } from '../mappings/ad2';
import { GM1_MAPPING } from '../mappings/gm1';
import { DrumMapping, DrumNote, DrumProfile } from '../mappings/type';

function getSourceMapping(profile: DrumProfile): DrumMapping {
  switch (profile) {
    case 'ad2':
      return AD2_MAPPING;
    case 'gm1':
      return GM1_MAPPING;
  }
}

function articulationKey(note: DrumNote): string {
  if ('articulation' in note && note.articulation !== undefined) {
    return `${note.type}:${note.articulation}`;
  }
  return note.type;
}

function buildGm1ReverseMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const [num, note] of Object.entries(GM1_MAPPING)) {
    const key = articulationKey(note);
    if (!map.has(key)) {
      map.set(key, Number(num));
    }
  }
  return map;
}

const GM1_REVERSE_MAP = buildGm1ReverseMap();

/**
 * Convert a drum MIDI buffer from the given profile's note numbers to GM1.
 * If the profile is already 'gm1', the buffer is returned unchanged.
 */
// GM drum channel (MIDI channel 10, 0-indexed = 9)
const GM_DRUM_CHANNEL = 9;

/**
 * Convert a drum MIDI buffer from the given profile's note numbers to GM1.
 * All tracks are forced to channel 10 (index 9) regardless of profile.
 */
export function convertToGm1(inputBuffer: Buffer, profile: DrumProfile) {
  const midi = new Midi(inputBuffer);
  const sourceMapping = getSourceMapping(profile);

  for (const track of midi.tracks) {
    track.channel = GM_DRUM_CHANNEL;

    if (profile === 'gm1') continue;

    for (const note of track.notes) {
      const drumNote = sourceMapping[note.midi];
      if (!drumNote) continue;

      const gm1Midi = GM1_REVERSE_MAP.get(articulationKey(drumNote));
      if (gm1Midi !== undefined) {
        note.midi = gm1Midi;
      }
    }
  }

  return midi;
}
