(function (Z) {
  'use strict';
  const DEFAULTS = {
    layers: { zh: true, pinyin: false, romaji: false, th: true },
    nameMode: 'th', // th | thCommon | ja | native
    fontSize: 'M', // S | M | L | XL
    theme: 'light', // light | dark
    ttsRate: 1,
    showSecondaryLinks: false,
  };
  const LAYER_KEYS = ['zh', 'pinyin', 'romaji', 'th'];
  const RATES = [0.75, 1, 1.25, 1.5, 2];
  let state = null;

  function load() {
    const saved = Z.store.get('settings', {}) || {};
    state = { ...DEFAULTS, ...saved, layers: { ...DEFAULTS.layers, ...(saved.layers || {}) } };
    if (!LAYER_KEYS.some((k) => state.layers[k])) state.layers = { ...DEFAULTS.layers };
    if (!RATES.includes(state.ttsRate)) state.ttsRate = 1;
    return state;
  }

  function get() { return state || load(); }

  function set(patch) {
    const s = get();
    state = { ...s, ...patch, layers: { ...s.layers, ...(patch.layers || {}) } };
    Z.store.set('settings', state);
    apply();
    Z.bus.emit('settings', state);
    return state;
  }

  /** Toggle a display layer; refuses to turn off the last visible layer. */
  function toggleLayer(key) {
    const s = get();
    const next = { ...s.layers, [key]: !s.layers[key] };
    if (!LAYER_KEYS.some((k) => next[k])) return false;
    set({ layers: next });
    return true;
  }

  function apply() {
    const s = get();
    const root = document.documentElement;
    const body = document.body;
    if (!body) return;
    for (const k of LAYER_KEYS) body.classList.toggle('hide-' + k, !s.layers[k]);
    root.classList.toggle('dark', s.theme === 'dark');
    root.dataset.fontSize = s.fontSize;
  }

  Z.settings = { get, set, load, apply, toggleLayer, DEFAULTS, LAYER_KEYS, RATES };
})(window.ZEN);
