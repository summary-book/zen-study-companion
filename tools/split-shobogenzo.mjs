// Extract the selected fascicles of 正法眼藏 from the private SAT cache → tools/raw-private/T2582-chapters.json
// (PRIVATE, git-ignored — SAT data may not be redistributed; SPEC §4.1). Each chapter keeps its Taishō line ids.
import { readFileSync, writeFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('./raw-private/T2582.json', import.meta.url), 'utf8'));
const lines = raw.juans[0].blocks;
// app chapter id → Taishō fascicle title (本山版 order)
export const SELECTED = [
  ['bendowa', '辨道話'], ['maka-hannya', '摩訶般若波羅蜜'], ['genjokoan', '現成公案'], ['ikka-myoju', '一顆明珠'],
  ['sokushin-zebutsu', '即心是佛'], ['uji', '有時'], ['sansuikyo', '山水經'], ['bussho', '佛性'], ['zazenshin', '坐禪箴'],
  ['zenki', '全機'], ['katto', '葛藤'], ['zazengi', '坐禪儀'], ['shoji', '生死'], ['hachidainingaku', '八大人覺'],
];
const out = SELECTED.map(([id, title], i) => {
  const heads = lines.map((b, k) => [b, k]).filter(([b]) => b.kind === 'head' && b.text.trim().replace(/^\d*正法眼[藏蔵]/, '') === title);
  const s = heads[0][1];
  const e = heads[heads.length - 1][1];
  // body = lines between the opening and closing title; the colophon (date/place) follows the closing title
  let c = e + 1;
  while (c < lines.length && lines[c].kind !== 'head' && lines[c].text.trim() && c - e <= 4) c++;
  const body = lines.slice(s + 1, e);
  const colophon = lines.slice(e + 1, c);
  return {
    no: i + 1, id, title, start: lines[s].lb, end: lines[e].lb,
    chars: body.map((b) => b.text).join('').replace(/[\s。＊]/g, '').length,
    lines: body.map(({ lb, text, notes }) => ({ lb, text, ...(notes ? { notes } : {}) })),
    colophon: colophon.map(({ lb, text }) => ({ lb, text })),
  };
});
writeFileSync(new URL('./raw-private/T2582-chapters.json', import.meta.url), JSON.stringify({
  work: 'T2582', source: raw.source, license: raw.license, note: raw.note, fetchedAt: raw.fetchedAt, chapters: out,
}, null, 1));
for (const c of out) console.log(`${String(c.no).padStart(2)} ${c.id.padEnd(17)} ${c.title} ${c.start}–${c.end} ${c.chars} chars · colophon: ${c.colophon.map((l) => l.text.trim()).join(' / ')}`);
