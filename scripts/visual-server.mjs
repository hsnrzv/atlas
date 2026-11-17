// Starts or stops the Linux Playwright browser server that renders visual-regression screenshots, so baselines
// are identical on every developer machine and in CI. Uses ATLAS_CONTAINER_ENGINE when set, otherwise podman when
// installed, otherwise docker.
//   node scripts/visual-server.mjs start | stop
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const NAME = 'atlas-visual';
const PORT = '3000';
const { version } = createRequire(import.meta.url)('@playwright/test/package.json');
const IMAGE = `mcr.microsoft.com/playwright:v${version}-noble`;

function engine() {
  if (process.env['ATLAS_CONTAINER_ENGINE']) {
    return process.env['ATLAS_CONTAINER_ENGINE'];
  }
  for (const candidate of ['podman', 'docker']) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      // Try the next container engine.
    }
  }
  throw new Error('Visual tests need podman or docker to run the Linux browser server.');
}

async function waitUntilReady() {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('The Playwright browser server did not start within 3 minutes.');
}

const command = process.argv[2];
const run = (args) => execFileSync(engine(), args, { stdio: 'inherit' });

if (command === 'start') {
  run([
    'run',
    '--detach',
    '--rm',
    '--init',
    '--name',
    NAME,
    '--shm-size=2g',
    '--publish',
    `${PORT}:${PORT}`,
    IMAGE,
    '/bin/sh',
    '-c',
    `npx -y playwright@${version} run-server --port ${PORT} --host 0.0.0.0`,
  ]);
  console.log(
    `Playwright ${version} browser server: ws://127.0.0.1:${PORT}/ (stop with npm run e2e:visual:stop)`,
  );
} else if (command === 'stop') {
  run(['stop', NAME]);
} else {
  console.error('Usage: node scripts/visual-server.mjs start|stop');
  process.exit(1);
}
