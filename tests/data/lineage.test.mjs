import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from '../helpers/load-data.mjs';

const D = loadData();
const nodes = D.lineage.nodes;
const byId = new Map(nodes.map((n) => [n.id, n]));
const people = new Map(D.people.map((p) => [p.id, p]));

const INDIA = ['mahakasyapa', 'ananda', 'sanakavasin', 'upagupta', 'dhrtaka', 'miccaka', 'vasumitra', 'buddhanandi', 'buddhamitra', 'parsva', 'punyayasas', 'asvaghosa', 'kapimala', 'nagarjuna', 'kanadeva', 'rahulata', 'sanghanandi', 'gayasata', 'kumarata', 'jayata', 'vasubandhu', 'manorhita', 'haklena', 'simha', 'vasasita', 'punyamitra', 'prajnatara', 'bodhidharma'];
const CHINA = ['bodhidharma', 'huike', 'sengcan', 'daoxin', 'hongren', 'huineng'];

function pathToRoot(id) {
  const path = [];
  const seen = new Set();
  let cur = byId.get(id);
  while (cur) {
    if (seen.has(cur.id)) throw new Error('cycle at ' + cur.id);
    seen.add(cur.id);
    path.push(cur.id);
    cur = cur.parent ? byId.get(cur.parent) : null;
  }
  return path;
}

test('node ids are unique', () => {
  assert.equal(byId.size, nodes.length);
});

test('exactly one root, and it is the configured root', () => {
  const roots = nodes.filter((n) => !n.parent);
  assert.deepEqual(roots.map((r) => r.id), [D.lineage.root]);
});

test('every node except the root has an existing parent', () => {
  for (const n of nodes) {
    if (n.id === D.lineage.root) continue;
    assert.ok(n.parent, `${n.id} has no parent`);
    assert.ok(byId.has(n.parent), `${n.id} → missing parent ${n.parent}`);
  }
});

test('no cycles and every node reaches the root', () => {
  for (const n of nodes) {
    const p = pathToRoot(n.id);
    assert.equal(p[p.length - 1], D.lineage.root, `${n.id} does not reach root`);
  }
});

test('person nodes exist in people; group nodes have a Thai label', () => {
  for (const n of nodes) {
    if (n.kind === 'group') assert.ok(n.label && n.label.th, `group ${n.id} needs label.th`);
    else assert.ok(people.has(n.id), `lineage node ${n.id} is not a person`);
  }
});

test('28 Indian patriarchs in order, numbered correctly', () => {
  assert.equal(INDIA.length, 28);
  let parent = 'shakyamuni';
  INDIA.forEach((id, i) => {
    assert.equal(byId.get(id).parent, parent, `${id} should follow ${parent}`);
    assert.equal(people.get(id).patriarch.india, i + 1, `${id} patriarch number`);
    parent = id;
  });
});

test('6 Chinese patriarchs in order', () => {
  CHINA.forEach((id, i) => {
    if (i > 0) assert.equal(byId.get(id).parent, CHINA[i - 1]);
    assert.equal(people.get(id).patriarch.china, i + 1);
  });
});

test('Five Houses and Seven Lines: present, founders in tree, descend from Huineng', () => {
  const houses = D.schools.filter((s) => s.house);
  const lines = D.schools.filter((s) => s.line);
  assert.deepEqual(houses.map((s) => s.id).sort(), ['caodong', 'fayan', 'guiyang', 'linji', 'yunmen']);
  assert.equal(lines.length, 7);
  for (const s of lines) {
    assert.ok(byId.has(s.founder), `founder of ${s.id} not in lineage`);
    assert.ok(pathToRoot(s.founder).includes('huineng'), `${s.id} must descend from Huineng`);
  }
});

test('Japan / Korea / Vietnam branches are present', () => {
  for (const id of ['eisai', 'dogen', 'ingen', 'hakuin', 'jinul', 'taego', 'doui', 'tran-nhan-tong', 'lieu-quan', 'vinitaruci']) {
    assert.ok(byId.has(id), id);
  }
  assert.ok(pathToRoot('dogen').includes('dongshan'), 'Dōgen via Caodong');
  assert.ok(pathToRoot('hakuin').includes('linji'), 'Hakuin via Linji');
  assert.ok(pathToRoot('ingen').includes('linji'), 'Ingen via Linji');
});

test('links refer to existing nodes', () => {
  for (const l of D.lineage.links) {
    assert.ok(byId.has(l.from), l.from);
    assert.ok(byId.has(l.to), l.to);
    assert.ok(['studied-with', 'secondary', 'influence'].includes(l.kind), l.kind);
  }
});
