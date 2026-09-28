// Phase 5 — 從容錄 100 cases · 正法眼藏 (selected fascicles, quoted from SAT) · Japanese Zen (TASKS P5-*)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, stripText } from '../helpers/load-data.mjs';
import { ROOT } from '../../tools/manifest.mjs';

const D = loadData();
const PRIMARY = new Set(D.sources.filter((s) => s.kind === 'primary').map((s) => s.id));
const glossary = new Set(D.glossary.map((g) => g.id));

// ── 從容錄 ───────────────────────────────────────────────────────
const sy = D.koans.filter((k) => k.collection === 'shoyoroku').sort((a, b) => a.no - b.no);
const RAW = JSON.parse(readFileSync(join(ROOT, 'tools/raw/T2004-cases.json'), 'utf8')).cases;
const rawOf = (no) => RAW.find((c) => c.no === no);
const joinClean = (arr) => stripText(arr.map((b) => b.clean).join(''));
const joinP = (arr) => stripText((arr || []).map((p) => p.zh).join(''));

test('從容錄 has all 100 cases, with the titles printed in the source', () => {
  assert.deepEqual(sy.map((k) => k.no), Array.from({ length: 100 }, (_, i) => i + 1));
  for (const k of sy) assert.equal(k.title.zh, rawOf(k.no).title, `${k.id} title`);
});

test('從容錄 示眾 / 本則 / 頌 are complete and in order (著語 omitted); speakers are right', () => {
  const problems = [];
  for (const k of sy) {
    const r = rawOf(k.no);
    for (const [l, name] of [['intro', '示眾'], ['case', '本則'], ['verse', '頌']]) {
      const raw = joinClean(r[l]);
      const data = joinP(k.layers[l]);
      if (Math.abs(raw.length - data.length) > 2 || !raw.startsWith(data.slice(0, 6))) problems.push(`${k.id} ${name}: ${data.length}/${raw.length} chars`);
    }
    for (const p of [...(k.layers.case || []), ...(k.layers.verse || [])]) if (!p.notesOmitted) problems.push(`${k.id}/${p.id}: set notesOmitted`);
    for (const p of k.layers.verse || []) if (p.speaker !== 'hongzhi') problems.push(`${k.id}/${p.id}: 頌 speaker must be hongzhi`);
    for (const l of ['intro', 'commentary', 'commentary2']) {
      for (const p of k.layers[l] || []) if (p.layer !== 'commentary' || p.speaker !== 'wansong') problems.push(`${k.id}/${p.id}: ${l} = layer commentary, speaker wansong`);
    }
  }
  assert.deepEqual(problems, []);
});

test('從容錄 評唱: Thai summaries for both commentaries + verbatim excerpts from the right section', () => {
  const problems = [];
  for (const k of sy) {
    const r = rawOf(k.no);
    for (const l of ['commentary', 'commentary2']) {
      const s = (k.summaries || {})[l];
      if (!s || !s.length) problems.push(`${k.id}: summaries.${l} missing`);
      const sec = stripText(r[l].map((b) => b.text).join(''));
      for (const p of k.layers[l] || []) if (!sec.includes(stripText(p.zh))) problems.push(`${k.id}/${p.id}: excerpt not from ${l}`);
    }
    if (!(k.layers.commentary || []).length && !(k.layers.commentary2 || []).length) problems.push(`${k.id}: no 評唱 excerpt`);
  }
  assert.deepEqual(problems, []);
});

test('從容錄: Thai on every passage, people from the case map, ≥ 2 interpretations (one from a primary text)', () => {
  const map = JSON.parse(readFileSync(join(ROOT, 'tools/raw/T2004-people.json'), 'utf8'));
  const people = new Set(D.people.map((p) => p.id));
  for (const [no, ids] of Object.entries(map)) for (const id of ids) assert.ok(people.has(id), `T2004-people.json case ${no}: unknown person ${id}`);
  for (const k of sy) {
    for (const p of Object.values(k.layers).flat()) assert.ok(p.th && p.th.length > 3, `${k.id}/${p.id} th`);
    assert.ok(k.title.th, `${k.id} title.th`);
    for (const id of map[String(k.no)] || []) assert.ok(k.people.includes(id), `${k.id}: people should include ${id}`);
    assert.ok(k.interpretations.length >= 2, `${k.id}: ≥ 2 interpretations`);
    assert.ok(k.interpretations.some((it) => PRIMARY.has(it.sourceId)), `${k.id}: one interpretation grounded in a primary text`);
  }
});

