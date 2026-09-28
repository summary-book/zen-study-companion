// Report (non-blocking): passage verification status + Chinese quotations inside Thai prose
// that cannot be found in any fetched CBETA text (tools/raw). Use it to prioritise human review.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, stripText, walk } from '../tests/helpers/load-data.mjs';
import { ROOT } from './manifest.mjs';

const D = loadData();
// CBETA texts (tools/raw) + the private SAT cache (tools/raw-private) when present
const corpus = ['tools/raw', 'tools/raw-private'].map((d) => join(ROOT, d)).filter(existsSync).flatMap((rawDir) => readdirSync(rawDir).filter((f) => f.endsWith('.json')).map((f) => {
  const j = JSON.parse(readFileSync(join(rawDir, f), 'utf8'));
  if (!Array.isArray(j.juans)) return ''; // derived files (e.g. T2003-cases.json, T2003-people.json)
  return stripText(j.juans.flatMap((x) => x.blocks.map((b) => b.text)).join(''));
})).join('|');

let checked = 0; let draft = 0;
const unverified = [];
walk(D, (v, path) => {
  if (v && typeof v === 'object' && (v.zh || v.ja) && v.id && v.verify) { v.verify === 'checked' ? checked++ : draft++; return; }
  if (typeof v !== 'string') return;
  const p = path.join('.');
  if (/\.(zh|zhS|ja|pinyin|romaji|label)$/.test(p) || /\.names\./.test(p) || /^(quiz)/.test(p) || /\.title/.test(p)) return;
  for (const m of v.matchAll(/[㐀-鿿\u{20000}-\u{3134f}，。、；：？！「」]{6,}/gu)) {
    const s = stripText(m[0]);
    if (s.length >= 6 && !corpus.includes(s)) unverified.push(`${p}: ${m[0]}`);
  }
});
console.log(`Passages: ${checked} checked (verbatim CBETA) · ${draft} draft`);
console.log(`Chinese quotations (≥6 chars) in prose not found in fetched CBETA texts: ${unverified.length}`);
for (const u of unverified) console.log('  - ' + u.slice(0, 160));
