// Phase 4 — 碧巖錄 100 cases (TASKS P4-*)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, stripText } from '../helpers/load-data.mjs';
import { ROOT } from '../../tools/manifest.mjs';

const D = loadData();
const bc = D.koans.filter((k) => k.collection === 'hekiganroku').sort((a, b) => a.no - b.no);
const RAW = JSON.parse(readFileSync(join(ROOT, 'tools/raw/T2003-cases.json'), 'utf8')).cases;
const rawOf = (no) => RAW.find((c) => c.no === no);
const join2 = (arr) => stripText(arr.map((b) => b.clean).join(''));
const joinP = (arr) => stripText((arr || []).map((p) => p.zh).join(''));

test('碧巖錄 has all 100 cases, numbered 1–100', () => {
  assert.deepEqual(bc.map((k) => k.no), Array.from({ length: 100 }, (_, i) => i + 1));
});

test('本則 and 頌 are complete (著語 omitted) and 垂示 is present when the text has one', () => {
  const problems = [];
  for (const k of bc) {
    const r = rawOf(k.no);
    const caseRaw = join2(r.case).replace(/^【[〇一二三四五六七八九]+】/, '');
    const caseData = joinP(k.layers.case);
    if (Math.abs(caseRaw.length - caseData.length) > 2 || !caseRaw.includes(caseData.slice(0, 8))) problems.push(`${k.id} 本則: ${caseData.length}/${caseRaw.length} chars`);
    const verseRaw = join2(r.verse);
    const verseData = joinP(k.layers.verse);
    if (Math.abs(verseRaw.length - verseData.length) > 2) problems.push(`${k.id} 頌: ${verseData.length}/${verseRaw.length} chars`);
    if (r.intro.length) {
      const introRaw = join2(r.intro);
      const introData = joinP(k.layers.intro);
      if (Math.abs(introRaw.length - introData.length) > 2) problems.push(`${k.id} 垂示: ${introData.length}/${introRaw.length} chars`);
    } else if ((k.layers.intro || []).length) problems.push(`${k.id}: has 垂示 but the text has none`);
    for (const p of [...k.layers.case, ...k.layers.verse]) if (!p.notesOmitted) problems.push(`${k.id}/${p.id}: set notesOmitted`);
  }
  assert.deepEqual(problems, []);
});

test('評唱: Thai summaries for both commentaries + verbatim excerpts taken from the right section', () => {
  const problems = [];
  for (const k of bc) {
    const r = rawOf(k.no);
    for (const l of ['commentary', 'commentary2']) {
      if (!r[l].length) continue;
      const s = (k.summaries || {})[l];
      if (!s || !s.length) problems.push(`${k.id}: summaries.${l} missing`);
      const sec = stripText(r[l].map((b) => b.text).join(''));
      for (const p of k.layers[l] || []) if (!sec.includes(stripText(p.zh))) problems.push(`${k.id}/${p.id}: excerpt not from ${l}`);
    }
    if (!(k.layers.commentary || []).length && !(k.layers.commentary2 || []).length) problems.push(`${k.id}: no 評唱 excerpt`);
  }
  assert.deepEqual(problems, []);
});

test('titles are conventional names built from the case text; Thai everywhere; interpretations', () => {
  for (const k of bc) {
    const text = joinP(k.layers.case);
    const missing = Array.from(k.title.zh).filter((ch) => !text.includes(ch) && !'問之大師和尚云'.includes(ch));
    assert.ok(missing.length <= 1, `${k.id} title ${k.title.zh}: ${missing.join('')}`);
    for (const p of Object.values(k.layers).flat()) assert.ok(p.th && p.th.length > 3, `${k.id}/${p.id} th`);
    assert.ok(k.title.th && k.people.length && k.interpretations.length >= 1, `${k.id} title.th/people/interpretations`);
  }
});

test('Blue Cliff quiz ≥ 60', () => {
  assert.ok(D.quiz.filter((q) => q.scope === 'collection:hekiganroku').length >= 60);
});
