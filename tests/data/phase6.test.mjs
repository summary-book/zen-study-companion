// Phase 6 — Korea (修心訣, 禪家龜鑑, Sŏn masters) · Vietnam (Thiền masters) · modern teachers (TASKS P6-*)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadData, stripText } from '../helpers/load-data.mjs';
import { ROOT } from '../../tools/manifest.mjs';

const D = loadData();
const glossary = new Set(D.glossary.map((g) => g.id));
const nodes = new Set(D.lineage.nodes.map((n) => n.id));
const quiz = (s) => D.quiz.filter((q) => q.scope === s).length;
const rawBody = (w) => stripText(JSON.parse(readFileSync(join(ROOT, 'tools/raw', `${w}.json`), 'utf8')).juans.flatMap((j) => j.blocks.filter((b) => b.kind !== 'head' && !/^No\. /.test(b.text)).map((b) => b.text)).join(''));

const FULL = {
  korea: ['doui', 'jinul', 'taego', 'seosan', 'gyeongheo', 'muyeom', 'beomil', 'hyesim', 'naong', 'muhak', 'hamheo', 'samyeong', 'mangong', 'hanam', 'seongcheol', 'kusan-suryeon', 'seung-sahn'],
  vietnam: ['vinitaruci', 'vo-ngon-thong', 'thao-duong', 'tue-trung', 'tran-nhan-tong', 'nguyen-thieu', 'lieu-quan', 'nhat-hanh', 'khuong-viet', 'van-hanh', 'man-giac', 'tran-thai-tong', 'phap-loa', 'huyen-quang', 'chan-nguyen', 'huong-hai', 'thanh-tu'],
  modernAsia: ['dt-suzuki', 'shunryu-suzuki', 'sawaki', 'uchiyama', 'harada-sogaku', 'yasutani', 'yamada-koun', 'maezumi', 'xuyun', 'sheng-yen'],
  west: ['aitken', 'kapleau', 'jiyu-kennett', 'loori', 'joko-beck', 'glassman', 'watts', 'blyth'],
};
const NO_NODE = new Set(['watts', 'blyth']); // lay writers outside any teaching line

test('修心訣 (T2020) is complete; 禪家龜鑑 (X1255) has every main aphorism', () => {
  const s = D.texts.find((t) => t.id === 'susimgyeol');
  assert.ok(s && s.sourceId === 'T2020' && s.lang === 'lzh', 'text susimgyeol');
  const joined = stripText(s.chapters.flatMap((c) => c.passages.map((p) => p.zh)).join(''));
  const raw = rawBody('T2020');
  assert.ok(Math.abs(joined.length - raw.length) <= 10, `修心訣 ${joined.length}/${raw.length} chars`);
  const g = D.texts.find((t) => t.id === 'seonga-gwigam');
  assert.ok(g && g.sourceId === 'X1255', 'text seonga-gwigam');
  assert.ok(g.chapters.length >= 5 && g.chapters.every((c) => c.passages.length >= 3), '禪家龜鑑 chapters with passages');
  for (const t of [s, g]) {
    assert.ok(t.about.history.length >= 3 && t.about.author.length >= 2 && t.furtherReading.length >= 3 && t.keyPassages.length >= 5, `${t.id} shell`);
    for (const c of t.chapters) for (const p of c.passages) assert.ok(p.th && p.th.length > 3, `${p.id} th`);
  }
  assert.ok(quiz('text:susimgyeol') >= 20 && quiz('text:seonga-gwigam') >= 20, 'quiz per text');
});

test('Korea · Vietnam · modern teachers: full profiles with sources and lineage places', () => {
  const problems = [];
  for (const [group, ids] of Object.entries(FULL)) {
    for (const id of ids) {
      const p = D.people.find((x) => x.id === id);
      if (!p) { problems.push(`${group}: person ${id} missing`); continue; }
      const paras = (p.bio || []).filter((b) => typeof b === 'string' && !b.startsWith('## ')).length;
      if (paras < 3) problems.push(`${id}: bio has ${paras} paragraphs (≥ 3)`);
      if (!(p.refs || []).length) problems.push(`${id}: refs`);
      if (!NO_NODE.has(id) && !nodes.has(id)) problems.push(`${id}: no lineage node`);
      if (group === 'korea' && !(p.names.ko && p.names.rr)) problems.push(`${id}: names.ko + names.rr`);
      if (group === 'vietnam' && !p.names.vi) problems.push(`${id}: names.vi`);
    }
  }
  assert.deepEqual(problems, []);
});

test('regional timelines, quizzes and glossary', () => {
  for (const r of ['korea', 'vietnam', 'west']) {
    assert.ok(D.timeline.filter((e) => e.region === r).length >= 10, `timeline ${r}`);
    assert.ok(quiz(`region:${r}`) >= 20, `quiz region:${r}`);
  }
  for (const id of ['dono-jeomsu', 'jeonghye-ssangsu', 'gongjeok-yeongji', 'ilmul', 'seon-gyo', 'cu-tran-lac-dao', 'engaged-buddhism', 'shoshin', 'jukai']) assert.ok(glossary.has(id), `term ${id}`);
});
