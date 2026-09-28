import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadApp } from '../helpers/load-app.mjs';

const { Z, document, window } = await loadApp();
const localStorage = window.localStorage;

test('router parses params and query, encodes hrefs', () => {
  const r = Z.router.parse('#/texts/heart-sutra/c2?hl=%E7%A9%BA&p=hs-3');
  assert.equal(r.view, 'chapter');
  assert.deepEqual({ ...r.params }, { text: 'heart-sutra', chapter: 'c2' });
  assert.equal(r.query.hl, '空');
  assert.equal(r.query.p, 'hs-3');
  assert.equal(Z.router.parse('').view, 'home');
  assert.equal(Z.router.parse('#/nope/x/y/z').view, 'notfound');
  assert.equal(Z.router.href('/search', { q: 'ก ข', empty: '' }), '#/search?q=%E0%B8%81%20%E0%B8%82');
});

test('norm: case, tones, macrons, punctuation', () => {
  assert.equal(Z.util.norm('Huìnéng'), 'huineng');
  assert.equal(Z.util.norm('Enō'), 'eno');
  assert.equal(Z.util.norm('色即是空，空即是色。'), '色即是空空即是色');
  assert.equal(Z.util.norm('Thích Nhất Hạnh'), 'thichnhathanh');
});

test('dates formatting', () => {
  assert.equal(Z.util.fmtDates({ b: 638, d: 713 }), '638–713');
  assert.equal(Z.util.fmtDates({ b: 150, d: 250, approx: true }), 'ราว 150–250');
  assert.equal(Z.util.fmtYear(-400), '400 ปีก่อน ค.ศ.');
  assert.equal(Z.util.century(1228), 13);
});

test('rich text renders links and bold, never raw HTML', () => {
  const frag = Z.ui.rich('ดู [[person:huineng]] และ **ตัวหนา** <b>no</b> [[source:T2008]]');
  const div = document.createElement('div');
  div.appendChild(frag);
  assert.equal(div.querySelector('a').getAttribute('href'), '#/people/huineng');
  assert.equal(div.querySelector('strong').textContent, 'ตัวหนา');
  assert.equal(div.querySelector('b'), null);
  assert.ok(div.textContent.includes('<b>no</b>'));
  assert.ok(div.querySelector('cite'));
});

test('registry: reverse index and lineage path', () => {
  const R = Z.registry;
  const m = R.mentions.person.get('huineng').map((w) => `${w.type}:${w.id}`);
  assert.ok(m.includes('text:platform-sutra'));
  const path = R.lineagePath('huineng');
  assert.equal(path[0], 'shakyamuni');
  assert.equal(path[path.length - 1], 'huineng');
  assert.equal(path.length, 1 + 28 + 5);
  assert.ok(R.passage.size > 200);
  // generated pinyin merged into passages
  const hs = R.text.get('heart-sutra').chapters[0].passages[0];
  assert.ok(hs.pinyin && /guān/.test(hs.pinyin));
});

test('pinyin uses Buddhist readings (般若 bō rě, 禪 chán)', () => {
  const all = Array.from(Z.registry.passage.values()).map((x) => x.passage);
  const withBanruo = all.filter((p) => p.zh && p.zh.includes('般若') && p.pinyin);
  assert.ok(withBanruo.length > 0);
  for (const p of withBanruo) assert.ok(p.pinyin.includes('bō rě'), p.id + ': ' + p.pinyin);
});

test('settings: persistence and apply', () => {
  Z.settings.set({ fontSize: 'L', theme: 'dark' });
  assert.equal(document.documentElement.dataset.fontSize, 'L');
  assert.ok(document.documentElement.classList.contains('dark'));
  assert.equal(JSON.parse(localStorage.getItem('zsc:v1:settings')).fontSize, 'L');
  Z.settings.set({ fontSize: 'M', theme: 'light' });
});

test('tts splits long text into sentences', () => {
  const parts = Z.tts.split('觀自在菩薩行深般若波羅蜜多時，照見五蘊皆空。度一切苦厄。');
  assert.equal(parts.length, 2);
});
