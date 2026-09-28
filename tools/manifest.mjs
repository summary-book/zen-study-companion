// Shared file ordering for build.mjs and tests.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

function walk(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (name.endsWith(ext)) out.push(p);
  }
  return out;
}

/** Data files: _init.js first, then everything else alphabetically (order inside does not matter). */
export function dataFiles() {
  const dir = join(ROOT, 'src/data');
  const all = walk(dir, '.js');
  const init = join(dir, '_init.js');
  return [init, ...all.filter((f) => f !== init)];
}

/** App files: core (_ns first), data, features, ui, views, then main.js last. */
export function appFiles() {
  const base = join(ROOT, 'src/app');
  const order = ['core', 'data', 'features', 'ui', 'views'];
  const files = [];
  for (const d of order) {
    const list = walk(join(base, d), '.js');
    list.sort((a, b) => (a.endsWith('_ns.js') ? -1 : b.endsWith('_ns.js') ? 1 : a.localeCompare(b)));
    files.push(...list);
  }
  files.push(join(base, 'main.js'));
  return files;
}

export function svgFiles() {
  return walk(join(ROOT, 'src/svg'), '.svg');
}

export const rel = (p) => relative(ROOT, p);
