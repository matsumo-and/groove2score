/**
 * Drum instrument categories used to classify each MIDI note in a {@link DrumMapping}.
 * Open/closed variants and playing techniques are expressed via {@link DrumArticulation}
 * rather than separate instrument values.
 *
 * | Value       | Instrument    |
 * |-------------|---------------|
 * | `Kick`      | Bass drum     |
 * | `Snare`     | Snare drum    |
 * | `HiHat`     | Hi-hat        |
 * | `HighTom`   | High tom      |
 * | `LowTom`    | Mid / low tom |
 * | `FloorTom`  | Floor tom     |
 * | `Crash`     | Crash cymbal  |
 * | `Ride`      | Ride cymbal   |
 * | `China`     | China cymbal  |
 * | `Splash`    | Splash cymbal |
 */
export type DrumInstruments =
  | 'Kick'
  | 'Snare'
  | 'HiHat'
  | 'HighTom'
  | 'LowTom'
  | 'FloorTom'
  | 'Crash'
  | 'Ride'
  | 'China'
  | 'Splash';

/** Playing articulation for hi-hat: `"open"` or `"close"`. */
export type HiHatArticulation = 'open' | 'close' | 'pedal';

/**
 * Playing articulation for snare:
 * - `"normal"` — standard head stroke
 * - `"rim"` — rimshot / side stick
 */
export type SnareArticulation = 'normal' | 'rim';

/**
 * Playing articulation for cymbals (Crash, Ride, China, Splash):
 * - `"normal"` — standard bow stroke
 * - `"cup"` — bell / cup stroke
 */
export type CymbalArticulation = 'normal' | 'cup';

/** Union of all drum articulation values. */
export type DrumArticulation = HiHatArticulation | SnareArticulation | CymbalArticulation;

/**
 * A single drum instrument note definition.
 *
 * This is a discriminated union on `type`, so each instrument only accepts its
 * own articulation values — invalid combinations are caught at compile time.
 *
 * @example
 * { name: "Acoustic Snare", type: "Snare" }
 * { name: "Side Stick",     type: "Snare", articulation: "rim" }
 * { name: "Open Hi-Hat",    type: "HiHat", articulation: "open" }
 */
export type DrumNote =
  | { name: string; type: 'Kick' }
  | { name: string; type: 'Snare'; articulation?: SnareArticulation }
  | { name: string; type: 'HiHat'; articulation?: HiHatArticulation }
  | { name: string; type: 'HighTom' | 'LowTom' | 'FloorTom' }
  | {
      name: string;
      type: 'Crash' | 'Ride' | 'China' | 'Splash';
      articulation?: CymbalArticulation;
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

/**
 * Identifies the MIDI mapping profile to use for drum note resolution.
 *
 * | Value   | Description                          |
 * |---------|--------------------------------------|
 * | `gm1`   | General MIDI 1 standard drum map     |
 * | `ad2`   | Addictive Drums 2 custom drum map    |
 */
export type DrumProfile = 'gm1' | 'ad2';
