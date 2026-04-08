#!/usr/bin/env node
import ToneMidi from '@tonejs/midi';
const { Midi } = ToneMidi;
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
  .version('0.1.0');

// ---------------------------------------------------------------------------
// show command
// ---------------------------------------------------------------------------
program
  .command('show <input>')
  .description('Display MIDI file contents as JSON')
  .action((input: string) => {
    const absInput = resolve(input);
    const buffer = readFileSync(absInput);
    const midi = new Midi(buffer);
    console.log(JSON.stringify(midi.toJSON(), null, 2));
  });

// ---------------------------------------------------------------------------
// convert command (default)
// ---------------------------------------------------------------------------
program
  .command('convert <input>')
  .description('Convert drum MIDI file to MusicXML notation')
  .option('-o, --output <file>', 'Output MusicXML file (.xml)')
  .option('--quantize <n>', 'Grid subdivision (4/8/16/32)', '16')
  .option('--bpm <n>', 'Tempo in BPM (overrides MIDI tempo if specified)')
  .option('--mapping <file>', 'Path to drum mapping JSON', DEFAULT_MAPPING)
  .option('--ghost-threshold <n>', 'Velocity threshold for ghost notes', '40')
  .option('--time-sig <n/d>', 'Time signature (e.g. 4/4)', '4/4')
  .option('--dry-run', 'Print output to stdout instead of writing a file')
  .option('--musescore', 'Use MuseScore-compatible template output')
  .action((_input: string, _opts) => {
    // TODO: conversion logic
  });

program.parse(process.argv);
