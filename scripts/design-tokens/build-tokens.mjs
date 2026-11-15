#!/usr/bin/env node
// Generates the CSS custom properties, Sass breakpoint map and TypeScript constants
// from design/tokens/*.json. `--check` fails (exit 1) if committed output is stale.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import * as prettier from 'prettier';
import { ROOT, cssName, loadManifest, loadTokenTree, resolveValue, toCss, walk } from './lib.mjs';

const CHECK = process.argv.includes('--check');
const HEADER = [
  'GENERATED FILE - DO NOT EDIT.',
  'Source: design/tokens/*.json. Regenerate with `npm run tokens:build`.',
];

const manifest = loadManifest();
const tree = loadTokenTree(manifest);
const desktopMin = tree.breakpoint.md.$value;

const PRIMITIVE_GROUPS = Object.keys(tree).filter((g) => g !== 'semantic' && g !== 'typescale');
const TYPE_PROPS = {
  fontFamily: 'font-family',
  fontWeight: 'font-weight',
  letterSpacing: 'letter-spacing',
  fontSize: 'font-size',
  lineHeight: 'line-height',
};

function declarations(entries) {
  return entries.map(([name, value]) => `  ${name}: ${value};`).join('\n');
}

function primitiveDecls() {
  const out = [];
  for (const group of PRIMITIVE_GROUPS) {
    for (const [path, token] of walk(tree[group], [group]))
      out.push([cssName(path), toCss(token.$value)]);
  }
  return out;
}

const semanticDecls = (theme) =>
  [...walk(tree.semantic[theme])].map(([path, token]) => [cssName(path), toCss(token.$value)]);

function typescaleDecls(variant) {
  const out = [];
  for (const [name, token] of Object.entries(tree.typescale)) {
    if (name.startsWith('$')) continue;
    const { mobile, desktop, ...shared } = token.$value;
    const props = variant === 'mobile' ? { ...shared, ...mobile } : desktop;
    for (const [key, value] of Object.entries(props)) {
      if (variant === 'desktop' && value === mobile[key]) continue;
      out.push([`--typescale-${name}-${TYPE_PROPS[key]}`, toCss(value)]);
    }
  }
  return out;
}

function buildScss() {
  const desktop = typescaleDecls('desktop');
  return [
    ...HEADER.map((l) => `// ${l}`),
    '',
    ':root {',
    declarations([...primitiveDecls(), ...semanticDecls('light'), ...typescaleDecls('mobile')]),
    '}',
    '',
    `@media (min-width: ${desktopMin}) {`,
    '  :root {',
    declarations(desktop).replace(/^/gm, '  '),
    '  }',
    '}',
    '',
    "[data-theme='dark'] {",
    '  color-scheme: dark;',
    declarations(semanticDecls('dark')),
    '}',
    '',
  ].join('\n');
}

function buildBreakpointsScss() {
  const entries = Object.entries(tree.breakpoint)
    .filter(([k]) => !k.startsWith('$'))
    .map(([k, t]) => `  '${k}': ${t.$value},`);
  return [...HEADER.map((l) => `// ${l}`), '', '$breakpoints: (', ...entries, ');', ''].join('\n');
}

/** Converts a token subtree into a plain object of resolved raw values. */
function resolved(node, map = (v) => v) {
  const out = {};
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || child === null || typeof child !== 'object') continue;
    out[key] = '$value' in child ? map(resolveValue(tree, child.$value)) : resolved(child, map);
  }
  return out;
}

const px = (v) => Number.parseFloat(v);

function buildTs() {
  const dims = manifest.lifeDimensions;
  const lifeDimensionMeta = Object.fromEntries(
    dims.order.map((key) => [
      key,
      {
        apiKey: key.toUpperCase(),
        label: dims.labels[key],
        longLabel: dims.longLabels[key],
        icon: dims.icons[key],
      },
    ]),
  );
  const consts = {
    colorPrimitives: resolved(tree.color),
    semanticColors: {
      light: resolved(tree.semantic.light.color),
      dark: resolved(tree.semantic.dark.color),
    },
    statusColors: resolved(tree.semantic.light.color.status),
    breakpoints: resolved(tree.breakpoint, px),
    durations: resolved(tree.duration, px),
    easings: resolved(tree.easing),
    lifeDimensionMeta,
  };
  return [
    ...HEADER.map((l) => `// ${l}`),
    '',
    `export const LIFE_DIMENSION_KEYS = ${JSON.stringify(dims.order)} as const;`,
    '',
    'export type LifeDimensionKey = (typeof LIFE_DIMENSION_KEYS)[number];',
    '',
    ...Object.entries(consts).map(
      ([name, value]) => `export const ${name} = ${JSON.stringify(value)} as const;\n`,
    ),
  ].join('\n');
}

const outputs = {
  'src/styles/tokens/_tokens.generated.scss': buildScss(),
  'src/styles/tokens/_breakpoints.generated.scss': buildBreakpointsScss(),
  'src/app/shared/design-system/tokens.generated.ts': buildTs(),
};

if (JSON.stringify(Object.keys(outputs)) !== JSON.stringify(manifest.outputs)) {
  throw new Error('design-tokens.json "outputs" is out of sync with build-tokens.mjs');
}

let stale = 0;
for (const [file, raw] of Object.entries(outputs)) {
  const target = join(ROOT, file);
  const options = (await prettier.resolveConfig(target)) ?? {};
  const content = await prettier.format(raw, { ...options, filepath: target });
  const current = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (CHECK) {
    if (current !== content) {
      stale++;
      console.error(`✗ ${file} is stale or hand-edited`);
    } else {
      console.log(`✓ ${file}`);
    }
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`${current === content ? '=' : '✎'} ${relative(ROOT, target)}`);
}

if (stale) {
  console.error(
    `\n${stale} generated token file(s) out of date. Run \`npm run tokens:build\` and commit the result.`,
  );
  process.exit(1);
}
