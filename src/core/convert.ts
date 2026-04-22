import ToneMidi from '@tonejs/midi';

const { Midi } = ToneMidi;

import { AD2_MAPPING } from '../mappings/ad2';
import { GM1_MAPPING } from '../mappings/gm1';
import { DrumMapping, DrumNote, DrumProfile } from '../mappings/type';

/**
 * Returns the {@link DrumMapping} associated with the given profile.
 *
 * @param profile - The drum profile identifier.
 * @returns The drum mapping for the specified profile.
 */
function getMapping(profile: DrumProfile): DrumMapping {
  switch (profile) {
    case 'ad2':
      return AD2_MAPPING;
    case 'gm1':
      return GM1_MAPPING;
  }
}

/**
 * Builds a stable string key for a {@link DrumNote} that uniquely identifies
 * the combination of instrument type and articulation.
 *
 * @param note - The drum note to derive a key from.
 * @returns A string of the form `"type"` or `"type:articulation"`.
 */
function articulationKey(note: DrumNote): string {
  if ('articulation' in note && note.articulation !== undefined) {
    return `${note.type}:${note.articulation}`;
  }
  return note.type;
}

/**
 * Builds a reverse lookup map from articulation key to MIDI note number for
 * the given profile. When multiple notes share the same key, the first one
 * encountered wins.
 *
 * @param profile - The target drum profile to build the map for.
 * @returns A map from `"type"` or `"type:articulation"` to MIDI note number.
 */
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

/**
 * Converts a drum MIDI buffer from one mapping profile to another.
 *
 * All tracks are forced onto the GM drum channel (channel 10, 0-indexed 9).
 * When `from` and `to` are the same profile, only the channel assignment is
 * applied and note numbers are left unchanged.
 *
 * @param inputBuffer - Raw MIDI file contents.
 * @param from - Source drum mapping profile used to interpret incoming note numbers.
 * @param to - Target drum mapping profile to remap note numbers into.
 * @returns The modified {@link Midi} object ready for serialization.
 */
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
