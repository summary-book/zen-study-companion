(function (Z) {
  'use strict';
  // Read-aloud with the Web Speech API. Text is spoken sentence by sentence (avoids Chrome's
  // ~15 s cut-off) and the element being read is highlighted.
  const LANGS = { th: 'th-TH', zh: 'zh-CN', ja: 'ja-JP' };
  let queue = [];
  let pos = 0;
  let playing = false;
  let paused = false;
  let currentEl = null;
  let gen = 0; // generation counter: callbacks from cancelled utterances are ignored

  function supported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  }

  function voices() {
    try { return supported() ? window.speechSynthesis.getVoices() : []; } catch (e) { return []; }
  }

  function voiceFor(lang) {
    const list = voices();
    const exact = list.find((v) => v.lang === lang) || list.find((v) => (v.lang || '').replace('_', '-').toLowerCase() === lang.toLowerCase());
    return exact || list.find((v) => (v.lang || '').toLowerCase().startsWith(lang.slice(0, 2)));
  }

  function hasVoice(key) { return !!voiceFor(LANGS[key]); }

  function split(text) {
    return String(text)
      .split(/(?<=[。！？；!?;.])\s*|\n+| /)
      .flatMap((s) => (s.length > 180 ? s.match(/.{1,160}(\s|$)|.{1,160}/g) : [s]))
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /** items: [{text, lang:'th'|'zh'|'ja', el?}] */
  function play(items) {
    stop();
    if (!supported()) return false;
    queue = [];
    for (const it of items) for (const s of split(it.text)) queue.push({ text: s, lang: it.lang, el: it.el });
    pos = 0;
    gen++;
    playing = true;
    paused = false;
    Z.bus.emit('tts:state', state());
    next();
    return true;
  }

  function next() {
    if (!playing) return;
    if (pos >= queue.length) { stop(); return; }
    const item = queue[pos];
    const u = new window.SpeechSynthesisUtterance(item.text);
    u.lang = LANGS[item.lang] || 'th-TH';
    const v = voiceFor(u.lang);
    if (v) u.voice = v;
    u.rate = Z.settings.get().ttsRate || 1;
    const my = gen;
    u.onend = () => { if (my !== gen) return; pos++; next(); };
    u.onerror = () => { if (my !== gen) return; pos++; next(); };
    highlight(item.el);
    try { window.speechSynthesis.speak(u); } catch (e) { stop(); }
  }

  function highlight(el) {
    if (currentEl && currentEl !== el) currentEl.classList.remove('tts-active');
    currentEl = el || null;
    if (currentEl) {
      currentEl.classList.add('tts-active');
      if (currentEl.scrollIntoView) currentEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function pause() {
    if (!playing || !supported()) return;
    if (paused) { window.speechSynthesis.resume(); paused = false; } else { window.speechSynthesis.pause(); paused = true; }
    Z.bus.emit('tts:state', state());
  }

  /** Change speed; if playing, restart the current sentence at the new rate. */
  function setRate(rate) {
    Z.settings.set({ ttsRate: rate });
    if (playing && !paused && supported()) {
      gen++;
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      next();
    }
    Z.bus.emit('tts:state', state());
  }

  function step(dir) {
    const R = Z.settings.RATES;
    const i = R.indexOf(Z.settings.get().ttsRate);
    const j = Math.min(R.length - 1, Math.max(0, (i < 0 ? 1 : i) + dir));
    if (R[j] !== Z.settings.get().ttsRate) setRate(R[j]);
    return R[j];
  }

  /** Read one passage element: visible original layer, then the Thai paraphrase. */
  function playPassage(el) {
    const body = document.body;
    const items = [];
    const zh = el.querySelector('.layer-zh');
    if (zh && !body.classList.contains('hide-zh')) items.push({ text: zh.textContent, lang: zh.getAttribute('lang') === 'ja' ? 'ja' : 'zh', el });
    const th = el.querySelector('.layer-th');
    if (th && !body.classList.contains('hide-th')) {
      const c = th.cloneNode(true);
      c.querySelectorAll('.th-tag').forEach((x) => x.remove());
      items.push({ text: c.textContent, lang: 'th', el });
    }
    if (!items.length && zh) items.push({ text: zh.textContent, lang: 'zh', el });
    return play(items);
  }

  function stop() {
    gen++;
    playing = false;
    paused = false;
    queue = [];
    pos = 0;
    highlight(null);
    try { if (supported()) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    Z.bus.emit('tts:state', state());
  }

  function state() { return { playing, paused, pos, total: queue.length }; }

  Z.tts = { supported, voices, hasVoice, play, playPassage, pause, stop, state, split, setRate, step, LANGS };
})(window.ZEN);
