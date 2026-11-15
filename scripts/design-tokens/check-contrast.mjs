#!/usr/bin/env node
// Verifies the WCAG contrast of every pair in design/tokens/contrast-pairs.json.
// Usage: check-contrast.mjs [--markdown]   (--markdown prints a table for design/ACCESSIBILITY.md)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOKENS_DIR, contrastRatio, loadTokenTree, refOf, resolveValue } from './lib.mjs';

const MIN = { text: 4.5, large: 3, 'non-text': 3, info: 0 };
const markdown = process.argv.includes('--markdown');
const tree = loadTokenTree();
const { pairs } = JSON.parse(readFileSync(join(TOKENS_DIR, 'contrast-pairs.json'), 'utf8'));

const rows = pairs.map((pair) => {
  if (!(pair.level in MIN)) throw new Error(`Unknown level "${pair.level}" for ${pair.use}`);
  const fg = resolveValue(tree, pair.fg);
  const bg = resolveValue(tree, pair.bg);
  const ratio = contrastRatio(fg, bg);
  const pass = ratio >= MIN[pair.level];
  return { ...pair, fgHex: fg, bgHex: bg, ratio, pass };
});

const label = (ref) =>
  refOf(ref)
    .replace(/^semantic\.(light|dark)\.color\./, '$1 ')
    .replace(/^color\./, '')
    .replace(/\.DEFAULT$/, '');
const failures = rows.filter((r) => r.level !== 'info' && !r.pass);

if (markdown) {
  console.log('| Use | Foreground | Background | Ratio | Required | Result |');
  console.log('| --- | --- | --- | ---: | ---: | --- |');
  for (const r of rows) {
    const required = r.level === 'info' ? 'info' : `${MIN[r.level]}:1 (${r.level})`;
    const result = r.level === 'info' ? 'Documented limitation' : r.pass ? 'Pass' : '**FAIL**';
    console.log(
      `| ${r.use} | \`${label(r.fg)}\` ${r.fgHex} | \`${label(r.bg)}\` ${r.bgHex} | ${r.ratio.toFixed(2)}:1 | ${required} | ${result} |`,
    );
  }
} else {
  for (const r of rows) {
    const mark = r.level === 'info' ? 'i' : r.pass ? '✓' : '✗';
    console.log(
      `${mark} ${r.ratio.toFixed(2).padStart(5)}:1  ${r.level.padEnd(8)} ${label(r.fg)} on ${label(r.bg)}  (${r.use})`,
    );
  }
  console.log(`\n${rows.length} pairs checked, ${failures.length} failing.`);
}

if (failures.length) process.exit(1);
