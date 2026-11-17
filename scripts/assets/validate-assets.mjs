#!/usr/bin/env node
// Validates master SVGs and derived platform assets (design-instructions §12, §16).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from '../design-tokens/lib.mjs';
import {
  ANDROID_BACKGROUND_COLOR,
  APP_BACKGROUND,
  FAVICON,
  LOGO,
  NATIVE_EXPORTS,
  RASTER_EXPORTS,
} from './asset-manifest.mjs';

const errors = [];
const ok = (msg) => console.log(`✓ ${msg}`);
const fail = (msg) => {
  errors.push(msg);
  console.error(`✗ ${msg}`);
};
const abs = (p) => join(ROOT, p);

function checkSvgSafety(file, svg) {
  if (/<image\b/i.test(svg)) fail(`${file}: embedded raster <image> is not allowed`);
  if (/(?:xlink:)?href\s*=\s*["'](?!#)/i.test(svg))
    fail(`${file}: external references are not allowed`);
  if (/<script\b|\bon[a-z]+\s*=/i.test(svg))
    fail(`${file}: scripts/event handlers are not allowed`);
  if (!/viewBox="0 0 [\d.]+ [\d.]+"/.test(svg)) fail(`${file}: missing viewBox`);
}

// 1. Logo masters.
const REQUIRED_LOGOS = [
  'ikigai-atlas-symbol.svg',
  'ikigai-atlas-symbol-on-dark.svg',
  'ikigai-atlas-symbol-monochrome.svg',
  'ikigai-atlas-symbol-dimensions.svg',
  'ikigai-atlas-wordmark.svg',
  'ikigai-atlas-wordmark-on-dark.svg',
  'ikigai-atlas-lockup-horizontal.svg',
  'ikigai-atlas-lockup-horizontal-on-dark.svg',
  'ikigai-atlas-lockup-stacked.svg',
  'ikigai-atlas-lockup-stacked-on-dark.svg',
  'ikigai-atlas-monochrome.svg',
  'ikigai-atlas-monochrome-on-light.svg',
  'ikigai-atlas-monochrome-on-dark.svg',
  'ikigai-atlas-app-icon-master.svg',
  'ikigai-atlas-app-icon-foreground.svg',
  'ikigai-atlas-splash.svg',
  'favicon.svg',
];
for (const name of REQUIRED_LOGOS) {
  if (!existsSync(abs(`${LOGO}/${name}`))) fail(`${LOGO}/${name} is missing`);
}
for (const name of readdirSync(abs(LOGO)).filter((f) => f.endsWith('.svg'))) {
  const file = `${LOGO}/${name}`;
  const svg = readFileSync(abs(file), 'utf8');
  checkSvgSafety(file, svg);
  try {
    await sharp(Buffer.from(svg)).metadata();
  } catch (e) {
    fail(`${file}: not a parseable SVG (${e.message})`);
  }
  if (
    name.includes('wordmark') ||
    name.includes('lockup') ||
    name === 'ikigai-atlas-monochrome.svg'
  ) {
    if (!/<text\b[^>]*>IKIGAI ATLAS<\/text>/.test(svg))
      fail(`${file}: wordmark must be editable <text>IKIGAI ATLAS</text>`);
  }
  if (name.includes('app-icon') || name.includes('splash')) {
    if (/<text\b/.test(svg)) fail(`${file}: app icon / splash must not contain text`);
  }
}
const appIcon = readFileSync(abs(`${LOGO}/ikigai-atlas-app-icon-master.svg`), 'utf8');
if (!appIcon.includes('viewBox="0 0 1024 1024"'))
  fail('app icon master must use a 1024×1024 viewBox');
if (!appIcon.includes(`<rect width="1024" height="1024" fill="${APP_BACKGROUND}"`))
  fail(`app icon master must have an opaque ${APP_BACKGROUND} background`);
if (!errors.length) ok(`${LOGO}: masters present, editable and self-contained`);

// 2. Derived rasters (store, web and native project assets).
for (const spec of [...RASTER_EXPORTS, ...NATIVE_EXPORTS]) {
  const width = spec.width ?? spec.size;
  const height = spec.height ?? spec.size;
  if (!existsSync(abs(spec.out))) {
    fail(`${spec.out} is missing (run npm run assets:export)`);
    continue;
  }
  const meta = await sharp(abs(spec.out)).metadata();
  const stats = await sharp(abs(spec.out)).stats();
  const problems = [];
  if (meta.format !== 'png') problems.push(`format ${meta.format}`);
  if (meta.width !== width || meta.height !== height)
    problems.push(`${meta.width}×${meta.height}, expected ${width}×${height}`);
  if (meta.space !== 'srgb') problems.push(`colour space ${meta.space}`);
  if (spec.alpha === 'none' && meta.hasAlpha) problems.push('has alpha channel');
  if (spec.alpha === 'opaque' && meta.hasAlpha && !stats.isOpaque)
    problems.push('has transparent pixels');
  if (spec.alpha === 'required' && (!meta.hasAlpha || stats.isOpaque))
    problems.push('must be transparent');
  if (spec.alpha !== 'required') {
    // Opaque exports are full-bleed on the app background; a stale export keeps an old colour in the corner.
    const data = await sharp(abs(spec.out))
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .removeAlpha()
      .raw()
      .toBuffer();
    const corner =
      `#${[...data].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
    if (corner !== APP_BACKGROUND)
      problems.push(`background ${corner}, expected ${APP_BACKGROUND} (run npm run assets:export)`);
  }
  if (problems.length) fail(`${spec.out}: ${problems.join(', ')}`);
  else ok(`${spec.out}  ${width}×${height} sRGB alpha:${spec.alpha}`);
}

const androidBackground = readFileSync(abs(ANDROID_BACKGROUND_COLOR), 'utf8');
if (!androidBackground.includes(`<color name="ic_launcher_background">${APP_BACKGROUND}</color>`))
  fail(`${ANDROID_BACKGROUND_COLOR}: ic_launcher_background must be ${APP_BACKGROUND}`);
else ok(`${ANDROID_BACKGROUND_COLOR} is ${APP_BACKGROUND}`);

// 3. Favicons.
if (readFileSync(abs(FAVICON.svgOut), 'utf8') !== readFileSync(abs(FAVICON.svgSource), 'utf8')) {
  fail(`${FAVICON.svgOut} differs from ${FAVICON.svgSource} (run npm run assets:export)`);
}
const ico = readFileSync(abs(FAVICON.icoOut));
if (ico.readUInt16LE(2) !== 1 || ico.readUInt16LE(4) !== FAVICON.icoSizes.length)
  fail(`${FAVICON.icoOut}: invalid ICO header`);
else ok(`${FAVICON.icoOut} (${FAVICON.icoSizes.join('/')}px) and ${FAVICON.svgOut}`);

if (errors.length) {
  console.error(`\n${errors.length} asset problem(s).`);
  process.exit(1);
}
console.log('\nAll brand and platform assets valid.');
