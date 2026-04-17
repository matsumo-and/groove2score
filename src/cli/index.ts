#!/usr/bin/env node
import ToneMidi from '@tonejs/midi';

const { Midi } = ToneMidi;

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { convert } from '../core/convert';
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
  .description('Convert drum MIDI file between two drum mapping profiles.')
  .option('-o, --output <file>', 'Output MIDI file path')
  .option('--from <profile>', 'Source drum mapping profile (e.g. ad2, gm1)')
  .option('--to <profile>', 'Target drum mapping profile (e.g. gm1, ad2)', 'gm1')
  .option('--dry-run', 'Print output to stdout instead of writing a file')
  .action(
    (input: string, opts: { output?: string; from?: string; to: string; dryRun?: boolean }) => {
      if (!opts.from) {
        console.error(`Missing required option: --from <profile>. Valid profiles: ${DRUM_PROFILES.join(', ')}`);
        process.exit(1);
      }

      const fromLower = opts.from.toLowerCase();
      const toLower = opts.to.toLowerCase();

      if (!DRUM_PROFILES.includes(fromLower as DrumProfile)) {
        console.error(`Unknown profile: ${opts.from}. Valid profiles: ${DRUM_PROFILES.join(', ')}`);
        process.exit(1);
      }
      if (!DRUM_PROFILES.includes(toLower as DrumProfile)) {
        console.error(`Unknown profile: ${opts.to}. Valid profiles: ${DRUM_PROFILES.join(', ')}`);
        process.exit(1);
      }

      const from = fromLower as DrumProfile;
      const to = toLower as DrumProfile;

      const absInput = resolve(input);
      const buffer = readFileSync(absInput);
      const midi = convert(buffer, from, to);

      if (opts.dryRun) {
        console.log(JSON.stringify(midi.toJSON(), null, 2));
        return;
      }

      const absOutput = resolve(opts.output ?? input.replace(/(\.[^.]+)?$/, `.${to}.mid`));
      writeFileSync(absOutput, Buffer.from(midi.toArray()));
      console.log(`Written to ${absOutput}`);
    },
  );

program.parse(process.argv);
