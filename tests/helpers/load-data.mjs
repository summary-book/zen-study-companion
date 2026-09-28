// Load src/data/*.js into a sandbox and return ZEN_DATA (no DOM needed).
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { join } from 'node:path';
import { dataFiles, svgFiles, ROOT } from '../../tools/manifest.mjs';

export function loadData() {
  const window = {};
  const ctx = vm.createContext({ window });
  for (const f of dataFiles()) {
    vm.runInContext(`var ZEN_DATA = window.ZEN_DATA;\n${readFileSync(f, 'utf8')}`, ctx, { filename: f });
  }
  // JSON round-trip: plain data only, and avoids cross-realm prototype mismatches in deepStrictEqual
  const D = JSON.parse(JSON.stringify(window.ZEN_DATA));
  // same merge as src/app/data/registry.js
  for (const p of D.people) if (D.bios && D.bios[p.id]) Object.assign(p, D.bios[p.id]);
  // same merge as src/app/data/registry.js: chapters kept in their own files
  for (const t of D.texts) {
    const mine = (D.chapters || []).filter((c) => c.text === t.id).map(({ text, ...c }) => c);
    if (mine.length) t.chapters = t.chapters.concat(mine).sort((a, b) => a.no - b.no);
  }
  D.chapters = [];
  for (const f of svgFiles()) {
    const id = f.split('/').slice(-2).join('-').replace(/\.svg$/, '').replace(/^oxherding-/, 'ox-');
    D.svg[id] = true;
  }
  return D;
}

const rawCache = {};
const rawCleanCache = {};
/** Raw file of a work: tools/raw (CBETA, publishable) or tools/raw-private (SAT cache, git-ignored — SPEC §4.1). */
export function rawPath(work) {
  for (const dir of ['tools/raw', 'tools/raw-private']) {
    const p = join(ROOT, dir, `${work}.json`);
    if (existsSync(p)) return p;
  }
  return null;
}
/** Like rawText() but with CBETA small notes "(…)" (e.g. 著語) removed first. */
export function rawTextClean(work) {
  if (!(work in rawCleanCache)) {
    const p = rawPath(work);
    if (!p) return (rawCleanCache[work] = null);
    const j = JSON.parse(readFileSync(p, 'utf8'));
    rawCleanCache[work] = stripText(j.juans.flatMap((x) => x.blocks.map((b) => b.text.replace(/\([^)]*\)/g, ''))).join(''));
  }
  return rawCleanCache[work];
}
/** Plain CBETA text of a work with punctuation and whitespace stripped (for verbatim checks). */
export function rawText(work) {
  if (!(work in rawCache)) {
    const p = rawPath(work);
    if (!p) return (rawCache[work] = null);
    const j = JSON.parse(readFileSync(p, 'utf8'));
    rawCache[work] = stripText(j.juans.flatMap((x) => x.blocks.map((b) => b.text)).join(''));
  }
  return rawCache[work];
}

export function stripText(s) {
  return String(s).replace(/[\s　，。、；：？！「」『』（）《》〈〉·・,.;:?!"'()\[\]{}\-–—…＊*]/g, '');
}

/** Visit every value in an object tree. cb(value, path) */
export function walk(obj, cb, path = []) {
  cb(obj, path);
  if (Array.isArray(obj)) obj.forEach((v, i) => walk(v, cb, [...path, i]));
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) walk(v, cb, [...path, k]);
}
