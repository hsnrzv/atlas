// Licence allow-list for the shipped dependency tree (F2-11, DEPENDENCY-LICENSE-MATRIX §1).
// Reads package-lock.json, so it needs no extra tool: every package that is not dev-only must declare a licence
// (SPDX id or expression) from the "Allowed" class. "Allowed with conditions" and unknown licences fail until they are
// reviewed and listed in EXCEPTIONS with the reason. Usage: node scripts/check-licenses.mjs [package-lock.json]
import { readFileSync } from 'node:fs';
import { argv } from 'node:process';

// An optional path lets the self-test point at a fixture lockfile.
const lockPath = argv[2] ?? new URL('../package-lock.json', import.meta.url);
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));

// DEPENDENCY-LICENSE-MATRIX §1, class "Allowed" (EDL-1.0 is Java-only and omitted).
const ALLOWED = new Set([
  'MIT',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'PostgreSQL',
  'OFL-1.1',
  'CC0-1.0',
]);

// Reviewed packages whose licence is outside ALLOWED: `package-name` → reason (with the matrix or ADR reference).
const EXCEPTIONS = new Map();

/** Whether an SPDX expression is allowed: `OR` needs one allowed side, `AND` needs both. */
function allowed(expression) {
  const text = expression.trim().replace(/^\((.*)\)$/, '$1');
  const or = text.split(/\s+OR\s+/i);
  if (or.length > 1) return or.some(allowed);
  const and = text.split(/\s+AND\s+/i);
  if (and.length > 1) return and.every(allowed);
  return ALLOWED.has(text);
}

function licenceOf(entry) {
  const { license } = entry;
  if (typeof license === 'string') return license;
  if (license && typeof license.type === 'string') return license.type;
  return null;
}

const failures = [];
let checked = 0;
for (const [path, entry] of Object.entries(lock.packages ?? {})) {
  // The root project, dev-only packages and workspace links are not shipped.
  if (path === '' || entry.dev || entry.link) continue;
  checked++;
  const name = path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);
  const licence = licenceOf(entry);
  if (EXCEPTIONS.has(name)) continue;
  if (!licence) failures.push(`${name}@${entry.version}: no licence in package-lock.json`);
  else if (!allowed(licence)) failures.push(`${name}@${entry.version}: ${licence}`);
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} shipped packages are outside the licence allow-list:`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    '  Review per docs/architecture/DEPENDENCY-LICENSE-MATRIX.md §1 before adding an exception.',
  );
  process.exit(1);
}
console.log(`✓ ${checked} shipped packages, all on the licence allow-list`);
