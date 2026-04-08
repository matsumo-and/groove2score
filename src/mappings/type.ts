/**
 * Drum instrument categories used to classify each MIDI note in a {@link DrumMapping}.
 *
 * | Value         | Instrument       |
 * |---------------|------------------|
 * | `Kick`        | Bass drum        |
 * | `Snare`       | Snare drum       |
 * | `SideStick`   | Rimshot / side stick |
 * | `OpenHiHat`   | Open hi-hat      |
 * | `CloseHiHat`  | Closed hi-hat    |
 * | `HighTom`     | High tom         |
 * | `LowTom`      | Mid / low tom    |
 * | `FloorTom`    | Floor tom        |
 * | `Crash`       | Crash cymbal     |
 * | `Ride`        | Ride cymbal      |
 * | `China`       | China cymbal     |
 * | `Splash`      | Splash cymbal    |
 */
export type DrumInstruments =
  | 'Kick'
  | 'Snare'
  | 'SideStick'
  | 'OpenHiHat'
  | 'CloseHiHat'
  | 'HighTom'
  | 'LowTom'
  | 'FloorTom'
  | 'Crash'
  | 'Ride'
  | 'China'
  | 'Splash';

/**
 * A single drum instrument note definition.
 *
 * @example
 * { name: "Kick Drum", type: "kick" }
 */
export type DrumNote = {
  name: string;
  type: DrumInstruments;
};

/**
 * Maps MIDI note numbers to their corresponding drum note definitions.
 *
 * Keys are MIDI note numbers (0–127). Values describe which drum instrument
 * that note triggers.
 *
 * @example
 * const mapping: DrumMapping = {
 *   36: { name: "Kick Drum", type: "kick" },
 *   38: { name: "Snare",     type: "snare" },
 * };
 */
export type DrumMapping = Record<number, DrumNote>;
