// Shared helpers for the IKIGAI ATLAS design token pipeline.
// Token format: W3C DTCG draft ($value/$type/$description), `{a.b.c}` references,
// `DEFAULT` keys collapse into the parent name.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TOKENS_DIR = join(ROOT, 'design', 'tokens');

const REF = /^\{([^}]+)\}$/;

export function loadManifest() {
  return JSON.parse(readFileSync(join(TOKENS_DIR, 'design-tokens.json'), 'utf8'));
}

/** Deep-merges every token group file listed in the manifest into one tree. */
export function loadTokenTree(manifest = loadManifest()) {
  const tree = {};
  for (const file of manifest.files) {
    const data = JSON.parse(readFileSync(join(TOKENS_DIR, file), 'utf8'));
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('$')) continue;
      if (key in tree)
        throw new Error(`Top-level token group "${key}" is defined in more than one file`);
      tree[key] = value;
    }
  }
  return tree;
}

export const isToken = (node) => node !== null && typeof node === 'object' && '$value' in node;

/** Yields [pathSegments, token] for every token below `node`. */
export function* walk(node, path = []) {
  if (isToken(node)) {
    yield [path, node];
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || child === null || typeof child !== 'object') continue;
    yield* walk(child, [...path, key]);
  }
}

export const cssName = (path) => `--${path.filter((s) => s !== 'DEFAULT').join('-')}`;

export function lookup(tree, refPath) {
  let node = tree;
  for (const segment of refPath.split('.')) {
    node = node?.[segment];
    if (node === undefined) throw new Error(`Unresolvable token reference {${refPath}}`);
  }
  if (!isToken(node) && node && isToken(node.DEFAULT)) node = node.DEFAULT;
  if (!isToken(node)) throw new Error(`Reference {${refPath}} does not point at a token`);
  return node;
}

export const refOf = (value) => (typeof value === 'string' ? value.match(REF)?.[1] : undefined);

/** Resolves a token value to its final raw value (follows reference chains). */
export function resolveValue(tree, value, seen = new Set()) {
  const ref = refOf(value);
  if (!ref) return value;
  if (seen.has(ref)) throw new Error(`Circular token reference {${ref}}`);
  seen.add(ref);
  return resolveValue(tree, lookup(tree, ref).$value, seen);
}

/** Turns a value into CSS: references become var(--…), numbers stay unitless. */
export function toCss(value, { tree, theme } = {}) {
  const ref = refOf(value);
  if (!ref) return String(value);
  const path = ref.split('.');
  // Semantic tokens are emitted without their `semantic.<theme>` prefix (`--color-…`), so a reference to
  // another semantic token of the same theme points at that variable; other themes are inlined.
  if (path[0] === 'semantic') {
    if (path[1] === theme) return `var(${cssName(path.slice(2))})`;
    if (!tree) throw new Error(`Cannot emit cross-theme reference {${ref}} without the token tree`);
    return String(resolveValue(tree, value));
  }
  return `var(${cssName(path)})`;
}

// WCAG 2.x relative luminance / contrast ratio.
function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Expected #RRGGBB color, got ${hex}`);
  const n = parseInt(m[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
