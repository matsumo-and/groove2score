import { DrumMapping } from './type';

/**
 * MuseScore common drum map used as a generic fallback profile.
 */
export const MSC_COMMON_MAPPING: DrumMapping = {
  36: {
    name: 'Bass Drum 2',
    type: 'Kick',
  },
  37: {
    name: 'Bass Drum',
    type: 'Kick',
  },
  38: {
    name: 'Cross-stick',
    type: 'Snare',
    articulation: 'rim',
  },
  39: {
    name: 'Snare',
    type: 'Snare',
  },
  42: {
    name: 'Floor Tom',
    type: 'FloorTom',
  },
  43: {
    name: 'Closed Hi-Hat',
    type: 'HiHat',
    articulation: 'close',
  },
  44: {
    name: 'Instrument 44',
    type: 'HiHat',
  },
  45: {
    name: 'Pedal Hi-Hat',
    type: 'HiHat',
    articulation: 'pedal',
  },
  47: {
    name: 'Open Hi-Hat',
    type: 'HiHat',
    articulation: 'open',
  },
  48: {
    name: 'Low Tom',
    type: 'LowTom',
  },
  50: {
    name: 'Crash Cymbal',
    type: 'Crash',
  },
  51: {
    name: 'High Tom',
    type: 'HighTom',
  },
  52: {
    name: 'Ride Cymbal',
    type: 'Ride',
  },
  53: {
    name: 'China Cymbal',
    type: 'China',
  },
  54: {
    name: 'Ride Bell',
    type: 'Ride',
    articulation: 'cup',
  },
  56: {
    name: 'Splash Cymbal',
    type: 'Splash',
  },
  58: {
    name: 'Crash Cymbal 2',
    type: 'Crash',
  },
};
