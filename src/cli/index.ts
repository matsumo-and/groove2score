#!/usr/bin/env node
import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { basename, extname, resolve } from 'path';
import { applyMapping, loadMapping } from '../core/mapping.js';
import { parseMidi } from '../core/midi-parser.js';
import { mergeIntoChords } from '../core/normalizer.js';
import { quantizeNotes } from '../core/quantizer.js';
import { buildMusicXml } from '../xml/builder.js';

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
  .parse(process.argv);

const opts = program.opts();
const [inputPath] = program.args;

// Resolve paths
const absInput = resolve(inputPath);
const defaultOutput = `${basename(absInput, extname(absInput))}.xml`;
const absOutput = opts.output ? resolve(opts.output) : resolve(defaultOutput);

// Parse options
const subdivision = parseInt(opts.quantize, 10);
const ghostThreshold = parseInt(opts.ghostThreshold, 10);
const [beatsStr, beatUnitStr] = (opts.timeSig as string).split('/');
const beatsPerMeasure = parseInt(beatsStr, 10);
const beatUnit = parseInt(beatUnitStr, 10);

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

console.info(`[groove2score] Parsing: ${absInput}`);
const { notes: rawNotes, ppq, bpm: midiBpm } = parseMidi(absInput);
const bpm = opts.bpm ? parseFloat(opts.bpm) : (midiBpm ?? 120);
console.info(
  `[groove2score] Found ${rawNotes.length} drum note(s) (ppq=${ppq}, bpm=${bpm}${midiBpm && !opts.bpm ? ' [from MIDI]' : opts.bpm ? ' [from --bpm]' : ' [default]'})`,
);

const mappingTable = loadMapping(opts.mapping as string);
const mappedNotes = applyMapping(rawNotes, mappingTable);
console.info(`[groove2score] Mapped ${mappedNotes.length} note(s)`);

const quantized = quantizeNotes(mappedNotes, { subdivision, ppq });

const chords = mergeIntoChords(quantized, { ghostThreshold });
console.info(`[groove2score] Merged into ${chords.length} chord(s)/beat(s)`);

const xml = buildMusicXml(chords, {
  title: basename(absInput, extname(absInput)),
  subdivision,
  beatsPerMeasure,
  beatUnit,
  ghostThreshold,
  bpm,
});

if (opts.dryRun) {
  process.stdout.write(xml);
} else {
  writeFileSync(absOutput, xml, 'utf-8');
  console.info(`[groove2score] Written: ${absOutput}`);
}
