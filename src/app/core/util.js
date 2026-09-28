(function (Z) {
  'use strict';

  /**
   * Tiny DOM builder. Children may be strings (rendered as text, never HTML),
   * nodes, arrays or null/false (skipped).
   * attrs: class, text, html (trusted build-time content only), on:{event:fn}, dataset:{}, any attribute.
   */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    append(el, children);
    return el;
  }
  function append(el, children) {
    for (const c of children) {
      if (c === null || c === undefined || c === false) continue;
      if (Array.isArray(c)) append(el, c);
      else if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v !== undefined && v !== null) el.setAttribute(k, v);
    return el;
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  // Normalization used by search: lower-case, strip diacritics (pinyin tones, romaji macrons,
  // Vietnamese marks), map simplified→traditional for characters present in data, drop spaces and punctuation.
  let s2t = {};
  function setS2T(map) { s2t = map || {}; }
  const PUNCT = /[\s　，。、；：？！「」『』（）《》〈〉·・,.;:?!"'()\[\]{}\-–—…]/g;
  function norm(str) {
    if (!str) return '';
    let s = String(str).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/đ/g, 'd');
    if (Object.keys(s2t).length) s = Array.from(s, (ch) => s2t[ch] || ch).join('');
    return s.replace(PUNCT, '');
  }

  function fmtYear(y) {
    if (y === null || y === undefined || y === '') return '?';
    return y < 0 ? `${-y} ปีก่อน ค.ศ.` : String(y);
  }
  function fmtDates(d) {
    if (!d) return '';
    const a = d.approx ? 'ราว ' : '';
    if (d.b === undefined && d.d === undefined) return d.note || '';
    return `${a}${fmtYear(d.b)}–${fmtYear(d.d)}${d.note ? ' · ' + d.note : ''}`;
  }
  function century(y) {
    return y <= 0 ? 0 : Math.floor((y - 1) / 100) + 1;
  }

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function todayStamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }

  function fmtDateTime(ts) {
    try {
      return new Date(ts).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return new Date(ts).toISOString();
    }
  }

  Z.util = { h, append, svgEl, debounce, uid, norm, setS2T, fmtYear, fmtDates, century, download, todayStamp, fmtDateTime };
})(window.ZEN);
