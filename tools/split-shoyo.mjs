// Split tools/raw/T2004.json (從容錄) into 100 cases → tools/raw/T2004-cases.json
// Each case: title (from the heading 第N則…), intro (示眾), case (本則 舉…), commentary (師云 on the case),
// verse (頌 of Hongzhi), commentary2 (師云 on the verse).
// Parenthesised text in the raw file = small double-line notes = Wansong's capping phrases (著語);
// `clean` fields drop them (the app shows 本則/頌 without 著語 — SPEC Q3).
import { readFileSync, writeFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('./raw/T2004.json', import.meta.url), 'utf8'));
// Case headings use ordinary numerals: 第一則, 第十則, 第二十一則, 第百則 (則 is sometimes missing)
const NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
function cn2int(s) {
  if (s === '百') return 100;
  let n = 0;
  let cur = 0;
  for (const ch of s) {
    if (ch === '十') { n += (cur || 1) * 10; cur = 0; } else if (ch in NUM) cur = NUM[ch]; else return NaN;
  }
  return n + cur;
}
const notes = (t) => (t.match(/\([^)]*\)/g) || []).length;
const noteChars = (t) => (t.match(/\([^)]*\)/g) || []).join('').length;
// pronunciation glosses such as "皖(戶版切)" or "蚍蜉(音毘浮)" standing alone (same rule as split-hekigan.mjs)
const GLOSS = /(^|\s|\))[^\s()。，、]{1,2}\((?:音[^)]*|(?:[^)]{2}|[^)]{4}二)切[^)]*)\)(?=\s|$|。)/g;
const clean = (t) => t.replace(GLOSS, '$1').replace(/\([^)]*\)/g, '');
// verse rows are either marked as verse or dense with 著語 (case 99's verse is printed as prose)
const versey = (b) => b.kind === 'verse' || (notes(b.text) >= 2 && noteChars(b.text) / b.text.length >= 0.15);

const blocks = raw.juans.flatMap((j) => j.blocks.map((b) => ({ ...b, juan: j.juan })));
const cases = [];
const extras = [];
let cur = null;
for (const b of blocks) {
  if (b.kind === 'head') {
    const m = /^第([一二三四五六七八九十百]+)則?(.+)$/.exec(b.text);
    if (m) {
      cur = { no: cn2int(m[1]), juan: b.juan, title: m[2].trim(), head: b.lb, intro: [], case: [], commentary: [], verse: [], commentary2: [], state: 'start', anomalies: [] };
      cases.push(cur);
    } else {
      cur = null;
      extras.push({ lb: b.lb, head: b.text });
    }
    continue;
  }
  if (!cur) { extras.push({ lb: b.lb, text: b.text }); continue; }
  const t = b.text;
  // Wansong's commentary usually opens with 師云 but may open with 師舉 (he cites another story) or with no
  // marker at all (cases 33, 77) — so the layers follow the shape of the blocks: 本則 and 頌 are dense with 著語,
  // 評唱 is prose.
  switch (cur.state) {
    case 'start':
      if (/^示眾云/.test(t)) cur.intro.push(b);
      else if (/^舉/.test(t)) { cur.case.push(b); cur.state = 'case'; } else cur.anomalies.push(`unexpected before 舉: ${b.lb}`);
      break;
    case 'case':
      // a 本則 continued on a second block is as dense as the first (≈0.4); commentary quoting a verse with notes is not
      if (!/^師[云舉]/.test(t) && versey(b) && noteChars(t) / t.length >= 0.3) cur.case.push(b);
      else { cur.commentary.push(b); cur.state = 'comm'; }
      break;
    case 'comm':
      if (versey(b)) { cur.verse.push(b); cur.state = 'verse'; } else cur.commentary.push(b);
      break;
    case 'verse':
      // "師復云。險" right after the verse of case 38 is Hongzhi's own closing word (so in 宏智廣錄 T2001) — keep it
      // with the verse, like the closing words of 雪竇 after his verses in the 碧巖錄
      if (versey(b) || (/^師復云/.test(t) && clean(t).length <= 12)) cur.verse.push(b);
      else { cur.commentary2.push(b); cur.state = 'comm2'; }
      break;
    case 'comm2':
      if (versey(b)) cur.anomalies.push(`verse-like block after verse commentary: ${b.lb}`);
      cur.commentary2.push(b);
      break;
    default:
      break;
  }
}

const layer = (arr) => arr.map((b) => ({ lb: b.lb, text: b.text, clean: clean(b.text).replace(/\s+/g, ' ').trim() }));
const out = cases.map((c) => ({
  no: c.no,
  juan: c.juan,
  title: c.title,
  head: c.head,
  intro: layer(c.intro),
  case: layer(c.case),
  commentary: layer(c.commentary),
  verse: layer(c.verse),
  commentary2: layer(c.commentary2),
  ...(c.anomalies.length ? { anomalies: c.anomalies } : {}),
}));

const probs = [];
out.forEach((c, i) => {
  if (c.no !== i + 1) probs.push(`numbering at index ${i}: ${c.no}`);
  for (const k of ['intro', 'case', 'commentary', 'verse', 'commentary2']) if (!c[k].length) probs.push(`case ${c.no}: empty ${k}`);
  for (const a of c.anomalies || []) probs.push(`case ${c.no}: ${a}`);
});
writeFileSync(new URL('./raw/T2004-cases.json', import.meta.url), JSON.stringify({
  work: 'T2004', source: raw.source, url: raw.url, license: raw.license, fetchedAt: raw.fetchedAt,
  note: 'Split by tools/split-shoyo.mjs. "clean" = text without the parenthesised small notes (著語). "title" = the heading in the source (第N則…).',
  cases: out,
  extras,
}, null, 1));
console.log(`cases: ${out.length} · 師舉 cases: ${out.filter((c) => /^師舉/.test(c.case[0]?.text || '')).map((c) => c.no).join(',')}`);
console.log(probs.length ? 'PROBLEMS:\n' + probs.join('\n') : 'structure OK');
