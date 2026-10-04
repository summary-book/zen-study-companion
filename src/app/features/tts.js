(function (Z) {
  'use strict';
  // Read-aloud with the Web Speech API. Text is spoken sentence by sentence (avoids Chrome's
  // ~15 s cut-off). The passage being read is outlined; the phrase being spoken and, where the browser reports
  // word boundaries, the current word are marked with the CSS Custom Highlight API (no DOM changes).
  const LANGS = { th: 'th-TH', zh: 'zh-CN', ja: 'ja-JP' };
  let queue = [];
  let pos = 0;
  let playing = false;
  let paused = false;
  let currentEl = null;
  let gen = 0; // generation counter: callbacks from cancelled utterances are ignored
  let cursors = new Map(); // text element → offset already read (so repeated phrases map to the right place)

  // ── Phrase / word marking ────────────────────────────────────
  function canMark() {
    return typeof window.Highlight === 'function' && window.CSS && window.CSS.highlights && typeof document.createRange === 'function';
  }

  /** Range covering [start, end) of node.textContent. */
  function rangeAt(node, start, end) {
    const walker = document.createTreeWalker(node, 4 /* SHOW_TEXT */);
    const range = document.createRange();
    let seen = 0;
    let begun = false;
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const len = t.nodeValue.length;
      if (!begun && start < seen + len) { range.setStart(t, start - seen); begun = true; }
      if (begun && end <= seen + len) { range.setEnd(t, end - seen); return range; }
      seen += len;
    }
    return null;
  }

  /** Offset of `phrase` in the element's text, searching from where the previous phrase ended. */
  function locate(node, phrase) {
    const text = node.textContent;
    let at = text.indexOf(phrase, cursors.get(node) || 0);
    if (at < 0) at = text.indexOf(phrase);
    if (at >= 0) cursors.set(node, at + phrase.length);
    return at;
  }

  /** Length of the word starting at index i (used when the browser gives no charLength). */
  function wordLength(text, i, lang) {
    try {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        for (const s of new Intl.Segmenter(LANGS[lang] || 'th-TH', { granularity: 'word' }).segment(text)) {
          if (i >= s.index && i < s.index + s.segment.length) return s.index + s.segment.length - i;
        }
      }
    } catch (e) { /* fall through */ }
    const m = /^[^\s，。、；：？！,.;:?!]+/.exec(text.slice(i));
    return m ? m[0].length : 1;
  }

  function mark(name, node, start, end) {
    if (!canMark()) return;
    const r = node && start >= 0 && end > start ? rangeAt(node, start, end) : null;
    if (r) window.CSS.highlights.set(name, new window.Highlight(r)); else window.CSS.highlights.delete(name);
    if (r) keepVisible(r); // follow the phrase, then each word (long phrases wrap over several lines)
  }

  /** Scroll so the phrase being read sits between the top bar and the floating read-aloud bar. */
  function keepVisible(range) {
    if (typeof range.getBoundingClientRect !== 'function') return;
    const box = range.getBoundingClientRect();
    const top = 96;
    const bottom = window.innerHeight - 230;
    if (box.top < top || box.bottom > bottom) {
      window.scrollBy({ top: box.top - Math.max(top, (top + bottom) / 2 - box.height / 2), behavior: 'smooth' });
    }
  }

  function clearMarks() {
    if (!canMark()) return;
    window.CSS.highlights.delete('tts-phrase');
    window.CSS.highlights.delete('tts-word');
  }

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
    for (const it of items) for (const s of split(it.text)) queue.push({ text: s, lang: it.lang, el: it.el, node: it.node });
    cursors = new Map();
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
    // mark the phrase now, and each word as the engine reaches it (boundary events: not every voice sends them)
    if (item.at === undefined) item.at = item.node ? locate(item.node, item.text) : -1;
    mark('tts-phrase', item.node, item.at, item.at + item.text.length);
    mark('tts-word', null);
    u.onboundary = (e) => {
      if (my !== gen || item.at < 0 || (e.name && e.name !== 'word')) return;
      const i = e.charIndex || 0;
      const len = e.charLength || wordLength(item.text, i, item.lang);
      mark('tts-word', item.node, item.at + i, item.at + Math.min(item.text.length, i + len));
    };
    try { window.speechSynthesis.speak(u); } catch (e) { stop(); }
  }

  function highlight(el) {
    if (currentEl && currentEl !== el) currentEl.classList.remove('tts-active');
    currentEl = el || null;
    if (currentEl) {
      currentEl.classList.add('tts-active');
      if (!canMark() && currentEl.scrollIntoView) currentEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
    if (zh && !body.classList.contains('hide-zh')) items.push({ text: zh.textContent, lang: zh.getAttribute('lang') === 'ja' ? 'ja' : 'zh', el, node: zh });
    const th = el.querySelector('.layer-th');
    if (th && !body.classList.contains('hide-th')) {
      const c = th.cloneNode(true);
      c.querySelectorAll('.th-tag').forEach((x) => x.remove());
      items.push({ text: c.textContent, lang: 'th', el, node: th });
    }
    if (!items.length && zh) items.push({ text: zh.textContent, lang: 'zh', el, node: zh });
    return play(items);
  }

  function stop() {
    gen++;
    playing = false;
    paused = false;
    queue = [];
    pos = 0;
    highlight(null);
    clearMarks();
    try { if (supported()) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    Z.bus.emit('tts:state', state());
  }

  function state() { return { playing, paused, pos, total: queue.length }; }

  Z.tts = { supported, voices, hasVoice, play, playPassage, pause, stop, state, split, setRate, step, LANGS };
})(window.ZEN);
