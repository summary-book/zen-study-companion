import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadApp } from '../helpers/load-app.mjs';

const app = await loadApp();
const D = app.window.ZEN_DATA;
const R = app.Z.registry;

function routes() {
  const list = ['#/', '#/lineage', '#/lineage/timeline', '#/texts', '#/koans', '#/people', '#/practice', '#/practice/oxherding', '#/glossary', '#/theravada', '#/quiz', '#/search?q=無', '#/progress', '#/notes', '#/about'];
  for (const t of D.texts) { list.push(`#/texts/${t.id}`); for (const c of t.chapters) list.push(`#/texts/${t.id}/${c.id}`); }
  for (const c of D.collections) list.push(`#/koans/${c.id}`);
  for (const k of D.koans) list.push(`#/koans/${k.collection}/${k.no}`);
  for (const p of D.people) list.push(`#/people/${p.id}`);
  for (const p of D.practice) list.push(`#/practice/${p.id}`);
  for (let n = 1; n <= D.oxherding.length; n++) list.push(`#/practice/oxherding?n=${n}`);
  for (const g of D.glossary) list.push(`#/glossary/${g.id}`);
  for (const t of D.theravada) list.push(`#/theravada/${t.id}`);
  for (const s of new Set(D.quiz.map((q) => q.scope))) list.push(`#/quiz/${s}`);
  return list;
}

test('every route renders a heading without errors', async () => {
  const bad = [];
  for (const r of routes()) {
    const main = await app.go(r);
    const h1 = main.querySelector('h1');
    if (!h1 || !h1.textContent.trim() || main.textContent.includes('เกิดข้อผิดพลาดในการแสดงผล')) bad.push(r);
  }
  assert.deepEqual(bad, []);
  assert.deepEqual(app.errors.map(String), []);
});

test('unknown route shows not-found page', async () => {
  const main = await app.go('#/does/not/exist');
  assert.match(main.querySelector('h1').textContent, /ไม่พบ/);
});

test('all 7 content views are in the navigation', () => {
  const links = Array.from(app.document.querySelectorAll('.nav-main .nav-link')).map((a) => a.getAttribute('href'));
  assert.deepEqual(links, ['#/lineage', '#/texts', '#/koans', '#/people', '#/practice', '#/glossary', '#/theravada']);
});

test('rendered cross-reference links all resolve (no .ref-missing on content pages)', async () => {
  const missing = [];
  for (const r of routes()) {
    const main = await app.go(r);
    main.querySelectorAll('.ref-missing').forEach((m) => missing.push(`${r}: ${m.textContent}`));
  }
  assert.deepEqual(missing, []);
});

test('lineage tree renders every visible node; outline mode lists the full tree', async () => {
  const main = await app.go('#/lineage');
  const nodes = main.querySelectorAll('.tree-svg [data-id]');
  // chain of Indian patriarchs 2–27 is compressed into one node by default
  assert.equal(nodes.length, D.lineage.nodes.length - 26 + 1);
  assert.ok(main.querySelector('[data-id="__chain"]'));
  main.querySelector('[data-mode="outline"]').click();
  const outlineNodes = main.querySelectorAll('.outline .outline-node');
  assert.equal(outlineNodes.length, D.lineage.nodes.length - 26 + 1);
});

test('lineage: selecting a node highlights its path to the root', async () => {
  const main = await app.go('#/lineage?focus=person:linji');
  const hi = Array.from(main.querySelectorAll('.tree-svg .node-hi')).map((n) => n.dataset.id);
  for (const id of ['linji', 'huangbo', 'baizhang', 'mazu', 'nanyue', 'huineng', 'bodhidharma', 'shakyamuni']) assert.ok(hi.includes(id), id);
  assert.match(main.querySelector('.tree-detail').textContent, /臨濟/);
});

test('lineage: expanding the Indian chain shows all 28 patriarchs', async () => {
  const main = await app.go('#/lineage');
  main.querySelector('[data-id="__chain"]').dispatchEvent(new app.window.MouseEvent('click', { bubbles: true }));
  assert.equal(main.querySelectorAll('.tree-svg [data-id]').length, D.lineage.nodes.length);
});

test('text page has the 6 required sections', async () => {
  const main = await app.go('#/texts/platform-sutra');
  for (const id of ['history', 'author', 'chapters', 'key', 'people', 'further']) assert.ok(main.querySelector('#sec-' + id), id);
  assert.equal(main.querySelectorAll('.chapter-item').length, R.text.get('platform-sutra').chapters.length);
});

test('chapter reader renders passages with all four layers', async () => {
  const main = await app.go('#/texts/heart-sutra/c2');
  const p = main.querySelector('.passage');
  assert.ok(p.querySelector('.layer-zh[lang="zh-Hant"]'));
  assert.ok(p.querySelector('.layer-pinyin'));
  assert.ok(p.querySelector('.layer-romaji'));
  assert.ok(p.querySelector('.layer-th'));
});

test('layer toggles hide layers via body classes and never hide all', async () => {
  const S = app.Z.settings;
  S.set({ layers: { zh: true, pinyin: true, romaji: true, th: true } });
  const body = app.document.body;
  app.document.querySelector('.topbar .layer-btn[data-layer="pinyin"]').click();
  assert.ok(body.classList.contains('hide-pinyin'));
  assert.equal(app.document.querySelector('.topbar .layer-btn[data-layer="pinyin"]').getAttribute('aria-pressed'), 'false');
  for (const k of ['zh', 'romaji']) S.toggleLayer(k);
  assert.equal(S.toggleLayer('th'), false, 'last visible layer cannot be hidden');
  assert.ok(!body.classList.contains('hide-th'));
  S.set({ layers: { zh: true, pinyin: false, romaji: false, th: true } });
});

