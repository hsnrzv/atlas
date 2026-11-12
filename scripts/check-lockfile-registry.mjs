// Fails when package-lock.json resolves packages from anything other than the public npm registry.
// Keeps the lockfile portable for CI and Docker builds (a developer's private mirror stays usable
// locally because npm's default `replace-registry-host=npmjs` rewrites registry.npmjs.org URLs).
import { readFileSync } from 'node:fs';

const ALLOWED = 'https://registry.npmjs.org/';
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));

const offenders = Object.entries(lock.packages ?? {})
  .filter(([, meta]) => typeof meta.resolved === 'string' && !meta.resolved.startsWith(ALLOWED))
  .map(([path, meta]) => `${path || '(root)'} → ${new URL(meta.resolved).host}`);

if (offenders.length > 0) {
  console.error(`✗ ${offenders.length} lockfile entries resolve outside ${ALLOWED}:`);
  for (const line of offenders.slice(0, 20)) console.error(`  ${line}`);
  console.error(
    `\nRewrite them: sed -i.bak 's#https://<mirror-prefix>/#${ALLOWED}#g' package-lock.json`,
  );
  process.exit(1);
}
console.log(`✓ package-lock.json resolves only from ${ALLOWED}`);
