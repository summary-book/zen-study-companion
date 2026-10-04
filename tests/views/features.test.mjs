import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadApp } from '../helpers/load-app.mjs';

const tick = () => new Promise((r) => setTimeout(r, 5));

test('notes CRUD through the notes panel, bound to the current chapter', async () => {
  const app = await loadApp();
  const { document: doc, Z } = app;
  await app.go('#/texts/heart-sutra/c1');
  const pane = doc.getElementById('notes-pane');
  assert.match(pane.querySelector('.notes-anchor').textContent, /หฤทัยสูตร/);
  // create
  pane.querySelector('input[aria-label="หัวข้อโน้ต"]').value = 'คำถามเรื่องขันธ์';
  pane.querySelector('textarea').value = 'ทำไมต้องเป็นห้า?';
  const tagInput = pane.querySelector('.tag-input');
  tagInput.value = 'ขันธ์, สุญญตา';
  tagInput.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  pane.querySelector('.note-composer .btn-primary').click();
  let notes = Z.notes.all();
  assert.equal(notes.length, 1);
  assert.equal(notes[0].anchor.type, 'chapter');
  assert.equal(notes[0].anchor.id, 'heart-sutra/c1');
  assert.deepEqual(Array.from(notes[0].tags), ['ขันธ์', 'สุญญตา']);
  assert.equal(pane.querySelectorAll('.note-card').length, 1);
  // persisted in localStorage
  assert.equal(JSON.parse(app.window.localStorage.getItem('zsc:v1:notes')).length, 1);
  // not shown on another anchor
  await app.go('#/texts/heart-sutra/c2');
  assert.equal(pane.querySelectorAll('.note-card').length, 0);
  await app.go('#/texts/heart-sutra/c1');
  // update via edit button
  pane.querySelector('.note-card button[aria-label="แก้ไขโน้ต"]').click();
  pane.querySelector('textarea').value = 'แก้แล้ว';
  pane.querySelector('.note-composer .btn-primary').click();
  notes = Z.notes.all();
  assert.equal(notes.length, 1);
  assert.equal(notes[0].body, 'แก้แล้ว');
  // delete (with confirm dialog)
  pane.querySelector('.note-card button[aria-label="ลบโน้ต"]').click();
  await tick();
  doc.querySelector('.modal .btn-danger').click();
  await tick();
  assert.equal(Z.notes.all().length, 0);
});

test('notes: search, tag filter and model validation', async () => {
  const { Z } = await loadApp();
  Z.notes.create({ title: 'ลม ธง', body: 'ไม่ใช่ลมไหว', tags: ['風幡'], kind: 'insight', anchor: { type: 'chapter', id: 'platform-sutra/c1', label: 'x' } });
  Z.notes.create({ title: 'อื่น', body: 'อะไรก็ได้', tags: ['#ทั่วไป', 'ทั่วไป'], kind: 'bogus' });
  assert.equal(Z.notes.search({ q: 'ลมไหว' }).length, 1);
  assert.equal(Z.notes.search({ tag: '風幡' }).length, 1);
  assert.equal(Z.notes.search({ kind: 'insight' }).length, 1);
  const other = Z.notes.search({ q: 'อื่น' })[0];
  assert.deepEqual(Array.from(other.tags), ['ทั่วไป'], 'tags de-duplicated and # stripped');
  assert.equal(other.kind, 'general', 'invalid kind falls back');
  assert.deepEqual(Array.from(Z.notes.allTags()).sort(), ['ทั่วไป', '風幡'].sort());
});

test('export → import round-trip (merge and replace) + invalid files rejected', async () => {
  const a = await loadApp();
  a.Z.notes.create({ title: 'หนึ่ง', body: 'ก', tags: ['x'], anchor: { type: 'text', id: 'heart-sutra', label: 'หฤทัยสูตร' } });
  a.Z.progress.setRead('chapter:heart-sutra/c1', true);
  const payload = a.Z.io.exportData({ progress: true, quiz: true });
  assert.equal(payload.app, 'zen-study-companion');
  const json = JSON.stringify(payload);

  const b = await loadApp();
  b.Z.notes.create({ title: 'ของเดิม', body: 'ข' });
  const v = b.Z.io.validate(json);
  assert.ok(v.ok, v.errors.join());
  b.Z.io.apply(v.data, 'merge', { progress: true });
  assert.equal(b.Z.notes.all().length, 2);
  assert.ok(b.Z.progress.isRead('chapter:heart-sutra/c1'));
  b.Z.io.apply(v.data, 'replace', {});
  assert.equal(b.Z.notes.all().length, 1);
  assert.equal(b.Z.notes.all()[0].title, 'หนึ่ง');

  assert.equal(b.Z.io.validate('not json').ok, false);
  assert.equal(b.Z.io.validate(JSON.stringify({ app: 'other', schemaVersion: 1, notes: [] })).ok, false);
  const bad = b.Z.io.validate(JSON.stringify({ app: 'zen-study-companion', schemaVersion: 1, notes: [{ id: '<script>', body: 'x' }, { id: 'ok-1', body: '<img src=x onerror=alert(1)>' }] }));
  assert.equal(bad.data.notes.length, 1, 'bad id skipped');
  // markup is rendered as text, never HTML
  b.Z.io.apply(bad.data, 'replace', {});
  await b.go('#/notes');
  assert.equal(b.document.querySelectorAll('#main img').length, 0);
  assert.ok(b.document.getElementById('main').textContent.includes('<img src=x onerror=alert(1)>'));
});

