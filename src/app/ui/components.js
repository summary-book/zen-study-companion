(function (Z) {
  'use strict';
  const { h } = Z.util;

  // ── Icons (inline SVG, stroke = currentColor) ─────────────────
  const ICONS = {
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5-5',
    note: 'M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5',
    play: 'M8 5v14l11-7z',
    pause: 'M8 5v14M16 5v14',
    stop: 'M6 6h12v12H6z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    x: 'M6 6l12 12M18 6 6 18',
    check: 'M5 12l5 5L20 7',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5',
    tree: 'M12 3v18M12 8l-6 4M12 8l6 4M6 12v4M18 12v4',
    koan: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5v5m0 3v.5',
    person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0',
    lotus: 'M12 20c-4 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-4 7-8 7zM12 17c-2-3-2-7 0-11 2 4 2 8 0 11z',
    glossary: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h3',
    compare: 'M8 4v16M16 4v16M4 8h4M16 16h4',
    quiz: 'M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V14m0 3v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    progress: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-3 2-1-2-4-2 1-2-1V5h-4v2l-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1v2h4v-2l2-1 2 1 2-4-2-1z',
    speaker: 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12',
    left: 'M15 5l-7 7 7 7',
    right: 'M9 5l7 7-7 7',
    plus: 'M12 5v14M5 12h14',
    edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
    download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
    upload: 'M12 20V9m-5 5 5-5 5 5M5 4h14',
    home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
    moon: 'M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5',
    zoomIn: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5-5M8 11h6M11 8v6',
    zoomOut: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5-5M8 11h6',
    fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 3',
  };

  function icon(name, cls) {
    const svg = Z.util.svgEl('svg', { viewBox: '0 0 24 24', class: 'icon ' + (cls || ''), 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    svg.appendChild(Z.util.svgEl('path', { d: ICONS[name] || ICONS.note }));
    return svg;
  }

  // ── Rich text ───────────────────────────────────────────────
  const INLINE = /(\*\*[^*]+\*\*|\[\[\w+:[^\]|]+(?:\|[^\]]*)?\]\])/g;

  /** Render inline markup safely (text nodes only; links are generated, never raw HTML). */
  function rich(str) {
    const frag = document.createDocumentFragment();
    const s = String(str || '');
    let last = 0;
    for (const m of s.matchAll(INLINE)) {
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      const tok = m[0];
      if (tok.startsWith('**')) frag.appendChild(h('strong', null, tok.slice(2, -2)));
      else frag.appendChild(refLink(tok));
      last = m.index + tok.length;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    return frag;
  }

  function refLink(tok) {
    const m = tok.match(/^\[\[(\w+):([^\]|]+)(?:\|([^\]]*))?\]\]$/);
    const [, type, id, label] = m;
    const r = Z.registry.resolve(type, id);
    if (type === 'source') {
      const s = r.source;
      return h('cite', { class: 'cite', title: s ? Z.registry.fullCite(s) : id, tabindex: '0' }, label || r.label);
    }
    if (!r.exists || !r.route) return h('span', { class: 'ref-missing', title: 'ยังไม่มีเนื้อหานี้ในแอป' }, label || r.label);
    return h('a', { href: '#' + r.route, class: `ref ref-${type}` }, label || r.label);
  }

  function blocks(list, opts) {
    const wrap = h('div', { class: 'prose' });
    for (const b of list || []) {
      if (typeof b === 'string') {
        if (b.startsWith('## ')) wrap.appendChild(h('h3', { class: 'prose-h' }, rich(b.slice(3))));
        else wrap.appendChild(h('p', null, rich(b)));
      } else if (b && b.list) {
        wrap.appendChild(h('ul', { class: 'prose-list' }, b.list.map((li) => h('li', null, rich(li)))));
      } else if (b && b.note) {
        wrap.appendChild(h('div', { class: 'callout' }, rich(b.note)));
      } else if (b && (b.zh || b.ja)) {
        wrap.appendChild(passage(b, opts));
      }
    }
    return wrap;
  }

  // ── Passages (multi-layer original text) ─────────────────────
  const LAYER_BADGE = { source: null, commentary: 'อรรถาธิบายดั้งเดิม' };

  /** Digital edition a work was taken from: 'CBETA' unless its source entry says otherwise (e.g. 'SAT'). */
  function editionOf(work) {
    const s = Z.registry.source && Z.registry.source.get(work);
    return (s && s.edition) || 'CBETA';
  }

  function passage(p, opts) {
    const o = opts || {};
    const isJa = !!p.ja && !p.zh;
    const el = h('div', { class: `passage layer-${p.layer || 'source'}`, id: 'p-' + p.id, dataset: { pid: p.id } });
    const meta = h('div', { class: 'passage-meta' });
    if (p.label) meta.appendChild(h('span', { class: 'badge badge-label' }, p.label));
    if (o.layerLabel) meta.appendChild(h('span', { class: 'badge badge-layer' }, o.layerLabel));
    else if (LAYER_BADGE[p.layer]) meta.appendChild(h('span', { class: 'badge badge-layer' }, LAYER_BADGE[p.layer]));
    if (p.speaker) {
      const r = Z.registry.resolve('person', p.speaker);
      meta.appendChild(h('a', { class: 'badge badge-speaker', href: '#' + r.route }, r.label));
    }
    if (p.verify === 'draft') meta.appendChild(h('span', { class: 'badge badge-draft', title: 'ตัวบทนี้ยังไม่ได้ทานกับต้นฉบับ' }, 'ยังไม่ได้ทานกับต้นฉบับ'));
    if (p.notesOmitted) meta.appendChild(h('span', { class: 'badge badge-omit', title: 'ละคำแทรกขนาดเล็ก (著語) ที่มีในต้นฉบับ' }, 'ละ著語'));
    if (Z.tts && Z.tts.supported() && o.speak !== false) {
      meta.appendChild(h('button', { type: 'button', class: 'passage-speak', title: 'ฟังข้อความนี้ (ต้นฉบับ แล้วถอดความ)', 'aria-label': 'ฟังข้อความนี้', on: { click: () => { Z.ttsBar.refresh(true); Z.tts.playPassage(el); } } }, icon('speaker'), h('span', null, 'ฟัง')));
    }
    if (meta.childNodes.length) el.appendChild(meta);

    el.appendChild(h('div', { class: 'layer-zh cjk', lang: isJa ? 'ja' : 'zh-Hant' }, p.zh || p.ja));
    if (p.pinyin && !isJa) el.appendChild(h('div', { class: 'layer-pinyin', lang: 'zh-Latn-pinyin' }, p.pinyin));
    if (p.romaji) el.appendChild(h('div', { class: 'layer-romaji', lang: 'ja-Latn' }, p.romaji));
    if (p.th) el.appendChild(h('div', { class: 'layer-th', lang: 'th' }, h('span', { class: 'th-tag' }, 'ถอดความ'), rich(p.th)));
    if (p.src && o.showSource !== false) {
      const [work, lb] = p.src.split(':');
      // CBETA line ids look like T48n2003_p0140a17; SAT line ids (Taishō vols. 56–84) are bare 0023b27
      const loc = lb ? lb.replace(/^[A-Z]\d+n\d+[A-Z]?_/, '').replace(/^(\d{4}[a-c]\d{2})$/, 'p$1') : '';
      const ed = editionOf(work);
      el.appendChild(h('div', { class: 'passage-src' }, `${work}${loc ? ' · ' + loc : ''}${p.verify === 'checked' ? ` · ${ed === 'SAT' ? 'ยกอ้างตรงตาม SAT' : 'ตรงกับ ' + ed}` : ''}`));
    }
    return el;
  }

  // ── Small pieces ─────────────────────────────────────────────
  const HIST = {
    traditional: ['ตามขนบ', 'ข้อมูลส่วนใหญ่มาจากเรื่องเล่าตามขนบ ไม่มีหลักฐานร่วมสมัย'],
    historical: ['ประวัติศาสตร์', 'มีหลักฐานทางประวัติศาสตร์ค่อนข้างชัดเจน'],
    disputed: ['มีข้อถกเถียง', 'ข้อมูลตามขนบกับหลักฐานทางประวัติศาสตร์ไม่ตรงกัน'],
  };
  function historicity(val) {
    const [label, title] = HIST[val] || HIST.traditional;
    return h('span', { class: `badge badge-hist hist-${val}`, title }, label);
  }

  function badge(text, cls) { return h('span', { class: 'badge ' + (cls || '') }, text); }

  function progressBar(pct, label) {
    return h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': label || 'ความคืบหน้า' },
      h('div', { class: 'progress-fill', style: { width: pct + '%' } }));
  }

  function pageHead(title, opts) {
    const o = opts || {};
    return h('header', { class: 'page-head' },
      o.crumbs ? h('nav', { class: 'crumbs', 'aria-label': 'ตำแหน่ง' }, o.crumbs.map((c, i) => [i ? h('span', { class: 'crumb-sep' }, '›') : null, c.route ? h('a', { href: '#' + c.route }, c.label) : h('span', null, c.label)])) : null,
      h('h1', { class: 'page-title' }, o.zh ? h('span', { class: 'cjk title-zh', lang: 'zh-Hant' }, o.zh) : null, title),
      o.sub ? h('p', { class: 'page-sub' }, typeof o.sub === 'string' ? rich(o.sub) : o.sub) : null,
      o.actions ? h('div', { class: 'page-actions' }, o.actions) : null);
  }

  function section(title, content, opts) {
    const o = opts || {};
    return h('section', { class: 'section glass ' + (o.cls || ''), id: o.id || null },
      title ? h('h2', { class: 'section-title' }, title) : null, content);
  }

  function btn(label, onClick, opts) {
    const o = opts || {};
    return h('button', { type: 'button', class: 'btn ' + (o.cls || ''), title: o.title || null, 'aria-label': o.aria || (typeof label === 'string' ? null : o.title), 'aria-pressed': o.pressed === undefined ? null : String(!!o.pressed), disabled: o.disabled || null, on: { click: onClick } },
      o.icon ? icon(o.icon) : null, label ? h('span', { class: o.icon ? 'btn-label' : null }, label) : null);
  }

  function empty(msg) { return h('div', { class: 'empty' }, icon('lotus', 'empty-icon'), h('p', null, msg)); }

  function personChip(id) {
    const p = Z.registry.person.get(id);
    if (!p) return null;
    return h('a', { class: 'chip chip-person', href: `#/people/${id}` }, h('span', { class: 'cjk', lang: 'zh-Hant' }, p.names.zh), ' ', Z.names.primary(p));
  }

  // ── Modal / confirm / toast ─────────────────────────────────
  let lastFocus = null;
  function modal({ title, body, actions, onClose }) {
    lastFocus = document.activeElement;
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); if (onClose) onClose(); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const dialog = h('div', { class: 'modal glass-strong', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal-head' }, h('h2', null, title), btn('', close, { icon: 'x', cls: 'btn-ghost btn-icon', title: 'ปิด', aria: 'ปิด' })),
      h('div', { class: 'modal-body' }, body),
      actions ? h('div', { class: 'modal-actions' }, actions(close)) : null);
    const overlay = h('div', { class: 'overlay', on: { click: (e) => { if (e.target === overlay) close(); } } }, dialog);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    const f = dialog.querySelector('input, textarea, select, button.btn-primary') || dialog.querySelector('button');
    if (f) f.focus();
    return { close, el: dialog };
  }

  function confirmDialog(message, okLabel) {
    return new Promise((resolve) => {
      let answered = false;
      modal({
        title: 'ยืนยัน',
        body: h('p', null, message),
        actions: (close) => [
          btn('ยกเลิก', () => { answered = true; close(); resolve(false); }, { cls: 'btn-ghost' }),
          btn(okLabel || 'ยืนยัน', () => { answered = true; close(); resolve(true); }, { cls: 'btn-danger' }),
        ],
        onClose: () => { if (!answered) resolve(false); },
      });
    });
  }

  function toast(msg, kind) {
    let host = document.getElementById('toasts');
    if (!host) { host = h('div', { id: 'toasts', class: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(host); }
    const t = h('div', { class: 'toast ' + (kind || '') }, msg);
    host.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  /** Highlight query matches inside a root element (text nodes only). */
  function highlight(root, q) {
    if (!root || !q) return 0;
    const needle = q.toLowerCase();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && !n.parentElement.closest('mark, script, style, button, input, textarea') && n.nodeValue.toLowerCase().includes(needle) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0;
    for (const node of nodes) {
      const text = node.nodeValue;
      const lower = text.toLowerCase();
      const frag = document.createDocumentFragment();
      let i = 0;
      let j;
      while ((j = lower.indexOf(needle, i)) >= 0) {
        if (j > i) frag.appendChild(document.createTextNode(text.slice(i, j)));
        frag.appendChild(h('mark', { class: 'hl' }, text.slice(j, j + needle.length)));
        i = j + needle.length;
        count++;
      }
      if (i < text.length) frag.appendChild(document.createTextNode(text.slice(i)));
      node.parentNode.replaceChild(frag, node);
    }
    return count;
  }

  function clearHighlight(root) {
    (root || document).querySelectorAll('mark.hl').forEach((m) => m.replaceWith(document.createTextNode(m.textContent)));
    (root || document).normalize && (root || document.body).normalize();
  }

  Z.ui = Object.assign(Z.ui || {}, { icon, rich, blocks, passage, historicity, badge, progressBar, pageHead, section, btn, empty, personChip, modal, confirmDialog, toast, highlight, clearHighlight });
})(window.ZEN);
