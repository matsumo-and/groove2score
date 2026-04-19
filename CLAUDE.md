# groove2score

A CLI tool that converts drum MIDI files (primarily from Addictive Drums 2) into quantized and formatted MIDI or MusicXML. The end goal is clean drum notation for display in MuseScore.

## Structure

- `src/cli/` — CLI entry point (commander)
- `src/core/` — MIDI parsing and MusicXML conversion logic
- `src/mappings/` — Per-drum-source MIDI note number → percussion type mappings

## Constraints

- Delegate exploration and research tasks to sub-agents
- Always run the verify skill after completing an implementation