test('koan page separates 本則 / 無門曰 / 頌 and keeps interpretations in their own box', async () => {
  const main = await app.go('#/koans/mumonkan/1');
  const titles = Array.from(main.querySelectorAll('.koan-layer .layer-title')).map((t) => t.textContent);
  assert.match(titles[0], /本則/);
  assert.match(titles[1], /無門曰/);
  assert.match(titles[2], /頌/);
  const interp = main.querySelector('details.interp');
  assert.ok(interp, 'มุมตีความ box');
  assert.ok(!interp.open, 'collapsed by default');
  assert.equal(interp.querySelectorAll('.interp-item').length, R.koan.get('mumonkan-1').interpretations.length);
  interp.querySelectorAll('.interp-item').forEach((it) => assert.match(it.textContent, /ที่มา:/));
  assert.equal(main.querySelectorAll('.koan-layer .interp').length, 0, 'interpretation not inside text layers');
});

test('person profile shows all name systems and reverse-index mentions', async () => {
  const main = await app.go('#/people/huineng');
  const txt = main.textContent;
  for (const n of ['慧能', 'ฮุ่ยเหนิง', 'เว่ยหล่าง', 'Enō']) assert.ok(txt.includes(n), n);
  assert.ok(main.querySelector('.mention-list a[href="#/texts/platform-sutra"]'));
});

test('name mode setting changes the primary display name', async () => {
  app.Z.settings.set({ nameMode: 'thCommon' });
  let main = await app.go('#/people/huineng');
  assert.match(main.querySelector('h1').textContent, /เว่ยหล่าง/);
  app.Z.settings.set({ nameMode: 'ja' });
  main = await app.go('#/people/huineng');
  assert.match(main.querySelector('h1').textContent, /Enō/);
  app.Z.settings.set({ nameMode: 'th' });
});

test('search results link with highlight; destination highlights the term', async () => {
  let main = await app.go('#/search?q=' + encodeURIComponent('色即是空'));
  const link = main.querySelector('.result-list a');
  assert.ok(link, 'has a result');
  assert.ok(main.querySelector('.snippet mark.hl'));
  const href = link.getAttribute('href');
  assert.match(href, /hl=/);
  main = await app.go(href);
  assert.ok(main.querySelectorAll('mark.hl').length >= 1);
  assert.ok(main.querySelector('.hl-bar'));
});

test('oxherding gallery shows 10 SVG pictures', async () => {
  const main = await app.go('#/practice/oxherding');
  assert.equal(main.querySelectorAll('.ox-gallery li').length, 10);
  assert.equal(main.querySelectorAll('.ox-gallery svg').length, 10);
});

test('glossary term shows 漢字, pinyin, romaji, Thai reading', async () => {
  const main = await app.go('#/glossary/mu');
  const txt = main.querySelector('.term-hero').textContent;
  const g = R.term.get('mu');
  for (const v of [g.zh, g.pinyin, g.romaji, g.th]) assert.ok(txt.includes(v), v);
});

test('theravada page has both sides and same/diff/caution', async () => {
  const main = await app.go('#/theravada/emptiness');
  assert.ok(main.querySelector('.col-zen'));
  assert.ok(main.querySelector('.col-thera'));
  for (const c of ['cmp-same', 'cmp-diff', 'cmp-caution']) assert.ok(main.querySelector('.' + c), c);
});

test('mobile layout: reader/notes switch as tabs', async () => {
  const m = await loadApp({ width: 390 });
  await m.go('#/texts/heart-sutra/c1');
  const ws = m.document.querySelector('.workspace');
  assert.equal(ws.dataset.tab, 'read');
  const [readTab, notesTab] = m.document.querySelectorAll('.mobile-tabs .tab');
  notesTab.click();
  assert.equal(ws.dataset.tab, 'notes');
  assert.equal(notesTab.getAttribute('aria-selected'), 'true');
  readTab.click();
  assert.equal(ws.dataset.tab, 'read');
  const main = await m.go('#/lineage');
  assert.ok(!main.querySelector('.outline').hidden, 'outline mode is default on phones');
});

test('正法眼藏 chapter: Japanese quotations (lang ja, no pinyin), SAT label, Taishō line', async () => {
  const main = await app.go('#/texts/shobogenzo/genjokoan');
  assert.match(main.textContent, /ข้อความยกอ้างจากต้นฉบับ/);
  const p = main.querySelector('.passage');
  assert.equal(p.querySelector('.layer-zh').getAttribute('lang'), 'ja');
  assert.equal(p.querySelector('.layer-pinyin'), null);
  assert.ok(p.querySelector('.layer-romaji') && p.querySelector('.layer-th'));
  assert.match(p.querySelector('.passage-src').textContent, /^T2582 · p\d{4}[a-c]\d{2} · ยกอ้างตรงตาม SAT$/);
  const text = await app.go('#/texts/shobogenzo');
  assert.equal(text.querySelectorAll('.chapter-list li').length, 14);
  assert.match(text.querySelector('#sec-further').textContent, /SAT/);
});

test('從容錄 case page shows the five layers in source order; Japanese quiz scope has a Thai label', async () => {
  const main = await app.go('#/koans/shoyoroku/1');
  const titles = Array.from(main.querySelectorAll('.koan-layer .layer-title .cjk')).map((e) => e.textContent);
  assert.deepEqual(titles, ['示眾', '本則', '評唱', '頌', '評唱']);
  assert.equal(app.Z.quiz.scopeLabel('region:japan'), 'เซนญี่ปุ่น');
});