test('從容錄 quiz ≥ 60, glossary', () => {
  assert.ok(D.quiz.filter((q) => q.scope === 'collection:shoyoroku').length >= 60);
  for (const id of ['jishu', 'ego', 'kugo-izen', 'sanjin']) assert.ok(glossary.has(id), `term ${id}`);
});

// ── 正法眼藏 ─────────────────────────────────────────────────────
const SBG = D.texts.find((t) => t.id === 'shobogenzo');
const CH = [
  ['bendowa', '辨道話'], ['maka-hannya', '摩訶般若波羅蜜'], ['genjokoan', '現成公案'], ['ikka-myoju', '一顆明珠'],
  ['sokushin-zebutsu', '即心是佛'], ['uji', '有時'], ['sansuikyo', '山水經'], ['bussho', '佛性'], ['zazenshin', '坐禪箴'],
  ['zenki', '全機'], ['katto', '葛藤'], ['zazengi', '坐禪儀'], ['shoji', '生死'], ['hachidainingaku', '八大人覺'],
];
const PRIV = join(ROOT, 'tools/raw-private/T2582-chapters.json');

test('正法眼藏: 14 selected fascicles; every passage = Japanese original + romaji (wabun) + Thai', () => {
  assert.ok(SBG, 'text shobogenzo');
  assert.equal(SBG.lang, 'ja');
  assert.equal(SBG.sourceId, 'T2582');
  assert.deepEqual(SBG.chapters.map((c) => c.id), CH.map(([id]) => id));
  SBG.chapters.forEach((c, i) => {
    assert.equal(c.no, i + 1, `${c.id} no`);
    assert.equal(c.title.zh, CH[i][1], `${c.id} title.zh`);
    assert.ok(c.title.th, `${c.id} title.th`);
    assert.ok(c.summary.filter((b) => typeof b === 'string' && !b.startsWith('## ')).length >= 2, `${c.id}: summary ≥ 2 paragraphs`);
    assert.ok(c.passages.length >= 3, `${c.id}: ≥ 3 passages`);
    for (const p of c.passages) {
      assert.ok(p.ja && !p.zh, `${p.id}: ja`);
      assert.ok(p.romaji && p.romajiKind === 'wabun', `${p.id}: romaji (wabun)`);
      assert.ok(p.th && p.th.length > 5, `${p.id}: th`);
      assert.match(p.src, /^T2582:\d{4}[a-c]\d{2}$/, `${p.id}: src`);
      assert.equal(p.verify, 'checked', `${p.id}: verify`);
      assert.ok(!/＊/.test(p.ja), `${p.id}: drop the ＊ collation markers`);
    }
  });
});

test('正法眼藏 passages: from the right fascicle and line, within the SAT quotation policy (SPEC §4.1)', (t) => {
  if (!existsSync(PRIV)) { t.skip('tools/raw-private/T2582-chapters.json missing — run tools/fetch-sat.mjs T2582 and tools/split-shobogenzo.mjs'); return; }
  const chapters = JSON.parse(readFileSync(PRIV, 'utf8')).chapters;
  const problems = [];
  let total = 0;
  for (const c of SBG.chapters) {
    const r = chapters.find((x) => x.id === c.id);
    const lines = [...r.lines, ...r.colophon];
    let quoted = 0;
    for (const p of c.passages) {
      const s = stripText(p.ja);
      const lb = p.src.split(':')[1];
      const i = lines.findIndex((l) => l.lb === lb);
      if (i < 0) { problems.push(`${p.id}: line ${lb} is not in ${c.title.zh} (${r.start}–${r.end})`); continue; }
      const from = stripText(lines.slice(i).map((l) => l.text).join(''));
      const at = from.indexOf(s);
      if (at < 0) problems.push(`${p.id}: text not found in ${c.title.zh} from ${lb}`);
      else if (at >= stripText(lines[i].text).length) problems.push(`${p.id}: quotation does not start on line ${lb}`);
      if (s.length > 160) problems.push(`${p.id}: quotation too long (${s.length} > 160 chars)`);
      quoted += s.length;
    }
    if (quoted > 0.25 * r.chars) problems.push(`${c.id}: quoted ${quoted} of ${r.chars} chars (> 25%)`);
    const thai = c.summary.filter((b) => typeof b === 'string').join('').length;
    if (thai < quoted) problems.push(`${c.id}: Thai summary (${thai}) shorter than the quoted text (${quoted}) — the quotation must stay subordinate`);
    total += quoted;
  }
  if (total > 15000) problems.push(`total quoted ${total} chars > 15000`);
  assert.deepEqual(problems, []);
});

