#!/usr/bin/env node
import ToneMidi from '@tonejs/midi';

const { Midi } = ToneMidi;

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { convertToGm1 } from '../core/convert';
import { DrumProfile } from '../mappings/type';

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
const DRUM_PROFILES: DrumProfile[] = ['gm1', 'ad2'];

program
  .command('convert <input>')
  .description('Convert drum MIDI file to General Midi file.')
  .option('-o, --output <file>', 'Output Midi file (.midi)')
  .option(
    '--profile <profile>',
    'Select profile which to convert to midi. ex. AD2, GM1 etc..',
    'gm1',
  )
  .option('--dry-run', 'Print output to stdout instead of writing a file')
  .action((input: string, opts: { output?: string; profile: string; dryRun?: boolean }) => {
    const profileLower = opts.profile.toLowerCase();
    if (!DRUM_PROFILES.includes(profileLower as DrumProfile)) {
      console.error(
        `Unknown profile: ${opts.profile}. Valid profiles: ${DRUM_PROFILES.join(', ')}`,
      );
      process.exit(1);
    }
    const profile = profileLower as DrumProfile;

    const absInput = resolve(input);
    const buffer = readFileSync(absInput);
    const midi = convertToGm1(buffer, profile);

    if (opts.dryRun) {
      console.log(JSON.stringify(midi.toJSON(), null, 2));
      return;
    }

    const absOutput = resolve(opts.output ?? input.replace(/(\.[^.]+)?$/, '.gm1.mid'));
    writeFileSync(absOutput, Buffer.from(midi.toArray()));
    console.log(`Written to ${absOutput}`);
  });

program.parse(process.argv);
