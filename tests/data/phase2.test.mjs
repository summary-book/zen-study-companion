// Phase 2 — 無門關 complete (TASKS P2-08)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData, rawText, stripText } from '../helpers/load-data.mjs';

const D = loadData();
const mk = D.koans.filter((k) => k.collection === 'mumonkan').sort((a, b) => a.no - b.no);

test('無門關 has all 48 cases, numbered 1–48', () => {
  assert.deepEqual(mk.map((k) => k.no), Array.from({ length: 48 }, (_, i) => i + 1));
});

test('every case has 本則, 無門曰 and 頌, verbatim from T2005', () => {
  for (const k of mk) {
    for (const l of ['case', 'commentary', 'verse']) assert.ok(k.layers[l] && k.layers[l].length, `${k.id} ${l}`);
    assert.ok(k.layers.commentary[0].zh.startsWith('無門曰'), `${k.id}: commentary starts with 無門曰`);
    for (const p of Object.values(k.layers).flat()) assert.equal(p.verify, 'checked', `${k.id}/${p.id}`);
  }
});

test('case titles match the T2005 headings', () => {
  const raw = rawText('T2005');
  for (const k of mk) assert.ok(raw.includes(stripText(k.title.zh)), `${k.id} title ${k.title.zh}`);
});

test('each case: Thai paraphrase everywhere, ≥ 1 sourced interpretation, people', () => {
  for (const k of mk) {
    for (const p of Object.values(k.layers).flat()) assert.ok(p.th && p.th.length > 3, `${k.id}/${p.id} th`);
    assert.ok(k.interpretations.length >= 1, `${k.id} interpretations`);
    assert.ok(k.people.length >= 1, `${k.id} people`);
    assert.ok(k.title.th, `${k.id} title.th`);
  }
});

test('the three layers together cover the whole case text in T2005 (nothing skipped)', () => {
  const raw = rawText('T2005');
  for (let i = 0; i < mk.length; i++) {
    const k = mk[i];
    const joined = stripText(Object.values(k.layers).flat().map((p) => p.zh).join(''));
    const start = raw.indexOf(stripText(k.layers.case[0].zh));
    const next = i + 1 < mk.length ? raw.indexOf(stripText(mk[i + 1].title.zh), start) : raw.indexOf('從上佛祖垂示機緣', start) // Wumen's afterword follows case 48;
    const segment = raw.slice(start, next).replace(/頌曰/g, '');
    const missing = segment.length - joined.replace(/頌曰/g, '').length;
    assert.ok(missing <= 2, `${k.id}: ${missing} characters of the case not covered by passages`);
  }
});

test('Mumonkan quiz ≥ 40', () => {
  assert.ok(D.quiz.filter((q) => q.scope === 'collection:mumonkan').length >= 40);
});