test('app keeps working when localStorage throws, and warns the user', async () => {
  const app = await loadApp({ storage: 'throw' });
  await app.go('#/texts/heart-sutra/c1');
  assert.ok(app.document.querySelector('h1'));
  assert.equal(app.document.getElementById('storage-warning').hidden, false);
  app.Z.notes.create({ title: 'ชั่วคราว', body: 'อยู่ในหน่วยความจำ' });
  assert.equal(app.Z.notes.all().length, 1, 'memory fallback keeps notes for the session');
  assert.deepEqual(app.errors.map(String), []);
});

test('corrupt JSON in storage is backed up and does not crash', async () => {
  const app = await loadApp({ preload: { 'zsc:v1:notes': '{broken' } });
  assert.equal(app.Z.notes.all().length, 0);
  const keys = Object.keys(app.window.localStorage);
  assert.ok(keys.some((k) => k.startsWith('zsc:v1:corrupt-notes-')));
});

test('quiz: 10 random unique questions, immediate feedback, history saved', async () => {
  const app = await loadApp();
  const { Z, document: doc } = app;
  const s1 = Z.quiz.start('lineage', Z.quiz.seeded(1));
  const s2 = Z.quiz.start('lineage', Z.quiz.seeded(2));
  assert.equal(s1.questions.length, 10);
  assert.equal(new Set(s1.questions.map((q) => q.id)).size, 10);
  assert.notDeepEqual(s1.questions.map((q) => q.id), s2.questions.map((q) => q.id));
  for (const q of s1.questions.filter((x) => x.type === 'mcq')) {
    const orig = Z.registry.D.quiz.find((x) => x.id === q.id);
    assert.equal(q.choices[q.answer], orig.choices[orig.answer], 'answer re-indexed after shuffle');
  }
  // UI flow
  const main = await app.go('#/quiz/text:heart-sutra');
  for (let i = 0; i < 10; i++) {
    const choice = main.querySelector('.choice:not(:disabled)') || null;
    if (choice) choice.click();
    else { main.querySelectorAll('select').forEach((s) => { s.value = s.options[1].value; }); main.querySelector('.match .btn-primary').click(); }
    assert.ok(main.querySelector('.quiz-feedback').textContent.length > 0, 'feedback shown immediately');
    main.querySelector('.quiz-q .row-end .btn-primary').click();
  }
  assert.match(main.querySelector('.quiz-summary h2').textContent, /ได้ \d+ \/ 10/);
  const hist = Z.quiz.history();
  assert.equal(hist.length, 1);
  assert.equal(hist[0].scope, 'text:heart-sutra');
  assert.equal(hist[0].total, 10);
  const home = await app.go('#/quiz');
  assert.ok(home.querySelector('.hist-table'));
});

test('quiz check logic for tf and match', async () => {
  const { Z } = await loadApp();
  assert.equal(Z.quiz.check({ type: 'tf', answer: true }, true).correct, true);
  assert.equal(Z.quiz.check({ type: 'tf', answer: true }, false).correct, false);
  const m = { type: 'match', pairs: [['a', '1'], ['b', '2'], ['c', '3']] };
  assert.equal(Z.quiz.check(m, ['1', '2', '3']).correct, true);
  assert.equal(Z.quiz.check(m, ['2', '1', '3']).correct, false);
});

test('progress: mark read per chapter and % per text', async () => {
  const app = await loadApp();
  const { Z } = app;
  const t = Z.registry.text.get('xinxinming');
  assert.equal(Z.progress.textStats(t).pct, 0);
  const main = await app.go(`#/texts/xinxinming/${t.chapters[0].id}`);
  main.querySelector('.read-toggle').click();
  assert.ok(Z.progress.isRead(`chapter:xinxinming/${t.chapters[0].id}`));
  assert.equal(Z.progress.textStats(t).done, 1);
  assert.equal(Z.progress.textStats(t).pct, Math.round(100 / t.chapters.length));
  main.querySelector('.read-toggle').click();
  assert.equal(Z.progress.textStats(t).done, 0);
  // koans: percent of the whole collection
  Z.progress.setRead('koan:mumonkan-1', true);
  assert.equal(Z.progress.collectionStats(Z.registry.collection.get('mumonkan')).pct, Math.round(100 / 48));
  const pg = await app.go('#/progress');
  assert.ok(pg.querySelectorAll('.progress-row').length >= 4);
  assert.equal(Z.progress.getLast().route, `/texts/xinxinming/${t.chapters[0].id}`);
});

