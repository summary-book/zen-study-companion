(function (Z) {
  'use strict';
  // Indexes over window.ZEN_DATA + cross-reference resolution. Built once at boot.
  const R = {};

  function mergeBios(D) {
    for (const p of D.people) {
      const extra = D.bios && D.bios[p.id];
      if (extra) Object.assign(p, extra);
    }
  }

  // Chapters of long texts can live in their own files: ZEN_DATA.chapters = [{ text: '<textId>', id, no, … }]
  function mergeChapters(D) {
    const extra = D.chapters || [];
    if (!extra.length) return;
    for (const t of D.texts) {
      const mine = extra.filter((c) => c.text === t.id).map((c) => { const o = Object.assign({}, c); delete o.text; return o; });
      if (mine.length) t.chapters = t.chapters.concat(mine).sort((a, b) => a.no - b.no);
    }
    D.chapters = [];
  }

  function build(D) {
    R.D = D;
    mergeBios(D);
    mergeChapters(D);
    R.person = new Map(D.people.map((p) => [p.id, p]));
    R.school = new Map(D.schools.map((s) => [s.id, s]));
    R.source = new Map(D.sources.map((s) => [s.id, s]));
    R.text = new Map(D.texts.map((t) => [t.id, t]));
    R.chapter = new Map();
    for (const t of D.texts) t.chapters.forEach((c, i) => R.chapter.set(`${t.id}/${c.id}`, { text: t, chapter: c, index: i }));
    R.collection = new Map(D.collections.map((c) => [c.id, c]));
    R.koan = new Map(D.koans.map((k) => [k.id, k]));
    // "related" is written on one side only (e.g. 從容錄 → 無門關); index it both ways
    R.relatedOf = new Map();
    const relate = (a, b) => { if (!R.relatedOf.has(a)) R.relatedOf.set(a, new Set()); R.relatedOf.get(a).add(b); };
    for (const k of D.koans) for (const r of k.related || []) { relate(k.id, r); relate(r, k.id); }
    R.term = new Map(D.glossary.map((g) => [g.id, g]));
    R.practice = new Map(D.practice.map((p) => [p.id, p]));
    R.theravada = new Map(D.theravada.map((t) => [t.id, t]));
    R.node = new Map(D.lineage.nodes.map((n) => [n.id, n]));
    R.children = new Map();
    for (const n of D.lineage.nodes) {
      if (!n.parent) continue;
      if (!R.children.has(n.parent)) R.children.set(n.parent, []);
      R.children.get(n.parent).push(n.id);
    }
    // Generated pinyin (build.mjs) fills passages that have none.
    const gen = (D.gen && D.gen.pinyin) || {};
    R.passage = new Map();
    forEachPassage(D, (p, ctx) => {
      if (!p.pinyin && gen[p.id]) p.pinyin = gen[p.id];
      R.passage.set(p.id, { passage: p, ctx });
    });
    buildS2T(D);
    buildReverse(D);
    return R;
  }

  function forEachPassage(D, cb) {
    const visitBlocks = (blocks, ctx) => {
      for (const b of blocks || []) if (b && typeof b === 'object' && (b.zh || b.ja) && b.id) cb(b, ctx);
    };
    for (const t of D.texts) {
      visitBlocks(t.about && t.about.history, { type: 'text', id: t.id });
      visitBlocks(t.about && t.about.author, { type: 'text', id: t.id });
      for (const c of t.chapters) {
        visitBlocks(c.summary, { type: 'chapter', id: `${t.id}/${c.id}` });
        for (const p of c.passages || []) cb(p, { type: 'chapter', id: `${t.id}/${c.id}` });
      }
    }
    for (const col of D.collections) visitBlocks(col.about, { type: 'collection', id: col.id });
    for (const k of D.koans) for (const layer of Object.values(k.layers || {})) for (const p of layer) cb(p, { type: 'koan', id: k.id });
    for (const o of D.oxherding) for (const p of [o.preface, o.verse]) if (p) cb(p, { type: 'practice', id: 'oxherding', no: o.no });
    for (const pr of D.practice) visitBlocks(pr.body, { type: 'practice', id: pr.id });
    for (const p of D.people) visitBlocks(p.bio, { type: 'person', id: p.id });
    for (const g of D.glossary) visitBlocks(g.meaning, { type: 'term', id: g.id });
  }

  function buildS2T(D) {
    const map = {};
    const pair = (t, s) => {
      if (!t || !s) return;
      const a = Array.from(t);
      const b = Array.from(s);
      if (a.length !== b.length) return;
      b.forEach((ch, i) => { if (ch !== a[i]) map[ch] = a[i]; });
    };
    for (const p of D.people) pair(p.names.zh, p.names.zhS);
    for (const g of D.glossary) pair(g.zh, g.zhS);
    Z.util.setS2T(map);
  }

  const REF_RE = /\[\[(\w+):([^\]|]+)(?:\|([^\]]*))?\]\]/g;

  function refsIn(value, cb) {
    if (typeof value === 'string') {
      for (const m of value.matchAll(REF_RE)) cb(m[1], m[2]);
    } else if (Array.isArray(value)) value.forEach((v) => refsIn(v, cb));
    else if (value && typeof value === 'object') Object.values(value).forEach((v) => refsIn(v, cb));
  }

  // person/term → where it appears
  function buildReverse(D) {
    R.mentions = { person: new Map(), term: new Map() };
    const add = (kind, id, where) => {
      const m = R.mentions[kind];
      if (!m.has(id)) m.set(id, []);
      const list = m.get(id);
      if (!list.some((w) => w.type === where.type && w.id === where.id)) list.push(where);
    };
    const scan = (obj, where) => refsIn(obj, (type, id) => { if (type === 'person' || type === 'term') add(type, id, where); });
    for (const t of D.texts) {
      (t.people || []).forEach((p) => add('person', p, { type: 'text', id: t.id }));
      scan(t.about, { type: 'text', id: t.id });
      for (const c of t.chapters) {
        const where = { type: 'chapter', id: `${t.id}/${c.id}` };
        scan(c.summary, where);
        (c.passages || []).forEach((p) => { if (p.speaker) add('person', p.speaker, where); scan(p.th, where); });
      }
    }
    for (const k of D.koans) {
      const where = { type: 'koan', id: k.id };
      (k.people || []).forEach((p) => add('person', p, where));
      (k.terms || []).forEach((t) => add('term', t, where));
      scan(k.notes, where);
      scan(k.interpretations, where);
    }
    for (const col of D.collections) {
      scan(col.about, { type: 'collection', id: col.id });
      if (col.compiler) add('person', col.compiler, { type: 'collection', id: col.id });
    }
    for (const p of D.practice) scan(p.body, { type: 'practice', id: p.id });
    for (const t of D.theravada) {
      scan(t.zen, { type: 'theravada', id: t.id });
      (t.zen.refs || []).forEach((r) => { const [type, id] = r.split(/:(.+)/); if (type === 'term') add('term', id, { type: 'theravada', id: t.id }); });
    }
    for (const g of D.glossary) scan(g.meaning, { type: 'term', id: g.id });
  }

  /** Resolve a reference to {label, route, exists}. */
  function resolve(type, id) {
    const N = Z.names;
    switch (type) {
      case 'person': {
        const p = R.person.get(id);
        return { exists: !!p, label: p ? N.primary(p) : id, route: `/people/${id}` };
      }
      case 'text': {
        const t = R.text.get(id);
        return { exists: !!t, label: t ? t.short : id, route: `/texts/${id}` };
      }
      case 'chapter': {
        const c = R.chapter.get(id);
        return { exists: !!c, label: c ? `${c.text.short} · ${c.chapter.title.th}` : id, route: `/texts/${id}` };
      }
      case 'koan': {
        const k = R.koan.get(id);
        const [col, no] = id.split(/-(?=\d+$)/);
        const c = R.collection.get(col);
        return { exists: !!k, label: k ? `${c ? c.short : col} ${no} ${k.title.zh}` : id, route: `/koans/${col}/${no}` };
      }
      case 'collection': {
        const c = R.collection.get(id);
        return { exists: !!c, label: c ? c.short : id, route: `/koans/${id}` };
      }
      case 'term': {
        const g = R.term.get(id);
        return { exists: !!g, label: g ? `${g.zh} ${g.th}` : id, route: `/glossary/${id}` };
      }
      case 'practice': {
        const p = R.practice.get(id);
        return { exists: !!p, label: p ? p.title.th : id, route: `/practice/${id}` };
      }
      case 'theravada': {
        const t = R.theravada.get(id);
        return { exists: !!t, label: t ? t.title.th : id, route: `/theravada/${id}` };
      }
      case 'school': {
        const s = R.school.get(id);
        return { exists: !!s, label: s ? `${s.th}` : id, route: `/lineage?focus=school:${id}` };
      }
      case 'source': {
        const s = R.source.get(id);
        return { exists: !!s, label: s ? shortCite(s) : id, route: null, source: s };
      }
      default:
        return { exists: false, label: id, route: null };
    }
  }

  function shortCite(s) {
    if (s.kind === 'primary') return `${s.title} (${s.id})`;
    const author = (s.author || '').split(/[,&(]/)[0].trim();
    return `${author}${s.year ? ' ' + s.year : ''}`.trim() || s.title;
  }

  function fullCite(s) {
    return [s.author, s.year, s.title, s.publisher].filter(Boolean).join('. ');
  }

  function routeFromRef(ref) {
    const [type, id] = String(ref).split(/:(.+)/);
    return resolve(type, id);
  }

  /** Ancestors from root to node (inclusive). */
  function lineagePath(id) {
    const path = [];
    let cur = R.node.get(id);
    const seen = new Set();
    while (cur && !seen.has(cur.id)) { seen.add(cur.id); path.unshift(cur.id); cur = cur.parent ? R.node.get(cur.parent) : null; }
    return path;
  }

  Z.registry = Object.assign(R, { build, resolve, routeFromRef, lineagePath, fullCite, shortCite, refsIn, REF_RE, forEachPassage });
})(window.ZEN);
