import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData, rawText, rawTextClean, stripText, walk } from '../helpers/load-data.mjs';

const D = loadData();
const ids = (arr, key = 'id') => new Set(arr.map((x) => x[key]));
const people = ids(D.people);
const sources = ids(D.sources);
const schools = ids(D.schools);
const terms = ids(D.glossary);
const practice = ids(D.practice);
const theravada = ids(D.theravada);
const textsById = new Map(D.texts.map((t) => [t.id, t]));
const koans = ids(D.koans);
const collections = ids(D.collections);

const COUNTRIES = ['india', 'china', 'japan', 'korea', 'vietnam', 'west'];
const HISTORICITY = ['traditional', 'historical', 'disputed'];

function refExists(type, id) {
  switch (type) {
    case 'person': return people.has(id);
    case 'text': return textsById.has(id);
    case 'chapter': {
      const [t, c] = id.split('/');
      return !!textsById.get(t)?.chapters.some((ch) => ch.id === c);
    }
    case 'koan': return koans.has(id);
    case 'collection': return collections.has(id);
    case 'term': return terms.has(id);
    case 'practice': return practice.has(id) || id === 'oxherding';
    case 'theravada': return theravada.has(id);
    case 'source': return sources.has(id);
    case 'school': return schools.has(id);
    default: return false;
  }
}

function allPassages() {
  const out = [];
  for (const t of D.texts) {
    for (const ch of t.chapters) for (const p of ch.passages || []) out.push({ p, where: `${t.id}/${ch.id}` });
    walk(t.about, (v) => { if (v && typeof v === 'object' && (v.zh || v.ja) && v.id) out.push({ p: v, where: `${t.id}/about` }); });
    for (const ch of t.chapters) walk(ch.summary, (v) => { if (v && typeof v === 'object' && (v.zh || v.ja) && v.id) out.push({ p: v, where: `${t.id}/${ch.id}/summary` }); });
  }
  for (const c of D.collections) walk(c.about, (v) => { if (v && typeof v === 'object' && (v.zh || v.ja) && v.id) out.push({ p: v, where: `${c.id}/about` }); });
  for (const k of D.koans) for (const layer of Object.values(k.layers)) for (const p of layer) out.push({ p, where: k.id });
  for (const o of D.oxherding) for (const p of [o.preface, o.verse].filter(Boolean)) out.push({ p, where: `ox-${o.no}` });
  for (const pr of D.practice) walk(pr.body, (v) => { if (v && typeof v === 'object' && (v.zh || v.ja) && v.id) out.push({ p: v, where: pr.id }); });
  for (const person of D.people) walk(person.bio, (v) => { if (v && typeof v === 'object' && (v.zh || v.ja) && v.id) out.push({ p: v, where: person.id }); });
  for (const g of D.glossary) walk(g.meaning, (v) => { if (v && typeof v === 'object' && (v.zh || v.ja) && v.id) out.push({ p: v, where: g.id }); });
  return out;
}

test('unique ids in every collection', () => {
  for (const key of ['sources', 'schools', 'people', 'texts', 'collections', 'koans', 'practice', 'glossary', 'theravada', 'quiz', 'timeline']) {
    const arr = D[key];
    const s = new Set(arr.map((x) => x.id));
    const dupes = arr.map((x) => x.id).filter((id, i, a) => a.indexOf(id) !== i);
    assert.equal(s.size, arr.length, `${key} duplicate ids: ${dupes.join(', ')}`);
  }
  const pids = allPassages().map((x) => x.p.id);
  const dupes = pids.filter((id, i, a) => a.indexOf(id) !== i);
  assert.deepEqual(dupes, [], 'duplicate passage ids');
});

test('people: required fields and valid references', () => {
  for (const p of D.people) {
    assert.ok(p.names?.th && p.names?.zh, `${p.id}: names.th and names.zh required`);
    assert.ok(COUNTRIES.includes(p.country), `${p.id}: country`);
    assert.ok(HISTORICITY.includes(p.historicity), `${p.id}: historicity`);
    assert.ok(typeof p.summary === 'string' && p.summary.length > 5, `${p.id}: summary`);
    for (const s of p.schools || []) assert.ok(schools.has(s), `${p.id}: school ${s}`);
    for (const r of p.refs || []) assert.ok(sources.has(r), `${p.id}: ref ${r}`);
    if (p.names.thCommon) assert.ok(Array.isArray(p.names.thCommon), `${p.id}: thCommon must be array`);
  }
});

