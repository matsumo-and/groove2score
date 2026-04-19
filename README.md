# groove2score

Convert drum MIDI files into clean, quantized drum notation (MIDI or MusicXML) for use in MuseScore and other notation software.

Primarily designed for [Addictive Drums 2](https://www.xlnaudio.com/products/addictive_drums_2) outputs, but supports any drum source that can be mapped to a standard profile.

## Features

- Convert drum MIDI between profiles (e.g. Addictive Drums 2 → General MIDI)
- Extensible drum mapping system — add support for any drum VST
- Outputs clean MIDI suitable for import into MuseScore or DAWs
- Lightweight CLI with no runtime dependencies beyond Node.js

## Supported Profiles

| Profile | Description |
|---------|-------------|
| `gm1`   | General MIDI 1 (standard drum map) |
| `ad2`   | Addictive Drums 2 |
| `msc`   | MuseScore internal drum map |

## Installation

```bash
npm install -g groove2score
# or
pnpm add -g groove2score
```

## Usage

### Show MIDI contents

Inspect the raw note data in a MIDI file:

```bash
groove2score show <input.mid>
```

### Convert between drum profiles

```bash
groove2score convert <input.mid> --from <profile> --to <profile> [options]
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--from <profile>` | *(required)* | Source drum profile |
| `--to <profile>` | `gm1` | Target drum profile |
| `-o, --output <path>` | `<input>.<to>.mid` | Output file path |
| `--dry-run` | — | Print converted MIDI as JSON instead of writing a file |

**Example:**

```bash
# Convert an Addictive Drums 2 MIDI file to General MIDI
groove2score convert groove.mid --from ad2 --to gm1 -o groove.gm1.mid

# Preview the result without writing
groove2score convert groove.mid --from ad2 --dry-run
```

## Development

**Requirements:** Node.js 22+, pnpm 10+

```bash
# Install dependencies
pnpm install

# Run from source
pnpm dev convert groove.mid --from ad2

# Type check
pnpm typecheck

# Lint and format
pnpm lint:fix && pnpm format

# Build
pnpm build

# Test
pnpm test
```

### Project Structure

```
src/
├── cli/        # CLI entry point (commander)
├── core/       # MIDI parsing and conversion logic
└── mappings/   # MIDI note → drum instrument mappings per profile
```

### Adding a new drum profile

1. Create `src/mappings/<profile>.ts` and export a `DrumMapping` object.
2. Register the profile name in `src/mappings/type.ts` (`DrumProfile` union).
3. Wire it up in `src/core/convert.ts` (`getMapping()`).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](./LICENSE)
