// Phase 3 — 傳心法要, 臨濟錄, 金剛經, 楞伽經 (TASKS P3-*)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from '../helpers/load-data.mjs';

const D = loadData();
const T = (id) => D.texts.find((t) => t.id === id);

test('Phase 3 texts exist with the 6 required sections', () => {
  for (const id of ['chuanxin', 'linji-lu', 'diamond-sutra', 'lankavatara']) {
    const t = T(id);
    assert.ok(t, id);
    assert.ok(t.about.history.length >= 3 && t.about.author.length >= 1, `${id} about`);
    assert.ok(t.people.length >= 1 && t.keyPassages.length >= 5 && t.furtherReading.length >= 2, `${id} people/key/further`);
    for (const c of t.chapters) assert.ok(c.passages.length >= 1, `${id}/${c.id} passages`);
  }
});

test('Diamond Sūtra: 32 sections of Prince Zhaoming, in order', () => {
  const t = T('diamond-sutra');
  assert.equal(t.chapters.length, 32);
  assert.match(t.chapters[0].title.zh, /第一$/);
  assert.match(t.chapters[31].title.zh, /第三十二$/);
});

test('Record of Linji covers sermons, encounters and the biographical record', () => {
  const titles = T('linji-lu').chapters.map((c) => c.title.zh + c.title.th).join(' ');
  for (const k of ['勘辨', '行錄']) assert.ok(titles.includes(k), k);
});

test('Phase 3 quizzes ≥ 20 each and reserved glossary terms exist', () => {
  for (const s of ['chuanxin', 'linji-lu', 'diamond-sutra', 'lankavatara']) {
    assert.ok(D.quiz.filter((q) => q.scope === 'text:' + s).length >= 20, s);
  }
  for (const id of ['isshin', 'honshin', 'musho-toku', 'mui-shinjin', 'zuisho-saju', 'shiryoken', 'sangen-sanyo', 'buji', 'hinju', 'omushoju', 'shiso', 'sokuhi', 'nyoraizo', 'araya', 'jikaku-shochi', 'shutsu-settsu']) {
    assert.ok(D.glossary.some((g) => g.id === id), id);
  }
});
