(function (Z) {
  'use strict';
  // Global search: a flat index built lazily over all content + notes.
  const TYPE_LABELS = {
    person: 'บุคคล', text: 'คัมภีร์', chapter: 'บทในคัมภีร์', passage: 'ข้อความ', koan: 'โกอาน', term: 'ศัพท์',
    practice: 'การปฏิบัติ', theravada: 'เทียบเถรวาท', timeline: 'เส้นเวลา', school: 'สำนัก', note: 'โน้ตของฉัน',
  };
  const ORDER = ['person', 'term', 'text', 'chapter', 'koan', 'passage', 'practice', 'theravada', 'school', 'timeline', 'note'];
  let index = null;

  /** Plain text from rich text / blocks (links → labels, bold markers removed). */
  function plain(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      return value.replace(Z.registry.REF_RE, (m, type, id, label) => label || Z.registry.resolve(type, id).label)
        .replace(/\*\*/g, '').replace(/^## /, '');
    }
    if (Array.isArray(value)) return value.map(plain).join(' ');
    if (typeof value === 'object') {
      if (value.list) return plain(value.list);
      if (value.note) return plain(value.note);
      return [value.zh, value.ja, value.pinyin, value.romaji, value.th].filter(Boolean).join(' ');
    }
    return String(value);
  }

  function item(type, id, route, title, sub, texts, extra) {
    const raw = texts.filter(Boolean).join('   ');
    return { type, id, route, title, sub: sub || '', raw, n: Z.util.norm(raw), nTitle: Z.util.norm(title), ...(extra || {}) };
  }

  function build() {
    const R = Z.registry;
    const D = R.D;
    const out = [];
    for (const p of D.people) {
      out.push(item('person', p.id, `/people/${p.id}`, Z.names.primary(p), p.names.zh, [...Z.names.allForms(p), p.summary, plain(p.bio)]));
    }
    for (const g of D.glossary) {
      out.push(item('term', g.id, `/glossary/${g.id}`, `${g.zh} ${g.th}`, g.pinyin, [g.zh, g.zhS, g.pinyin, g.romaji, g.ko, g.rr, g.vi, g.th, g.sa, g.pali, g.en, plain(g.meaning)]));
    }
    for (const t of D.texts) {
      out.push(item('text', t.id, `/texts/${t.id}`, t.short, t.titles.zh, [...Object.values(t.titles), plain(t.about.history), plain(t.about.author)]));
      for (const c of t.chapters) {
        out.push(item('chapter', `${t.id}/${c.id}`, `/texts/${t.id}/${c.id}`, `${t.short} · ${c.title.th}`, c.title.zh, [c.title.zh, c.title.th, plain(c.summary)]));
        for (const p of c.passages || []) {
          out.push(item('passage', p.id, `/texts/${t.id}/${c.id}`, `${t.short} · ${c.title.th}`, p.label || '', [p.zh, p.ja, p.pinyin, p.romaji, p.th], { p: p.id }));
        }
      }
    }
    for (const col of D.collections) {
      out.push(item('koan', col.id, `/koans/${col.id}`, col.short, col.titles.th, [...Object.values(col.titles), plain(col.about)]));
    }
    for (const k of D.koans) {
      const col = R.collection.get(k.collection);
      const layers = Object.values(k.layers).flat();
      out.push(item('koan', k.id, `/koans/${k.collection}/${k.no}`, `${col ? col.short : ''} ${k.no} · ${k.title.zh} ${k.title.th}`, '', [k.title.zh, k.title.th, ...layers.map(plain), plain(k.notes), plain(k.interpretations.map((i) => i.th))]));
    }
    for (const p of D.practice) out.push(item('practice', p.id, `/practice/${p.id}`, p.title.th, p.title.zh, [p.title.th, p.title.zh, p.title.ja, p.summary, plain(p.body)]));
    for (const o of D.oxherding) out.push(item('practice', `ox-${o.no}`, `/practice/oxherding?n=${o.no}`, `十牛圖 ${o.no} · ${o.title.zh} ${o.title.th}`, '', [o.title.zh, o.title.th, plain(o.preface), plain(o.verse), plain(o.explain)]));
    for (const t of D.theravada) out.push(item('theravada', t.id, `/theravada/${t.id}`, t.title.th, [t.title.zh, t.title.pali].filter(Boolean).join(' · '), [t.title.th, t.title.zh, t.title.pali, plain(t.zen.summary), plain(t.theravada.summary), ...(t.theravada.pali || []).map((x) => `${x.text} ${x.th}`), ...t.same, ...t.diff, ...t.caution]));
    for (const s of D.schools) out.push(item('school', s.id, `/lineage?focus=school:${s.id}`, s.th, s.zh, [s.zh, s.th, s.ja, s.ko, s.vi, s.summary]));
    for (const e of D.timeline) out.push(item('timeline', e.id, `/lineage/timeline?e=${e.id}`, `${Z.util.fmtYear(e.year)} · ${plain(e.th).slice(0, 60)}`, '', [String(e.year), plain(e.th)]));
    index = out;
    return out;
  }

  function invalidate() { index = null; }

  function snippet(raw, q, len) {
    const L = len || 90;
    const lower = raw.toLowerCase();
    let pos = lower.indexOf(q.toLowerCase());
    if (pos < 0) {
      // fall back: first occurrence of the first query character
      pos = Math.max(0, lower.indexOf(q.toLowerCase().slice(0, 1)));
    }
    const start = Math.max(0, pos - Math.floor(L / 3));
    return (start > 0 ? '…' : '') + raw.slice(start, start + L) + (start + L < raw.length ? '…' : '');
  }

  /** Returns [{type, label, items:[...]}] */
  function query(q, opts) {
    const o = opts || {};
    const nq = Z.util.norm(q);
    if (!nq) return [];
    const idx = index || build();
    const notes = o.includeNotes === false ? [] : Z.notes.all().map((n) => item('note', n.id, `/notes?id=${n.id}`, n.title || '(ไม่มีชื่อ)', n.anchor.label || '', [n.title, n.body, (n.tags || []).join(' ')]));
    const hits = [];
    for (const it of idx.concat(notes)) {
      const inTitle = it.nTitle.includes(nq);
      const inBody = it.n.includes(nq);
      if (!inTitle && !inBody) continue;
      const score = (it.nTitle === nq ? 100 : 0) + (it.nTitle.startsWith(nq) ? 50 : 0) + (inTitle ? 20 : 0) + (inBody ? 1 : 0);
      hits.push({ ...it, score, snippet: snippet(it.raw, q) });
    }
    const groups = {};
    for (const h of hits) (groups[h.type] = groups[h.type] || []).push(h);
    return ORDER.filter((t) => groups[t]).map((t) => ({
      type: t,
      label: TYPE_LABELS[t],
      total: groups[t].length,
      items: groups[t].sort((a, b) => b.score - a.score).slice(0, o.limit || 20),
    }));
  }

  Z.search = { build, query, invalidate, plain, snippet, TYPE_LABELS };
})(window.ZEN);