test('正法眼藏 shell: history/author, people, further reading, key passages; quiz ≥ 25; glossary', () => {
  assert.ok(SBG.about.history.length >= 3 && SBG.about.author.length >= 2, 'about');
  for (const id of ['dogen', 'rujing', 'ejo']) assert.ok(SBG.people.includes(id), `people ${id}`);
  assert.ok(SBG.furtherReading.length >= 5, 'furtherReading');
  const pids = new Set(SBG.chapters.flatMap((c) => c.passages.map((p) => p.id)));
  assert.ok((SBG.keyPassages || []).length >= 5, 'keyPassages');
  for (const id of SBG.keyPassages) assert.ok(pids.has(id), `keyPassage ${id}`);
  assert.ok(D.quiz.filter((q) => q.scope === 'text:shobogenzo').length >= 25);
  for (const id of ['genjokoan', 'shusho-itto', 'jijuyu-zanmai', 'honsho-myoshu', 'uji', 'hishiryo', 'zenki', 'shitsuu-bussho', 'shoji', 'hachidainingaku']) assert.ok(glossary.has(id), `term ${id}`);
});

// ── Japanese Zen ─────────────────────────────────────────────────
const FULL = {
  soto: ['dogen', 'ejo', 'gikai', 'keizan', 'jakuen', 'gasan-joseki', 'meiho', 'gesshu', 'manzan', 'menzan', 'gento', 'kokusen', 'ryokan', 'shosan'],
  rinzai: ['eisai', 'enni', 'kakushin', 'nanpo', 'daito', 'kanzan', 'lanxi', 'wuxue', 'yishan', 'koho', 'muso', 'bassui', 'kaso', 'ikkyu'],
  edo: ['hakuin', 'ingen', 'takuan', 'gudo', 'shido-bunan', 'shoju', 'bankei', 'torei', 'gasan-jito', 'inzan', 'takuju', 'sengai', 'muan', 'jifei', 'tetsugen'],
};

test('Japanese Zen: full profiles with sources and a place in the lineage tree', () => {
  const nodes = new Set(D.lineage.nodes.map((n) => n.id));
  const problems = [];
  for (const id of Object.values(FULL).flat()) {
    const p = D.people.find((x) => x.id === id);
    if (!p) { problems.push(`person ${id} missing`); continue; }
    const paras = (p.bio || []).filter((b) => typeof b === 'string' && !b.startsWith('## ')).length;
    if (paras < 3) problems.push(`${id}: bio has ${paras} paragraphs (≥ 3)`);
    if (!(p.refs || []).length) problems.push(`${id}: refs`);
    if (!nodes.has(id)) problems.push(`${id}: no lineage node`);
    if (!p.names.ja || !p.names.romaji) problems.push(`${id}: names.ja + names.romaji`);
  }
  assert.deepEqual(problems, []);
});

test('Japanese Zen: Ōtōkan chain, timeline ≥ 25, quiz ≥ 25, glossary', () => {
  const parent = (id) => (D.lineage.nodes.find((n) => n.id === id) || {}).parent;
  assert.equal(parent('hakuin'), 'shoju');
  assert.equal(parent('shoju'), 'shido-bunan');
  assert.equal(parent('shido-bunan'), 'gudo');
  assert.ok(D.timeline.filter((e) => e.region === 'japan').length >= 25, 'timeline');
  assert.ok(D.quiz.filter((q) => q.scope === 'region:japan').length >= 25, 'quiz');
  for (const id of ['shinjin-datsuraku', 'ganno-bichoku', 'gozan', 'otokan', 'sekishu', 'fusho', 'koan-taikei', 'naikan', 'nenbutsu-zen']) assert.ok(glossary.has(id), `term ${id}`);
});
