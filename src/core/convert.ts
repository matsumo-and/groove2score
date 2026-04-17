import ToneMidi from '@tonejs/midi';

const { Midi } = ToneMidi;

import { AD2_MAPPING } from '../mappings/ad2';
import { GM1_MAPPING } from '../mappings/gm1';
import { DrumMapping, DrumNote, DrumProfile } from '../mappings/type';

function getMapping(profile: DrumProfile): DrumMapping {
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

function buildReverseMap(profile: DrumProfile): Map<string, number> {
  const map = new Map<string, number>();
  for (const [num, note] of Object.entries(getMapping(profile))) {
    const key = articulationKey(note);
    if (!map.has(key)) {
      map.set(key, Number(num));
    }
  }
  return map;
}

// GM drum channel (MIDI channel 10, 0-indexed = 9)
const GM_DRUM_CHANNEL = 9;

export function convert(inputBuffer: Buffer, from: DrumProfile, to: DrumProfile) {
  const midi = new Midi(inputBuffer);
  const sourceMapping = getMapping(from);
  const reverseMap = buildReverseMap(to);

  for (const track of midi.tracks) {
    track.channel = GM_DRUM_CHANNEL;

    if (from === to) continue;

    for (const note of track.notes) {
      const drumNote = sourceMapping[note.midi];
      if (!drumNote) continue;

      const targetMidi = reverseMap.get(articulationKey(drumNote));
      if (targetMidi !== undefined) {
        note.midi = targetMidi;
      }
    }
  }

  return midi;
}
