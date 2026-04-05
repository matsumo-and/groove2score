# Drum Mappings

This directory contains drum mapping configuration files that define how MIDI note numbers are translated to MusicXML notation.

## Available Mappings

- `default.json` - General MIDI (GM) standard drum mapping

## Mapping Format

Each mapping file is a JSON object where:
- Keys are MIDI note numbers (35-81 for GM drums)
- Values contain notation details:
  - `part`: Instrument name
  - `voice`: Voice number (1 or 2)
  - `step`: Note name (C, D, E, F, G, A, B)
  - `octave`: Octave number
  - `notehead`: Notehead type (normal, x, circle-x, diamond, triangle)
  - `stemDirection`: Stem direction (up or down)

## General MIDI Drum Map Reference

| MIDI Note | Instrument |
|-----------|------------|
| 35 | Acoustic Bass Drum |
| 36 | Bass Drum 1 |
| 37 | Side Stick |
| 38 | Acoustic Snare |
| 39 | Hand Clap |
| 40 | Electric Snare |
| 41 | Low Floor Tom |
| 42 | Closed Hi-Hat |
| 43 | High Floor Tom |
| 44 | Pedal Hi-Hat |
| 45 | Low Tom |
| 46 | Open Hi-Hat |
| 47 | Low-Mid Tom |
| 48 | Hi-Mid Tom |
| 49 | Crash Cymbal 1 |
| 50 | High Tom |
| 51 | Ride Cymbal 1 |
| 52 | Chinese Cymbal |
| 53 | Ride Bell |
| 54 | Tambourine |
| 55 | Splash Cymbal |
| 56 | Cowbell |
| 57 | Crash Cymbal 2 |
| 58 | Vibraslap |
| 59 | Ride Cymbal 2 |
| 60 | Hi Bongo |
| 61 | Low Bongo |
| 62 | Mute Hi Conga |
| 63 | Open Hi Conga |
| 64 | Low Conga |
| 65 | High Timbale |
| 66 | Low Timbale |
| 67 | High Agogo |
| 68 | Low Agogo |
| 69 | Cabasa |
| 70 | Maracas |
| 71 | Short Whistle |
| 72 | Long Whistle |
| 73 | Short Guiro |
| 74 | Long Guiro |
| 75 | Claves |
| 76 | Hi Wood Block |
| 77 | Low Wood Block |
| 78 | Mute Cuica |
| 79 | Open Cuica |
| 80 | Mute Triangle |
| 81 | Open Triangle |

## Creating Custom Mappings

To create a custom mapping, copy `default.json` to a new file and modify the values as needed. Use the custom mapping with the `--mapping` option:

```bash
groove2score input.mid --mapping path/to/custom-mapping.json
```