(function (Z) {
  'use strict';
  // localStorage wrapper: every access is guarded; falls back to in-memory storage so the
  // app keeps working (for this session) in private mode / blocked storage / quota errors.
  const PREFIX = 'zsc:v1:';
  const SCHEMA_VERSION = 1;
  const memory = new Map();
  let available = null;

  function ls() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function probe() {
    try {
      const s = ls();
      if (!s) return false;
      const k = PREFIX + '__probe';
      s.setItem(k, '1');
      s.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function isAvailable() {
    if (available === null) available = probe();
    return available;
  }

  function markUnavailable(err) {
    if (available !== false) {
      available = false;
      Z.bus && Z.bus.emit('storage:unavailable', err);
    }
  }

  function get(key, fallback) {
    const full = PREFIX + key;
    if (memory.has(full)) return memory.get(full);
    if (!isAvailable()) return fallback;
    let raw;
    try {
      raw = ls().getItem(full);
    } catch (e) {
      markUnavailable(e);
      return fallback;
    }
    if (raw === null || raw === undefined) return fallback;
    try {
      const val = JSON.parse(raw);
      memory.set(full, val);
      return val;
    } catch (e) {
      // Corrupt JSON: keep a backup copy and start fresh instead of crashing.
      try { ls().setItem(`${PREFIX}corrupt-${key}-${Date.now()}`, raw); ls().removeItem(full); } catch (e2) { /* ignore */ }
      Z.bus && Z.bus.emit('storage:corrupt', key);
      return fallback;
    }
  }

  function set(key, value) {
    const full = PREFIX + key;
    memory.set(full, value);
    if (!isAvailable()) { Z.bus && Z.bus.emit('storage:unavailable'); return false; }
    try {
      ls().setItem(full, JSON.stringify(value));
      return true;
    } catch (e) {
      markUnavailable(e);
      return false;
    }
  }

  function remove(key) {
    const full = PREFIX + key;
    memory.delete(full);
    if (!isAvailable()) return false;
    try { ls().removeItem(full); return true; } catch (e) { markUnavailable(e); return false; }
  }

  function clearAll() {
    memory.clear();
    if (!isAvailable()) return;
    try {
      const s = ls();
      const keys = [];
      for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.startsWith(PREFIX)) keys.push(k); }
      keys.forEach((k) => s.removeItem(k));
    } catch (e) { markUnavailable(e); }
  }

  function migrate() {
    const v = get('schemaVersion', null);
    if (v === null) set('schemaVersion', SCHEMA_VERSION);
    // future: if (v < 2) { ...transform...; set('schemaVersion', 2); }
  }

  // test hook
  function _reset() { memory.clear(); available = null; }

  Z.store = { get, set, remove, clearAll, isAvailable, migrate, SCHEMA_VERSION, PREFIX, _reset };
})(window.ZEN);
