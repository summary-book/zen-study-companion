(function (Z) {
  'use strict';
  // Notes model (CRUD, tags, search). Persisted via Z.store under "notes".
  const KINDS = { question: 'คำถาม', research: 'ค้นคว้าเพิ่ม', insight: 'ข้อสังเกต', general: 'ทั่วไป' };
  const MAX_TITLE = 200;
  const MAX_BODY = 20000;
  const MAX_TAGS = 20;

  function all() {
    const list = Z.store.get('notes', []);
    return Array.isArray(list) ? list : [];
  }

  function save(list) {
    Z.store.set('notes', list);
    Z.bus.emit('notes:changed', list);
  }

  function cleanTags(tags) {
    const out = [];
    for (const t of tags || []) {
      const s = String(t).trim().replace(/^#/, '').slice(0, 40);
      if (s && !out.includes(s)) out.push(s);
    }
    return out.slice(0, MAX_TAGS);
  }

  function cleanAnchor(a) {
    if (!a || typeof a !== 'object') return { type: 'general' };
    const out = { type: String(a.type || 'general') };
    for (const k of ['id', 'label', 'route']) if (a[k]) out[k] = String(a[k]).slice(0, 300);
    return out;
  }

  function create(data) {
    const now = Date.now();
    const note = {
      id: Z.util.uid('note'),
      anchor: cleanAnchor(data.anchor),
      title: String(data.title || '').slice(0, MAX_TITLE),
      body: String(data.body || '').slice(0, MAX_BODY),
      tags: cleanTags(data.tags),
      kind: KINDS[data.kind] ? data.kind : 'general',
      createdAt: now,
      updatedAt: now,
    };
    save([note, ...all()]);
    return note;
  }

  function update(id, patch) {
    let updated = null;
    const list = all().map((n) => {
      if (n.id !== id) return n;
      updated = {
        ...n,
        title: patch.title !== undefined ? String(patch.title).slice(0, MAX_TITLE) : n.title,
        body: patch.body !== undefined ? String(patch.body).slice(0, MAX_BODY) : n.body,
        tags: patch.tags !== undefined ? cleanTags(patch.tags) : n.tags,
        kind: patch.kind && KINDS[patch.kind] ? patch.kind : n.kind,
        anchor: patch.anchor ? cleanAnchor(patch.anchor) : n.anchor,
        updatedAt: Date.now(),
      };
      return updated;
    });
    if (updated) save(list);
    return updated;
  }

  function remove(id) {
    const list = all();
    const next = list.filter((n) => n.id !== id);
    if (next.length !== list.length) { save(next); return true; }
    return false;
  }

  function get(id) { return all().find((n) => n.id === id) || null; }

  function sameAnchor(a, b) {
    return a && b && a.type === b.type && (a.id || '') === (b.id || '');
  }

  function forAnchor(anchor) { return all().filter((n) => sameAnchor(n.anchor, anchor)); }

  function allTags() {
    const counts = {};
    for (const n of all()) for (const t of n.tags || []) counts[t] = (counts[t] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }

  /** filter: {q, tag, kind, anchorType} */
  function search(filter) {
    const f = filter || {};
    const q = Z.util.norm(f.q || '');
    return all().filter((n) => {
      if (f.tag && !(n.tags || []).includes(f.tag)) return false;
      if (f.kind && n.kind !== f.kind) return false;
      if (f.anchorType && n.anchor.type !== f.anchorType) return false;
      if (q) {
        const hay = Z.util.norm([n.title, n.body, (n.tags || []).join(' '), n.anchor.label].join(' '));
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /** Replace or merge a list of notes (from import). Merge: same id → newer updatedAt wins. */
  function importNotes(list, mode) {
    if (mode === 'replace') { save(list); return { added: list.length, updated: 0, kept: 0 }; }
    const cur = all();
    const byId = new Map(cur.map((n) => [n.id, n]));
    let added = 0;
    let updated = 0;
    for (const n of list) {
      const existing = byId.get(n.id);
      if (!existing) { byId.set(n.id, n); added++; } else if ((n.updatedAt || 0) > (existing.updatedAt || 0)) { byId.set(n.id, n); updated++; }
    }
    save(Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt));
    return { added, updated, kept: cur.length - updated };
  }

  Z.notes = { all, create, update, remove, get, forAnchor, allTags, search, importNotes, cleanTags, cleanAnchor, KINDS, sameAnchor, MAX_TITLE, MAX_BODY };
})(window.ZEN);
