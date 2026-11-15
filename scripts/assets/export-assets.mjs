#!/usr/bin/env node
// Rasterises the master SVGs into platform assets (see asset-manifest.mjs and design/ASSET_EXPORTS.md).
// Master SVGs are never modified; outputs are fully derived and reproducible.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { ROOT } from '../design-tokens/lib.mjs';
import { APP_BACKGROUND, FAVICON, RASTER_EXPORTS } from './asset-manifest.mjs';

const abs = (p) => join(ROOT, p);

/** Renders an SVG at exactly `size`×`size` px, rasterising at the target density (no upscaling blur). */
async function renderSvg(source, size) {
  const svg = readFileSync(abs(source));
  const { width } = await sharp(svg).metadata();
  return sharp(svg, { density: (72 * size) / width }).resize(size, size, { fit: 'fill' });
}

async function exportOne(spec) {
  let img = spec.solid
    ? sharp({
        create: { width: spec.size, height: spec.size, channels: 3, background: spec.solid },
      })
    : await renderSvg(spec.source, spec.size);
  if (spec.alpha === 'none') img = img.flatten({ background: APP_BACKGROUND }).removeAlpha();
  if (spec.alpha === 'opaque') img = img.flatten({ background: APP_BACKGROUND }).ensureAlpha(1);
  mkdirSync(dirname(abs(spec.out)), { recursive: true });
  await img
    .toColourspace('srgb')
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(abs(spec.out));
  console.log(`✎ ${spec.out}  ${spec.size}×${spec.size}  alpha:${spec.alpha}`);
}

/** Builds a PNG-compressed ICO (supported by all current browsers). */
async function exportIco() {
  const images = await Promise.all(
    FAVICON.icoSizes.map(async (s) => (await renderSvg(FAVICON.svgSource, s)).png().toBuffer()),
  );
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((png, i) => {
    const s = FAVICON.icoSizes[i];
    const e = 6 + 16 * i;
    header.writeUInt8(s >= 256 ? 0 : s, e);
    header.writeUInt8(s >= 256 ? 0 : s, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  writeFileSync(abs(FAVICON.icoOut), Buffer.concat([header, ...images]));
  console.log(`✎ ${FAVICON.icoOut}  ${FAVICON.icoSizes.join('/')}px`);
}

for (const spec of RASTER_EXPORTS) await exportOne(spec);
copyFileSync(abs(FAVICON.svgSource), abs(FAVICON.svgOut));
console.log(`✎ ${FAVICON.svgOut}  (copy of ${FAVICON.svgSource})`);
await exportIco();
console.log(
  `\nsharp ${sharp.versions.sharp}, libvips ${sharp.versions.vips}, librsvg ${sharp.versions.rsvg ?? 'bundled'}`,
);