test('bios refer to existing people', () => {
  for (const id of Object.keys(D.bios || {})) assert.ok(people.has(id), `bios.${id}`);
});

test('schools: parent and founder exist', () => {
  for (const s of D.schools) {
    if (s.parent) assert.ok(schools.has(s.parent), `${s.id} parent ${s.parent}`);
    if (s.founder) assert.ok(people.has(s.founder), `${s.id} founder ${s.founder}`);
  }
});

test('every [[type:id]] cross-reference resolves', () => {
  const bad = [];
  walk(D, (v, path) => {
    if (typeof v !== 'string') return;
    for (const m of v.matchAll(/\[\[(\w+):([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      if (!refExists(m[1], m[2])) bad.push(`${path.join('.')}: ${m[0]}`);
    }
  });
  assert.deepEqual(bad, []);
});

test('texts: structure, people, key passages, further reading', () => {
  for (const t of D.texts) {
    assert.ok(t.titles?.zh && t.titles?.th && t.short, `${t.id} titles`);
    assert.ok(sources.has(t.sourceId), `${t.id} sourceId`);
    assert.ok(t.about?.history?.length && t.about?.author?.length, `${t.id} about.history/author`);
    assert.ok(t.chapters.length > 0, `${t.id} chapters`);
    const pids = new Set(t.chapters.flatMap((c) => (c.passages || []).map((p) => p.id)));
    for (const k of t.keyPassages || []) assert.ok(pids.has(k), `${t.id} keyPassage ${k}`);
    for (const p of t.people || []) assert.ok(people.has(p), `${t.id} person ${p}`);
    for (const f of t.furtherReading || []) assert.ok(sources.has(f.sourceId), `${t.id} furtherReading ${f.sourceId}`);
    const chIds = t.chapters.map((c) => c.id);
    assert.equal(new Set(chIds).size, chIds.length, `${t.id} chapter ids unique`);
    for (const c of t.chapters) assert.ok(c.title?.th && Array.isArray(c.summary) && c.summary.length, `${t.id}/${c.id} title.th + summary`);
  }
});

test('passages: layer, verify status, and verbatim match with CBETA/SAT when "checked"', (t) => {
  const problems = [];
  // SAT texts are cached only locally (tools/raw-private, git-ignored); without the cache those checks are skipped
  const sat = new Set(D.sources.filter((s) => s.edition === 'SAT').map((s) => s.id));
  let skipped = 0;
  for (const { p, where } of allPassages()) {
    if (!['source', 'commentary'].includes(p.layer || 'source')) problems.push(`${where}/${p.id}: bad layer ${p.layer}`);
    if (!['checked', 'draft'].includes(p.verify)) problems.push(`${where}/${p.id}: verify must be checked|draft`);
    if (p.speaker && !people.has(p.speaker)) problems.push(`${where}/${p.id}: speaker ${p.speaker}`);
    if (p.verify === 'checked') {
      const work = (p.src || '').split(':')[0];
      const raw = p.notesOmitted ? rawTextClean(work) : rawText(work);
      if (!raw && sat.has(work)) { skipped++; continue; }
      if (!raw) { problems.push(`${where}/${p.id}: checked but no tools/raw/${work}.json`); continue; }
      const body = stripText(p.zh || p.ja || '');
      if (!raw.includes(body)) problems.push(`${where}/${p.id}: text does not match ${work} verbatim`);
    }
  }
  if (skipped) t.diagnostic(`${skipped} SAT passages not checked: run node tools/fetch-sat.mjs T2582 T2580 to create tools/raw-private/`);
  assert.deepEqual(problems, []);
});

test('koans: collection, numbering, layers, interpretations are sourced', () => {
  for (const k of D.koans) {
    assert.ok(collections.has(k.collection), `${k.id} collection`);
    assert.equal(k.id, `${k.collection}-${k.no}`);
    const col = D.collections.find((c) => c.id === k.collection);
    for (const key of Object.keys(k.layers)) assert.ok(col.layerOrder.includes(key), `${k.id}: layer ${key}`);
    assert.ok(k.layers.case?.length, `${k.id}: case (本則) required`);
    for (const i of k.interpretations || []) {
      assert.ok(i.by && i.th, `${k.id}: interpretation needs by + th`);
      assert.ok(sources.has(i.sourceId), `${k.id}: interpretation source ${i.sourceId}`);
    }
    for (const p of k.people || []) assert.ok(people.has(p), `${k.id}: person ${p}`);
    for (const t of k.terms || []) assert.ok(terms.has(t), `${k.id}: term ${t}`);
    for (const r of k.related || []) assert.ok(koans.has(r) || /^\w+-\d+$/.test(r), `${k.id}: related ${r}`);
  }
  for (const c of D.collections) {
    const nos = D.koans.filter((k) => k.collection === c.id).map((k) => k.no);
    assert.equal(new Set(nos).size, nos.length, `${c.id}: duplicate case numbers`);
    for (const n of nos) assert.ok(n >= 1 && n <= c.count, `${c.id}: case ${n} out of range`);
  }
});

test('Theravāda stays in its own view (no Pāli inside Zen text/koan passages)', () => {
  for (const { p, where } of allPassages()) {
    assert.ok(!('pali' in p), `${where}/${p.id} has a pali field`);
    assert.ok(!/^suttacentral/.test(p.src || ''), `${where}/${p.id} cites SuttaCentral`);
    assert.ok(!/\[\[theravada:/.test(p.th || ''), `${where}/${p.id} links Theravāda inside a paraphrase`);
  }
});

test('glossary: required fields and related terms exist', () => {
  for (const g of D.glossary) {
    assert.ok(g.zh && g.pinyin && g.th && g.meaning?.length, `${g.id} zh/pinyin/th/meaning`);
    for (const r of g.related || []) assert.ok(terms.has(r), `${g.id} related ${r}`);
  }
});

test('theravada topics: both sides, comparisons, references', () => {
  for (const t of D.theravada) {
    assert.ok(t.title?.th, t.id);
    assert.ok(t.zen?.summary?.length && t.theravada?.summary?.length, `${t.id} summaries`);
    assert.ok(t.same?.length && t.diff?.length && t.caution?.length, `${t.id} same/diff/caution`);
    for (const r of t.theravada.refs || []) assert.ok(sources.has(r.sourceId), `${t.id} ref ${r.sourceId}`);
    for (const r of t.zen.refs || []) {
      const [type, id] = r.split(/:(.+)/);
      assert.ok(refExists(type, id), `${t.id} zen ref ${r}`);
    }
  }
});

test('quiz: valid shape, answer, ref; ≥ 20 questions per scope', () => {
  const byScope = {};
  for (const q of D.quiz) {
    byScope[q.scope] = (byScope[q.scope] || 0) + 1;
    assert.ok(q.q && q.explain, `${q.id}: q + explain`);
    if (q.type === 'mcq') {
      assert.ok(Array.isArray(q.choices) && q.choices.length >= 3, `${q.id}: choices`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `${q.id}: answer index`);
      assert.equal(new Set(q.choices).size, q.choices.length, `${q.id}: duplicate choices`);
    } else if (q.type === 'tf') {
      assert.equal(typeof q.answer, 'boolean', `${q.id}: tf answer`);
    } else if (q.type === 'match') {
      assert.ok(Array.isArray(q.pairs) && q.pairs.length >= 3, `${q.id}: pairs`);
    } else assert.fail(`${q.id}: type ${q.type}`);
    const [type, id] = q.ref.split(/:(.+)/);
    assert.ok(refExists(type, id), `${q.id}: ref ${q.ref}`);
    const [st, sid] = q.scope.split(':');
    if (st === 'text') assert.ok(textsById.has(sid), `${q.id}: scope ${q.scope}`);
    else if (st === 'collection') assert.ok(collections.has(sid), `${q.id}: scope ${q.scope}`);
    else if (st === 'region') assert.ok(['japan', 'korea', 'vietnam', 'west'].includes(sid), `${q.id}: scope ${q.scope}`);
    else assert.ok(['lineage'].includes(st), `${q.id}: scope ${q.scope}`);
  }
  for (const [scope, n] of Object.entries(byScope)) assert.ok(n >= 20, `scope ${scope} has only ${n} questions`);
});

test('timeline: regions, years, refs', () => {
  for (const e of D.timeline) {
    assert.ok(COUNTRIES.includes(e.region), `${e.id} region`);
    assert.ok(Number.isInteger(e.year), `${e.id} year`);
    assert.ok(e.th, `${e.id} th`);
    if (e.ref) {
      const [type, id] = e.ref.split(/:(.+)/);
      assert.ok(refExists(type, id), `${e.id} ref ${e.ref}`);
    }
  }
});

test('oxherding: 10 pictures, each with its own SVG', () => {
  if (!D.oxherding.length) return;
  assert.deepEqual(D.oxherding.map((o) => o.no).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const o of D.oxherding) assert.ok(D.svg[o.svg], `svg ${o.svg} missing in src/svg/oxherding`);
});
