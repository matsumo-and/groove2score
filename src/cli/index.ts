#!/usr/bin/env node
import ToneMidi from '@tonejs/midi';

const { Midi } = ToneMidi;

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
  .description('Convert drum MIDI file to General Midi file.')
  .option('-o, --output <file>', 'Output Midi file (.midi)')
  .option('--profile', 'Select profile which to convert to midi. ex. AD2, GM1 etc..')
  .option('--dry-run', 'Print output to stdout instead of writing a file')
  .action((_input: string, _opts) => {
    // TODO: conversion logic
  });

program.parse(process.argv);
