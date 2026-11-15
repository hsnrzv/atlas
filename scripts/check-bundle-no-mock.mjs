// Fails when a build contains the dev-only mock data (frontend.md §6.2, PLAN-FRONTEND F2-2).
// Run after `ng build` (production). Usage: node scripts/check-bundle-no-mock.mjs [distDir]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = process.argv[2] ?? join(root, 'dist/atlas-frontend/browser');

// The sentinel exported by core/data-access/mock/sentinel.ts and the sample Destination title (both apostrophes,
// and the escaped form a minifier may emit).
const FORBIDDEN = [
  'ATLAS_MOCK_SENTINEL',
  'online Master’s degree in Computer Science',
  "online Master's degree in Computer Science",
  'online Master\\u2019s degree in Computer Science',
];
const SCANNED = /\.(?:js|mjs|html|css|json|txt|map)$/;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (SCANNED.test(name)) yield path;
  }
}

let scanned = 0;
try {
  statSync(dist);
} catch {
  console.error(`✗ ${dist} does not exist; run the production build first.`);
  process.exit(1);
}

const hits = [];
for (const file of files(dist)) {
  scanned++;
  const content = readFileSync(file, 'utf8');
  for (const needle of FORBIDDEN) {
    if (content.includes(needle)) hits.push(`${relative(root, file)} contains "${needle}"`);
  }
}

if (hits.length > 0) {
  console.error(`✗ The build contains mock data (${hits.length} hits):`);
  for (const hit of hits) console.error(`  ${hit}`);
  process.exit(1);
}
console.log(`✓ No mock data in ${relative(root, dist) || dist} (${scanned} files scanned)`);
