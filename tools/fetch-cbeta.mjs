// Fetch primary texts from the CBETA API and store them as plain JSON in tools/raw/.
// License of the CBETA digital edition: CC BY-NC-SA 4.0 (https://cbeta.org/copyright, checked 2026-09-27).
// The raw files are kept in the repo so tests can verify that every passage marked
// `verify: "checked"` matches the CBETA text verbatim.
import { writeFileSync, mkdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const API = 'https://cbdata.dila.edu.tw/stable';
const WORKS = process.argv.slice(2).length ? process.argv.slice(2) : ['T0251', 'T2010', 'T2008'];
const OUT = new URL('./raw/', import.meta.url);
mkdirSync(OUT, { recursive: true });

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function parseJuan(html) {
  const { document } = new JSDOM(html).window;
  document.querySelectorAll('.footnote, .noteAnchor, .lineInfo, .facsimile').forEach((n) => n.remove());
  const blocks = [];
  let lb = null;
  let cur = null;
  const flush = () => {
    if (cur && cur.text.trim()) blocks.push({ ...cur, text: cur.text.replace(/\s+/g, ' ').trim() });
    cur = null;
  };
  const BLOCK = new Set(['P', 'DIV']);
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        if (!cur) cur = { lb, kind: 'p', text: '' };
        cur.text += child.nodeValue;
        continue;
      }
      if (child.nodeType !== 1) continue;
      const cls = child.className || '';
      if (cls === 'lb') { lb = child.id; continue; }
      if (child.classList.contains('lg-row') || child.classList.contains('head') || (child.tagName === 'P')) {
        flush();
        cur = { lb, kind: child.classList.contains('head') || child.classList.contains('juan') ? 'head' : child.classList.contains('lg-row') ? 'verse' : 'p', text: '' };
        walk(child);
        flush();
        continue;
      }
      if (child.classList.contains('lg-cell')) { walk(child); if (cur) cur.text += ' '; continue; }
      if (child.tagName === 'SMALL') { if (!cur) cur = { lb, kind: 'p', text: '' }; cur.text += '('; walk(child); cur.text += ')'; continue; }
      if (BLOCK.has(child.tagName)) { flush(); walk(child); flush(); continue; }
      walk(child);
    }
  };
  walk(document.getElementById('body') || document.body);
  flush();
  return blocks;
}

for (const work of WORKS) {
  const meta = (await getJson(`${API}/works?work=${work}`)).results[0];
  const juans = [];
  for (let j = 1; j <= meta.juan; j++) {
    const data = await getJson(`${API}/juans?work=${work}&juan=${j}`);
    juans.push({ juan: j, blocks: parseJuan(data.results[0]) });
  }
  const out = {
    work,
    title: meta.title,
    byline: meta.byline,
    file: meta.file,
    source: `CBETA ${meta.file}`,
    url: `https://cbetaonline.dila.edu.tw/zh/${meta.file}`,
    license: 'CC BY-NC-SA 4.0 — CBETA 電子佛典集成 (https://cbeta.org/copyright)',
    fetchedAt: new Date().toISOString().slice(0, 10),
    juans,
  };
  writeFileSync(new URL(`${work}.json`, OUT), JSON.stringify(out, null, 1));
  console.log(work, meta.title, juans.reduce((a, j) => a + j.blocks.length, 0), 'blocks');
}
