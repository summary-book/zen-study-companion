(function (Z) {
  'use strict';
  // Reading progress. Keys: "chapter:<text>/<chapter>", "koan:<collection>-<no>", "ox:<no>".
  function state() {
    const s = Z.store.get('progress', {});
    return s && typeof s === 'object' && !Array.isArray(s) ? s : {};
  }

  function isRead(key) { return !!state()[key]; }

  function setRead(key, read) {
    const s = { ...state() };
    if (read) s[key] = Date.now(); else delete s[key];
    Z.store.set('progress', s);
    Z.bus.emit('progress:changed', { key, read });
  }

  function toggle(key) { setRead(key, !isRead(key)); return isRead(key); }

  function textStats(text) {
    const total = text.chapters.length;
    const done = text.chapters.filter((c) => isRead(`chapter:${text.id}/${c.id}`)).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  /** Percent of the whole collection (count from collection.count, not only cases available). */
  function collectionStats(col) {
    const total = col.count;
    const s = state();
    const done = Object.keys(s).filter((k) => k.startsWith(`koan:${col.id}-`)).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function setLast(loc) { Z.store.set('lastLocation', loc); }
  function getLast() { return Z.store.get('lastLocation', null); }

  function replace(obj) { Z.store.set('progress', obj && typeof obj === 'object' ? obj : {}); Z.bus.emit('progress:changed', {}); }

  Z.progress = { state, isRead, setRead, toggle, textStats, collectionStats, setLast, getLast, replace };
})(window.ZEN);
