// Split tools/raw/T2003.json (碧巖錄) into 100 cases → tools/raw/T2003-cases.json
// Each case: intro (垂示), case (本則), commentary (評唱 on the case), verse (頌), commentary2 (評唱 on the verse).
// Parenthesised text in the raw file = small double-line notes in CBETA = Yuanwu's capping phrases (著語).
// `clean` fields drop those notes (the app shows 本則/頌 without 著語 — SPEC Q3).
import { readFileSync, writeFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('./raw/T2003.json', import.meta.url), 'utf8'));
// CBETA numbers the cases with positional digits: 一 … 九, 一〇, 一一 … 九九, 一〇〇
const DIGIT = { '〇': 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
function cn2int(s) {
  let n = 0;
  for (const ch of s) {
    if (!(ch in DIGIT)) return NaN;
    n = n * 10 + DIGIT[ch];
  }
  return n;
}
const notes = (t) => (t.match(/\([^)]*\)/g) || []).length;
// Pronunciation glosses printed as a separate cell, e.g. "皖(戶版切明貌)", "蚍蜉(音毘浮)": the glossed
// characters belong to the commentary, not to the verse — drop them (only when standing alone).
// A gloss headword stands alone: after the start, a space or the end of a 著語 ")"; the note is 音… or a
// fanqie (two characters + 切, or "AB CD 二切" for two readings) — so words like 一切 inside 著語 never match.
const GLOSS = /(^|\s|\))[^\s()。，、]{1,2}\((?:音[^)]*|(?:[^)]{2}|[^)]{4}二)切[^)]*)\)(?=\s|$|。)/g;
const clean = (t) => t.replace(GLOSS, '$1').replace(/\([^)]*\)/g, '');

const blocks = raw.juans.flatMap((j) => j.blocks.map((b) => ({ ...b, juan: j.juan })));
const noteChars = (t) => (t.match(/\([^)]*\)/g) || []).join('').length;
// A block belongs to 本則/頌 when it is a verse row or dense with 著語; 評唱 blocks are long prose with
// at most occasional editorial notes (e.g. "(本是代宗此誤)").
const dense = (b) => b.kind === 'verse' || (notes(b.text) >= 1 && noteChars(b.text) / b.text.length >= 0.15);
// fanqie pronunciation glosses such as "𣽅(古活切水流聲)" are kept aside
const isGloss = (b) => !clean(b.text).replace(/[\s。]/g, '').length;
const cases = [];
const extras = []; // colophons / appendices printed between juans or after case 100
const glosses = [];
let pendingIntro = null;
let cur = null;
for (const b of blocks) {
  if (b.kind === 'head') {
    // end of a fascicle or an appended document closes the current case
    if (/終/.test(b.text) || !/碧巖錄卷第/.test(b.text)) cur = null;
    if (!/碧巖錄卷第/.test(b.text)) extras.push({ lb: b.lb, head: b.text });
    continue;
  }
  if (/^師住澧州夾山靈泉禪院/.test(b.text) || /^No\. 2003/.test(b.text)) continue;
  if (/^垂示云/.test(b.text)) { pendingIntro = b; continue; }
  const m = /^【([〇一二三四五六七八九]+)】/.exec(b.text);
  if (m) {
    cur = { no: cn2int(m[1]), juan: b.juan, intro: pendingIntro ? [pendingIntro] : [], case: [b], commentary: [], verse: [], commentary2: [] };
    pendingIntro = null;
    cases.push(cur);
    continue;
  }
  if (!cur) { extras.push({ lb: b.lb, text: b.text }); continue; }
  if (isGloss(b)) { glosses.push({ no: cur.no, lb: b.lb, text: b.text }); continue; }
  const d = dense(b);
  if (!cur.commentary.length && !cur.verse.length && d) cur.case.push(b);
  else if (!cur.verse.length && !d) cur.commentary.push(b);
  else if (d && cur.commentary.length) {
    // a second/third verse after the verse commentary (e.g. case 20 復成一頌, case 96 three verses)
    if (cur.commentary2.length) cur.extraVerse = (cur.extraVerse || 0) + 1;
    cur.verse.push(b);
  } else cur.commentary2.push(b);
}

const out = cases.map((c) => {
  const layer = (arr) => arr.map((b) => ({ lb: b.lb, text: b.text, clean: clean(b.text).replace(/\s+/g, ' ').trim() }));
  return {
    no: c.no,
    juan: c.juan,
    intro: layer(c.intro),
    case: layer(c.case),
    commentary: layer(c.commentary),
    verse: layer(c.verse),
    commentary2: layer(c.commentary2),
    ...(c.extraVerse ? { multiVerse: true } : {}),
  };
});

// sanity report
const probs = [];
out.forEach((c, i) => {
  if (c.no !== i + 1) probs.push(`numbering at index ${i}: ${c.no}`);
  for (const k of ['case', 'commentary', 'verse', 'commentary2']) if (!c[k].length) probs.push(`case ${c.no}: empty ${k}`);
});
writeFileSync(new URL('./raw/T2003-cases.json', import.meta.url), JSON.stringify({
  work: 'T2003', source: raw.source, url: raw.url, license: raw.license, fetchedAt: raw.fetchedAt,
  note: 'Split by tools/split-hekigan.mjs. "clean" = text without the parenthesised small notes (著語).',
  cases: out,
  glosses,
  extras,
}, null, 1));
console.log(`multi-verse cases: ${out.filter((c) => c.multiVerse).map((c) => c.no).join(',') || 'none'}`);
console.log(`cases: ${out.length} · no 垂示: ${out.filter((c) => !c.intro.length).map((c) => c.no).join(',')}`);
console.log(probs.length ? 'PROBLEMS:\n' + probs.join('\n') : 'structure OK');