test('search finds a person by every name system', async () => {
  const { Z } = await loadApp();
  for (const q of ['เว่ยหล่าง', 'ฮุ่ยเหนิง', 'Enō', 'eno', '慧能', 'huineng', 'Huìnéng', '惠能'.slice(0, 0) || 'hui neng']) {
    const groups = Z.search.query(q);
    const people = groups.find((g) => g.type === 'person');
    assert.ok(people && people.items.some((i) => i.id === 'huineng'), `query ${q}`);
  }
  // simplified → traditional mapping for characters present in the data
  const g = Z.search.query('赵州');
  assert.ok(g.find((x) => x.type === 'person').items.some((i) => i.id === 'zhaozhou'));
  // glossary, texts, passages
  assert.ok(Z.search.query('無').some((x) => x.type === 'term'));
  assert.ok(Z.search.query('本來無一物').some((x) => x.type === 'passage'));
  assert.equal(Z.search.query('   ').length, 0);
});

test('read-aloud speaks the chosen language at the chosen rate', async () => {
  const app = await loadApp();
  const { Z, window } = app;
  await app.go('#/texts/heart-sutra/c1');
  const bar = app.document.getElementById('tts-bar');
  assert.equal(bar.hidden, false);
  const langs = Array.from(bar.querySelectorAll('.tts-langs button')).map((b) => b.textContent);
  assert.deepEqual(langs, ['ไทย', '中文']);
  Z.settings.set({ ttsRate: 1.5 });
  bar.querySelectorAll('.tts-langs button')[1].click();
  bar.querySelector('.btn-primary').click();
  await tick();
  const spoken = window.speechSynthesis.spoken;
  assert.ok(spoken.length > 0);
  assert.equal(spoken[0].lang, 'zh-CN');
  assert.equal(spoken[0].rate, 1.5);
  Z.tts.stop();
  // per-passage read button: original then Thai paraphrase
  window.speechSynthesis.spoken.length = 0;
  app.document.querySelector('#main .passage .passage-speak').click();
  await tick();
  const langs2 = window.speechSynthesis.spoken.map((x) => x.lang);
  assert.equal(langs2[0], 'zh-CN');
  assert.ok(langs2.includes('th-TH'));
  // speed buttons step through 0.75–2x and are clamped
  Z.settings.set({ ttsRate: 1 });
  app.document.querySelector('.topbar .rate-faster').click();
  assert.equal(Z.settings.get().ttsRate, 1.25);
  assert.equal(app.document.querySelector('.topbar .rate-value').textContent, '1.25x');
  for (let i = 0; i < 6; i++) app.document.querySelector('.topbar .rate-faster').click();
  assert.equal(Z.settings.get().ttsRate, 2);
  assert.equal(app.document.querySelector('.topbar .rate-faster').disabled, true);
  for (let i = 0; i < 6; i++) Z.tts.step(-1);
  assert.equal(Z.settings.get().ttsRate, 0.75);
  assert.equal(app.document.querySelector('.topbar .rate-slower').disabled, true);
  // changing speed while playing restarts the current sentence at the new rate
  Z.settings.set({ ttsRate: 1 });
  window.speechSynthesis.spoken.length = 0;
  Z.tts.play([{ text: 'หนึ่ง สอง', lang: 'th' }]);
  Z.tts.step(1);
  assert.equal(window.speechSynthesis.spoken[window.speechSynthesis.spoken.length - 1].rate, 1.25);
  Z.tts.stop();
  // no Thai voice → play disabled with explanation
  const noTh = await loadApp({ voices: ['en-US'] });
  await noTh.go('#/texts/heart-sutra/c1');
  const b2 = noTh.document.getElementById('tts-bar');
  assert.equal(b2.querySelector('.btn-primary').disabled, true);
  assert.match(b2.querySelector('.tts-msg').textContent, /ไม่พบเสียง/);
});

test('read-aloud marks the phrase being spoken and the current word', async () => {
  const app = await loadApp();
  const { Z, window } = app;
  // CSS Custom Highlight API mock (jsdom has none)
  window.Highlight = function (range) { this.range = range; };
  window.CSS.highlights = new Map();
  // a speech mock that reports one word boundary and then waits
  let last = null;
  window.speechSynthesis.speak = (u) => { last = u; };
  const main = await app.go('#/texts/heart-sutra/c1');
  const p = main.querySelector('.passage');
  Z.tts.playPassage(p);
  const zh = p.querySelector('.layer-zh').textContent;
  const phrase = window.CSS.highlights.get('tts-phrase');
  assert.ok(phrase, 'phrase highlight set');
  assert.equal(phrase.range.toString(), last.text);
  assert.ok(zh.includes(last.text));
  assert.equal(window.CSS.highlights.has('tts-word'), false);
  last.onboundary({ name: 'word', charIndex: 2, charLength: 2 });
  assert.equal(window.CSS.highlights.get('tts-word').range.toString(), last.text.slice(2, 4));
  last.onend(); // next phrase
  assert.equal(window.CSS.highlights.get('tts-phrase').range.toString(), last.text);
  Z.tts.stop();
  assert.equal(window.CSS.highlights.size, 0);
});
