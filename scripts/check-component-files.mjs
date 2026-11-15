// Every Angular component is four sibling files: name.ts (templateUrl + styleUrl), name.html, name.scss and
// name.spec.ts. ESLint (component-max-inline-declarations) forbids inline templates and styles; this script checks
// that the files exist and that the component points at its own template and stylesheet.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');

function* typescriptFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* typescriptFiles(path);
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts') && !name.endsWith('.d.ts'))
      yield path;
  }
}

const problems = [];
let components = 0;

for (const file of typescriptFiles(src)) {
  const source = readFileSync(file, 'utf8');
  if (!/@Component\s*\(/.test(source)) continue;
  components++;
  const base = basename(file, '.ts');
  const dir = dirname(file);
  const where = relative(root, file);

  if (!source.includes(`templateUrl: './${base}.html'`)) {
    problems.push(`${where}: use templateUrl: './${base}.html'`);
  }
  if (!source.includes(`styleUrl: './${base}.scss'`)) {
    problems.push(`${where}: use styleUrl: './${base}.scss'`);
  }
  for (const extension of ['html', 'scss', 'spec.ts']) {
    if (!existsSync(join(dir, `${base}.${extension}`))) {
      problems.push(`${where}: missing ${base}.${extension}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Component file structure: ${problems.length} problem(s)\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(
  `Component file structure: ${components} components, each with .ts, .html, .scss and .spec.ts.`,
);
