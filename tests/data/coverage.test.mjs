// Phase 1 content minimums (SPEC §5, §12, TASKS P1-G*)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from '../helpers/load-data.mjs';

const D = loadData();

test('Phase 1 texts: Heart Sūtra, 信心銘, 六祖壇經', () => {
  const ids = D.texts.map((t) => t.id);
  for (const id of ['heart-sutra', 'xinxinming', 'platform-sutra']) assert.ok(ids.includes(id), id);
  assert.equal(D.texts.find((t) => t.id === 'platform-sutra').chapters.length, 10, 'Zongbao edition has 10 chapters');
});

test('信心銘 is complete (146 lines incl. the Taishō small-note line)', () => {
  const t = D.texts.find((x) => x.id === 'xinxinming');
  const chars = t.chapters.flatMap((c) => c.passages).map((p) => p.zh.replace(/\([^)]*\)/g, '').replace(/[\s，。]/g, '')).join('');
  // Traditional count: 146 lines / 584 chars. Taishō prints 一念萬年 (萬年一念) as a small note,
  // so its main text is 145 lines = 580 chars, plus the note.
  assert.equal(chars.length, 580);
  assert.ok(t.chapters.flatMap((c) => c.passages).some((p) => p.zh.includes('(一念萬年萬年一念)')));
});

test('Heart Sūtra body is complete (觀自在菩薩 … 莎婆訶)', () => {
  const t = D.texts.find((x) => x.id === 'heart-sutra');
  const all = t.chapters.flatMap((c) => c.passages).map((p) => p.zh).join('');
  assert.ok(all.startsWith('觀自在菩薩'));
  assert.ok(/莎婆訶/.test(all));
});

test('content minimums', () => {
  assert.ok(D.glossary.length >= 40, 'glossary ≥ 40');
  assert.ok(D.theravada.length >= 5, 'theravada ≥ 5');
  assert.ok(D.timeline.length >= 40, 'timeline ≥ 40');
  assert.equal(D.oxherding.length, 10, '10 ox-herding pictures');
  assert.ok(D.people.filter((p) => p.bio && p.bio.length).length >= 12, '≥ 12 full profiles');
  const q = (s) => D.quiz.filter((x) => x.scope === s).length;
  assert.ok(q('text:heart-sutra') >= 20 && q('text:xinxinming') >= 20 && q('text:platform-sutra') >= 25 && q('lineage') >= 30);
  assert.ok(D.quiz.length >= 95);
  for (const id of ['zazen', 'shikantaza', 'kanhua', 'mokusho', 'oxherding']) assert.ok(D.practice.some((p) => p.id === id), id);
});
