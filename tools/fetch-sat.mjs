// Fetch Japanese-canon works (Taishō vols. 56–84, not in CBETA) from the SAT Daizōkyō Text Database
// → tools/raw-private/<work>.json (same shape as tools/raw/*.json so the verbatim tests can use it).
//
// SAT terms of use (https://21dzk.l.u-tokyo.ac.jp/SAT/termsofuse.html, checked 2026-09-28): academic / non-commercial
// use only; redistribution of the data is prohibited for now; quotation (引用) is allowed with attribution.
// So this cache is PRIVATE: it is git-ignored, never inlined into the app, and only used to verify quoted passages.
//
// Usage: node tools/fetch-sat.mjs T2582 T2580
import { writeFileSync, mkdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const BASE = 'https://21dzk.l.u-tokyo.ac.jp/SAT/ddb-sat2.php?mode=detail&useid=';
const OUT = new URL('./raw-private/', import.meta.url);
const TITLES = { T2582: '正法眼藏', T2580: '普勸坐禪儀' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url);
    if (res.ok) return res.text();
    await sleep(3000);
  }
  throw new Error(`HTTP error for ${url}`);
}

/** Lines of one response page: [{ lb: '0022a05', text, notes: [...] }] (only lines of `work`). */
function parse(html, work) {
  const doc = new JSDOM(html).window.document;
  const num = work.slice(1);
  const lines = [];
  for (const a of doc.querySelectorAll('a[name]')) {
    if (!/^\d{4}[a-c]\d{2}$/.test(a.getAttribute('name'))) continue;
    const label = a.previousElementSibling && a.previousElementSibling.textContent;
    if (!label || !label.startsWith(`T${num}_.`)) continue;
    // collation notes are <button title="…">n</button> inside the line — keep them aside, drop the marker
    const notes = [...a.querySelectorAll('button')].map((b) => b.getAttribute('title')).filter(Boolean);
    a.querySelectorAll('button').forEach((b) => b.remove());
    lines.push({ lb: a.getAttribute('name'), text: a.textContent.replace(/\s+$/, ''), ...(notes.length ? { notes } : {}) });
  }
  return lines;
}

async function fetchWork(work) {
  const id = `${work.slice(1)}_`;
  const seen = new Map();
  let html = await get(BASE + id);
  let page = null;
  for (let round = 0; round < 200; round++) {
    const lines = parse(html, work);
    const fresh = lines.filter((l) => !seen.has(l.lb));
    if (!fresh.length) break;
    for (const l of fresh) seen.set(l.lb, l);
    const last = Number(lines[lines.length - 1].lb.slice(0, 4));
    process.stdout.write(`\r${work}: ${seen.size} lines (to p.${last})`);
    if (page !== null && last <= page) break;
    page = last;
    await sleep(1500); // be gentle with the SAT server
    html = await get(`${BASE}${id},00,${String(last + 1).padStart(4, '0')}&nonum=&kaeri=`);
  }
  const blocks = [...seen.values()].sort((a, b) => a.lb.localeCompare(b.lb)).map((l) => ({
    lb: l.lb,
    // chapter title lines ("正法眼藏現成公案") open and close each fascicle
    kind: /^\s*\d*正法眼[藏蔵]/.test(l.text) && l.text.trim().length <= 24 ? 'head' : 'line',
    text: l.text,
    ...(l.notes ? { notes: l.notes } : {}),
  }));
  console.log(`\r${work}: ${blocks.length} lines, ${blocks.filter((b) => b.kind === 'head').length} title lines`);
  return {
    work,
    title: TITLES[work] || work,
    source: 'SAT大正新脩大藏經テキストデータベース (SAT Daizōkyō Text Database, University of Tokyo)',
    url: BASE + id,
    license: 'SAT terms of use (2008-04-01): academic / non-commercial use; redistribution prohibited; quotation (引用) with attribution allowed — https://21dzk.l.u-tokyo.ac.jp/SAT/termsofuse.html',
    note: 'PRIVATE verification cache — git-ignored, never published or inlined (SPEC §4.1). Line ids are Taishō page/column/line of vol. 82.',
    fetchedAt: new Date().toISOString(),
    juans: [{ juan: 1, blocks }],
  };
}

mkdirSync(OUT, { recursive: true });
const works = process.argv.slice(2);
if (!works.length) {
  console.error('usage: node tools/fetch-sat.mjs T2582 [T2580 …]');
  process.exit(1);
}
for (const w of works) {
  const data = await fetchWork(w);
  writeFileSync(new URL(`${w}.json`, OUT), JSON.stringify(data, null, 1));
}
