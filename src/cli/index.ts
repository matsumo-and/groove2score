#!/usr/bin/env node
import { Command } from 'commander';
import { basename, extname, resolve } from 'path';

// ---------------------------------------------------------------------------
// Default mapping path (bundled mappings/default.json)
// ---------------------------------------------------------------------------
const DEFAULT_MAPPING = new URL('../../mappings/default.json', import.meta.url).pathname;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const program = new Command();

program
  .name('groove2score')
  .description('Convert drum MIDI files to MusicXML notation')
  .version('0.1.0')
  .argument('<input>', 'Input MIDI file (.mid)')
  .option('-o, --output <file>', 'Output MusicXML file (.xml)')
  .option('--quantize <n>', 'Grid subdivision (4/8/16/32)', '16')
  .option('--bpm <n>', 'Tempo in BPM (overrides MIDI tempo if specified)')
  .option('--mapping <file>', 'Path to drum mapping JSON', DEFAULT_MAPPING)
  .option('--ghost-threshold <n>', 'Velocity threshold for ghost notes', '40')
  .option('--time-sig <n/d>', 'Time signature (e.g. 4/4)', '4/4')
  .option('--dry-run', 'Print output to stdout instead of writing a file')
  .option('--musescore', 'Use MuseScore-compatible template output')
  .parse(process.argv);

const opts = program.opts();
const [inputPath] = program.args;

// Resolve paths
const absInput = resolve(inputPath);
const defaultOutput = `${basename(absInput, extname(absInput))}.xml`;
const _absOutput = opts.output ? resolve(opts.output) : resolve(defaultOutput);

// Parse options
const _subdivision = parseInt(opts.quantize, 10);
const _ghostThreshold = parseInt(opts.ghostThreshold, 10);
const [beatsStr, beatUnitStr] = (opts.timeSig as string).split('/');
const _beatsPerMeasure = parseInt(beatsStr, 10);
const _beatUnit = parseInt(beatUnitStr, 10);
