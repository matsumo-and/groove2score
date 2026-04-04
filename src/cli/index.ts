#!/usr/bin/env node
import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { createRequire } from 'module';
import { basename, extname, resolve } from 'path';
import { applyMapping, loadMapping } from '../core/mapping.js';
import { parseMidi } from '../core/midi-parser.js';
import { mergeIntoChords } from '../core/normalizer.js';
import { quantizeNotes } from '../core/quantizer.js';
import { buildMusicXml } from '../xml/builder.js';

// ---------------------------------------------------------------------------
// Default mapping path (bundled mapping.json beside the package root)
// ---------------------------------------------------------------------------
const _require = createRequire(import.meta.url);
const DEFAULT_MAPPING = new URL('../../mapping.json', import.meta.url).pathname;

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
  .option('--bpm <n>', 'Tempo in BPM (used for quantization)', '120')
  .option('--mapping <file>', 'Path to drum mapping JSON', DEFAULT_MAPPING)
  .option('--ghost-threshold <n>', 'Velocity threshold for ghost notes', '40')
  .option('--time-sig <n/d>', 'Time signature (e.g. 4/4)', '4/4')
  .option('--dry-run', 'Print output to stdout instead of writing a file')
  .parse(process.argv);

const opts = program.opts();
const [inputPath] = program.args;

// Resolve paths
const absInput = resolve(inputPath);
const defaultOutput = `${basename(absInput, extname(absInput))}.xml`;
const absOutput = opts.output ? resolve(opts.output) : resolve(defaultOutput);

// Parse options
const subdivision = parseInt(opts.quantize, 10);
const bpm = parseFloat(opts.bpm);
const ghostThreshold = parseInt(opts.ghostThreshold, 10);
const [beatsStr, beatUnitStr] = (opts.timeSig as string).split('/');
const beatsPerMeasure = parseInt(beatsStr, 10);
const beatUnit = parseInt(beatUnitStr, 10);

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

console.error(`[groove2score] Parsing: ${absInput}`);
const rawNotes = parseMidi(absInput);
console.error(`[groove2score] Found ${rawNotes.length} drum note(s)`);

const mappingTable = loadMapping(opts.mapping as string);
const mappedNotes = applyMapping(rawNotes, mappingTable);
console.error(`[groove2score] Mapped ${mappedNotes.length} note(s)`);

const quantized = quantizeNotes(mappedNotes, { subdivision, bpm });

const chords = mergeIntoChords(quantized, { ghostThreshold });
console.error(`[groove2score] Merged into ${chords.length} chord(s)/beat(s)`);

const xml = buildMusicXml(chords, {
  title: basename(absInput, extname(absInput)),
  subdivision,
  beatsPerMeasure,
  beatUnit,
  ghostThreshold,
});

if (opts.dryRun) {
  process.stdout.write(xml);
} else {
  writeFileSync(absOutput, xml, 'utf-8');
  console.error(`[groove2score] Written: ${absOutput}`);
}
