(function (Z) {
  'use strict';
  const { h, svgEl } = Z.util;
  const U = Z.ui;

  const COUNTRY = { india: 'อินเดีย', china: 'จีน', japan: 'ญี่ปุ่น', korea: 'เกาหลี', vietnam: 'เวียดนาม' };
  const CHAIN_FROM = 'ananda';
  const CHAIN_TO = 'prajnatara';
  const NODE_W = 150;
  const NODE_H = 38;
  const COL_W = 190;
  const ROW_H = 48;

  function nodeCountry(id) {
    const R = Z.registry;
    const p = R.person.get(id);
    if (p) return p.country;
    // group: inherit from first person child, else parent
    const kids = R.children.get(id) || [];
    for (const k of kids) { const c = nodeCountry(k); if (c) return c; }
    const n = R.node.get(id);
    return n && n.parent ? nodeCountry(n.parent) : 'china';
  }

  function label(id) {
    const R = Z.registry;
    const p = R.person.get(id);
    if (p) return { main: Z.names.primary(p), zh: p.names.zh, p };
    const n = R.node.get(id);
    return { main: n.label.th, zh: n.label.zh || '', group: true };
  }

  /** Build the visible tree (respecting collapsed nodes and the compressed Indian chain). */
  function visibleTree(state) {
    const R = Z.registry;
    const chainIds = new Set();
    if (!state.chainOpen) {
      let cur = CHAIN_FROM;
      while (cur) { chainIds.add(cur); if (cur === CHAIN_TO) break; cur = (R.children.get(cur) || [])[0]; }
    }
    const build = (id, depth) => {
      if (id === CHAIN_FROM && !state.chainOpen) {
        const after = (R.children.get(CHAIN_TO) || [])[0];
        return { id: '__chain', chain: true, depth, children: [build(after, depth + 1)] };
      }
      const kids = state.collapsed.has(id) ? [] : (R.children.get(id) || []);
      return { id, depth, hasKids: (R.children.get(id) || []).length > 0, children: kids.map((k) => build(k, depth + 1)) };
    };
    return build(R.D.lineage.root, 0);
  }

  function layout(tree) {
    let y = 0;
    const nodes = [];
    const walk = (n) => {
      // parent aligned with its first child: chains read as rows, far less empty space
      if (!n.children.length) { n.y = y++; } else { n.children.forEach(walk); n.y = n.children[0].y; }
      n.x = n.depth;
      nodes.push(n);
    };
    walk(tree);
    return { nodes, rows: y, depth: Math.max(...nodes.map((n) => n.depth)) + 1 };
  }

  Z.views.lineage = function (params, query) {
    const R = Z.registry;
    const narrow = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches;
    const state = {
      mode: query.mode || (narrow ? 'outline' : 'tree'),
      collapsed: new Set(),
      chainOpen: false,
      country: '',
      selected: null,
      links: Z.settings.get().showSecondaryLinks,
      k: 0.8, tx: 20, ty: 20,
    };
    let schoolFocus = null;
    if (query.focus) {
      const [type, id] = query.focus.split(':');
      if (type === 'person' && R.node.has(id)) state.selected = id;
      if (type === 'school' && R.school.has(id)) { schoolFocus = id; state.selected = R.school.get(id).founder || null; }
    }
    if (state.selected && R.lineagePath(state.selected).some((x) => x !== CHAIN_TO && x === CHAIN_FROM)) state.chainOpen = true;

    const svg = svgEl('svg', { class: 'tree-svg', role: 'group', 'aria-label': 'แผนภูมิสายสืบทอด' });
    const g = svgEl('g');
    svg.appendChild(g);
    const treeBox = h('div', { class: 'tree-box glass' }, svg);
    const outline = h('div', { class: 'outline glass' });
    const detail = h('aside', { class: 'tree-detail glass', 'aria-live': 'polite' });
    const findInput = h('input', { type: 'search', class: 'input', placeholder: 'หาชื่อในแผนภูมิ…', 'aria-label': 'หาชื่อในแผนภูมิ', list: 'lineage-names' });
    const names = h('datalist', { id: 'lineage-names' }, R.D.lineage.nodes.filter((n) => R.person.has(n.id)).map((n) => h('option', { value: Z.names.primary(R.person.get(n.id)) })));

    function highlightSet() {
      const set = new Set();
      if (state.selected) R.lineagePath(state.selected).forEach((x) => set.add(x));
      if (set.has(CHAIN_FROM)) set.add('__chain');
      return set;
    }

    function dimmed(id) {
      if (schoolFocus) {
        const p = R.person.get(id);
        return !(p && (p.schools || []).includes(schoolFocus));
      }
      if (!state.country) return false;
      if (id === '__chain') return state.country !== 'india';
      return nodeCountry(id) !== state.country;
    }

    function renderTree() {
      const tree = visibleTree(state);
      const { nodes, rows, depth } = layout(tree);
      const pos = new Map(nodes.map((n) => [n.id, n]));
      const hi = highlightSet();
      g.replaceChildren();
      const W = depth * COL_W + NODE_W;
      const H = rows * ROW_H + 20;
      svg.setAttribute('viewBox', `0 0 ${treeBox.clientWidth || 900} ${treeBox.clientHeight || 600}`);
      g.dataset.w = W; g.dataset.h = H;
      // edges
      for (const n of nodes) {
        for (const c of n.children) {
          const x1 = n.x * COL_W + NODE_W; const y1 = n.y * ROW_H + NODE_H / 2 + 10;
          const x2 = c.x * COL_W; const y2 = c.y * ROW_H + NODE_H / 2 + 10;
          const mx = (x1 + x2) / 2;
          g.appendChild(svgEl('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, class: 'edge' + (hi.has(c.id) && hi.has(n.id) ? ' edge-hi' : '') + (dimmed(c.id) ? ' dim' : '') }));
        }
      }
      // secondary links
      if (state.links) {
        for (const l of R.D.lineage.links) {
          const a = pos.get(l.from); const b = pos.get(l.to);
          if (!a || !b) continue;
          const x1 = a.x * COL_W + NODE_W / 2; const y1 = a.y * ROW_H + NODE_H + 10;
          const x2 = b.x * COL_W + NODE_W / 2; const y2 = b.y * ROW_H + 10;
          const p = svgEl('path', { d: `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`, class: 'link-secondary' });
          p.appendChild(svgEl('title')).textContent = l.note || l.kind;
          g.appendChild(p);
        }
      }
      // nodes
      for (const n of nodes) {
        const x = n.x * COL_W; const y = n.y * ROW_H + 10;
        const isChain = n.chain;
        const lb = isChain ? { main: 'สังฆปริณายกองค์ที่ 2–27', zh: '西天二十六祖 (กดเพื่อขยาย)' } : label(n.id);
        const country = isChain ? 'india' : nodeCountry(n.id);
        const cls = ['node', `c-${country}`, lb.group ? 'node-group' : '', isChain ? 'node-chain' : '', hi.has(n.id) ? 'node-hi' : '', state.selected === n.id ? 'node-sel' : '', dimmed(n.id) ? 'dim' : ''].join(' ');
        const node = svgEl('g', { class: cls, transform: `translate(${x},${y})`, tabindex: '0', role: 'button', 'aria-label': `${lb.main} ${lb.zh}`, 'data-id': n.id });
        node.appendChild(svgEl('rect', { width: NODE_W, height: NODE_H, rx: 10 }));
        const t1 = svgEl('text', { x: 10, y: 16, class: 'node-main' });
        t1.textContent = lb.main.length > 17 ? lb.main.slice(0, 16) + '…' : lb.main;
        const t2 = svgEl('text', { x: 10, y: 31, class: 'node-zh' });
        t2.textContent = lb.zh.length > 14 ? lb.zh.slice(0, 13) + '…' : lb.zh;
        node.appendChild(t1); node.appendChild(t2);
        const p = R.person.get(n.id);
        if (p && p.patriarch) {
          const b = svgEl('text', { x: NODE_W - 8, y: 14, class: 'node-badge', 'text-anchor': 'end' });
          b.textContent = [p.patriarch.india ? `อ${p.patriarch.india}` : '', p.patriarch.china ? `จ${p.patriarch.china}` : ''].filter(Boolean).join('·');
          node.appendChild(b);
        }
        if (n.hasKids && !isChain) {
          const tg = svgEl('g', { class: 'node-toggle', transform: `translate(${NODE_W},${NODE_H / 2})`, 'data-toggle': n.id });
          tg.appendChild(svgEl('circle', { r: 8 }));
          const tt = svgEl('text', { 'text-anchor': 'middle', y: 4 });
          tt.textContent = state.collapsed.has(n.id) ? '+' : '−';
          tg.appendChild(tt);
          node.appendChild(tg);
        }
        g.appendChild(node);
      }
      applyTransform();
    }

    function applyTransform() { g.setAttribute('transform', `translate(${state.tx},${state.ty}) scale(${state.k})`); }

    function centerOn(id, fx, fy) {
      const n = g.querySelector(`[data-id="${CSS.escape(id)}"]`);
      if (!n) return;
      const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(n.getAttribute('transform'));
      const bw = treeBox.clientWidth || 900; const bh = treeBox.clientHeight || 600;
      state.tx = bw * (fx === undefined ? 0.5 : fx) - (Number(m[1]) + NODE_W / 2) * state.k;
      state.ty = bh * (fy === undefined ? 0.5 : fy) - (Number(m[2]) + NODE_H / 2) * state.k;
      applyTransform();
    }

    function fit() {
      const bw = treeBox.clientWidth || 900; const bh = treeBox.clientHeight || 600;
      const W = Number(g.dataset.w) || 1; const H = Number(g.dataset.h) || 1;
      state.k = Math.max(0.15, Math.min(1.2, Math.min(bw / (W + 40), bh / (H + 40))));
      state.tx = 20; state.ty = 10;
      applyTransform();
    }

    function zoom(f, cx, cy) {
      const bw = treeBox.clientWidth || 900; const bh = treeBox.clientHeight || 600;
      const px = cx === undefined ? bw / 2 : cx; const py = cy === undefined ? bh / 2 : cy;
      const k = Math.max(0.15, Math.min(2.5, state.k * f));
      state.tx = px - ((px - state.tx) * k) / state.k;
      state.ty = py - ((py - state.ty) * k) / state.k;
      state.k = k;
      applyTransform();
    }

    function select(id) {
      if (id === '__chain') { state.chainOpen = true; render(); return; }
      state.selected = id;
      renderDetail();
      if (state.mode === 'tree') renderTree(); else renderOutline();
    }

    function renderDetail() {
      const id = state.selected;
      if (schoolFocus && !id) { detail.replaceChildren(schoolCard(schoolFocus)); return; }
      if (!id) { detail.replaceChildren(h('p', { class: 'muted' }, 'เลือกชื่อในแผนภูมิเพื่อดูรายละเอียด · กด + / − ที่ขอบกล่องเพื่อยุบหรือขยายสาย')); return; }
      const n = R.node.get(id);
      const p = R.person.get(id);
      const path = R.lineagePath(id);
      const parts = [];
      if (schoolFocus) parts.push(schoolCard(schoolFocus));
      if (p) {
        parts.push(h('h2', { class: 'detail-name' }, Z.names.primary(p), ' ', h('span', { class: 'cjk', lang: 'zh-Hant' }, p.names.zh)),
          h('p', { class: 'muted small' }, [Z.util.fmtDates(p.dates), COUNTRY[p.country]].filter(Boolean).join(' · '), ' ', U.historicity(p.historicity)),
          p.names.thCommon ? h('p', { class: 'small' }, 'ชื่อที่ใช้ในไทย: ', p.names.thCommon.join(' / ')) : null,
          p.names.romaji ? h('p', { class: 'small' }, 'ญี่ปุ่น: ', p.names.romaji) : null,
          h('p', null, U.rich(p.summary)));
      } else {
        parts.push(h('h2', { class: 'detail-name' }, n.label.th), n.label.zh ? h('p', { class: 'cjk', lang: 'zh-Hant' }, n.label.zh) : null, h('p', { class: 'muted small' }, 'กล่องนี้แทนหลายรุ่นที่ไม่ได้แยกแสดงรายบุคคล'), n.note ? h('p', null, n.note) : null);
      }
      if (n.note && p) parts.push(h('p', { class: 'callout small' }, n.note));
      parts.push(h('p', { class: 'small path' }, 'เส้นทาง: ', path.slice(-6).map((x, i) => [i ? ' → ' : (path.length > 6 ? '… → ' : ''), h('a', { href: '#', on: { click: (e) => { e.preventDefault(); select(x); centerOn(x); } } }, label(x).main)])));
      const links = R.D.lineage.links.filter((l) => l.from === id || l.to === id);
      if (links.length) parts.push(h('ul', { class: 'small prose-list' }, links.map((l) => h('li', null, `${label(l.from).main} ⇢ ${label(l.to).main}: ${l.note || l.kind}`))));
      if (p) parts.push(h('a', { class: 'btn btn-primary btn-small', href: `#/people/${id}` }, U.icon('person'), h('span', null, 'ดูประวัติเต็ม')));
      detail.replaceChildren(...parts);
    }

    function schoolCard(sid) {
      const s = R.school.get(sid);
      return h('div', { class: 'school-card' }, h('p', { class: 'badge' }, 'สำนัก/สาย'), h('h2', null, s.th, ' ', h('span', { class: 'cjk', lang: 'zh-Hant' }, s.zh)), h('p', null, U.rich(s.summary)),
        U.btn('ล้างการเน้นสำนัก', () => { schoolFocus = null; render(); }, { cls: 'btn-ghost btn-small' }));
    }

    // default outline: the main line down to the Five Houses is open
    const defaultOpen = new Set([...R.lineagePath('huineng'), '__chain', 'nanyue', 'qingyuan', 'mazu', 'shitou', 'baizhang', 'huangbo', 'tianhuang', 'longtan', 'deshan', 'xuefeng', 'yaoshan', 'yunyan']);

    function renderOutline() {
      const tree = visibleTree({ ...state, collapsed: new Set() });
      const hi = highlightSet();
      const item = (n) => {
        const lb = n.chain ? { main: 'สังฆปริณายกอินเดียองค์ที่ 2–27', zh: '' } : label(n.id);
        const btn = h('button', { type: 'button', class: 'outline-node' + (hi.has(n.id) ? ' node-hi' : '') + (state.selected === n.id ? ' node-sel' : '') + (dimmed(n.id) ? ' dim' : ''), on: { click: () => select(n.id) } },
          h('span', null, lb.main), lb.zh ? h('span', { class: 'cjk small', lang: 'zh-Hant' }, ' ' + lb.zh) : null);
        if (!n.children.length) return h('li', null, btn);
        const open = n.depth < 1 || hi.has(n.id) || defaultOpen.has(n.id) || state.expandAll;
        return h('li', null, h('details', { open: open ? true : null }, h('summary', null, btn), h('ul', null, n.children.map(item))));
      };
      outline.replaceChildren(h('ul', { class: 'outline-root' }, item(tree)));
    }

    function render() {
      treeBox.hidden = state.mode !== 'tree';
      outline.hidden = state.mode !== 'outline';
      modeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
      controls.classList.toggle('mode-outline', state.mode === 'outline');
      if (state.mode === 'tree') renderTree(); else renderOutline();
      renderDetail();
    }

    // interactions
    svg.addEventListener('click', (e) => {
      const tg = e.target.closest('[data-toggle]');
      if (tg) { const id = tg.dataset.toggle; if (state.collapsed.has(id)) state.collapsed.delete(id); else state.collapsed.add(id); renderTree(); return; }
      const node = e.target.closest('[data-id]');
      if (node && !dragged) select(node.dataset.id);
    });
    svg.addEventListener('keydown', (e) => {
      const node = e.target.closest && e.target.closest('[data-id]');
      if (node && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(node.dataset.id); }
      if (e.key === '+' || e.key === '=') zoom(1.2);
      if (e.key === '-') zoom(1 / 1.2);
    });
    let drag = null;
    let dragged = false;
    svg.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, tx: state.tx, ty: state.ty }; dragged = false; });
    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x; const dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) { dragged = true; if (svg.setPointerCapture) try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      state.tx = drag.tx + dx; state.ty = drag.ty + dy; applyTransform();
    });
    const endDrag = () => { drag = null; setTimeout(() => { dragged = false; }, 0); };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    const modeBtns = [
      h('button', { type: 'button', class: 'chip-btn', dataset: { mode: 'tree' }, on: { click: () => { state.mode = 'tree'; render(); requestAnimationFrame(() => (state.selected ? centerOn(state.selected) : fit())); } } }, U.icon('tree'), ' แผนภูมิ'),
      h('button', { type: 'button', class: 'chip-btn', dataset: { mode: 'outline' }, on: { click: () => { state.mode = 'outline'; render(); } } }, U.icon('list'), ' รายการ'),
    ];
    const countryChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'กรองตามประเทศ' },
      [['', 'ทั้งหมด'], ...Object.entries(COUNTRY)].map(([k, v]) => h('button', { type: 'button', class: 'chip-btn', 'aria-pressed': String(state.country === k), dataset: { country: k }, on: { click: (e) => {
        state.country = k; schoolFocus = null;
        countryChips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.country === k)));
        render();
      } } }, v)));
    findInput.addEventListener('change', () => {
      const q = Z.util.norm(findInput.value);
      if (!q) return;
      const hit = R.D.lineage.nodes.find((n) => { const p = R.person.get(n.id); return p && Z.names.allForms(p).some((f) => Z.util.norm(f).includes(q)); });
      if (!hit) { U.toast('ไม่พบชื่อนี้ในแผนภูมิ'); return; }
      if (R.lineagePath(hit.id).includes(CHAIN_FROM) && hit.id !== CHAIN_FROM) state.chainOpen = true;
      R.lineagePath(hit.id).forEach((x) => state.collapsed.delete(x));
      select(hit.id);
      if (state.mode === 'tree') requestAnimationFrame(() => centerOn(hit.id));
      else { const el2 = outline.querySelector('.node-sel'); if (el2) el2.scrollIntoView({ block: 'center' }); }
    });

    const controls = h('div', { class: 'tree-controls' },
      h('div', { class: 'chips', role: 'group', 'aria-label': 'รูปแบบการแสดง' }, modeBtns),
      countryChips,
      h('div', { class: 'row' }, findInput, names,
        U.btn('', () => zoom(1.2), { icon: 'zoomIn', cls: 'btn-ghost btn-icon tree-only', title: 'ขยาย', aria: 'ขยาย' }),
        U.btn('', () => zoom(1 / 1.2), { icon: 'zoomOut', cls: 'btn-ghost btn-icon tree-only', title: 'ย่อ', aria: 'ย่อ' }),
        U.btn('', fit, { icon: 'fit', cls: 'btn-ghost btn-icon tree-only', title: 'พอดีกรอบ', aria: 'พอดีกรอบ' }),
        U.btn(state.chainOpen ? 'ย่อโซ่อินเดีย' : 'ขยายโซ่อินเดีย', (e) => { state.chainOpen = !state.chainOpen; e.currentTarget.querySelector('span').textContent = state.chainOpen ? 'ย่อโซ่อินเดีย' : 'ขยายโซ่อินเดีย'; render(); }, { cls: 'btn-ghost btn-small' }),
        U.btn('ยุบ/ขยายทั้งหมด', () => {
          if (state.collapsed.size) state.collapsed.clear();
          // collapse everything deeper than two generations after Huineng (path length of Huineng = 34)
          else R.D.lineage.nodes.forEach((n) => { if ((R.children.get(n.id) || []).length && R.lineagePath(n.id).length >= 36) state.collapsed.add(n.id); });
          state.expandAll = !state.expandAll;
          render();
        }, { cls: 'btn-ghost btn-small tree-only' }),
        h('label', { class: 'check small tree-only' }, h('input', { type: 'checkbox', checked: state.links ? true : null, on: { change: (e) => { state.links = e.target.checked; Z.settings.set({ showSecondaryLinks: state.links }); render(); } } }), ' ความสัมพันธ์รอง (เส้นประ)')));

    const legend = h('div', { class: 'legend small' }, Object.entries(COUNTRY).map(([k, v]) => h('span', { class: `legend-item c-${k}` }, h('i'), v)), h('span', { class: 'legend-item' }, 'อ = ลำดับสังฆปริณายกอินเดีย · จ = จีน'));

    const el = h('div', { class: 'view view-lineage' },
      U.pageHead('ประวัติและสายสืบทอด', { zh: '傳燈 ', sub: 'จากพระศากยมุนี ผ่านสังฆปริณายกอินเดีย 28 องค์และจีน 6 องค์ สู่ห้าสำนักเจ็ดสาย และสายในญี่ปุ่น เกาหลี เวียดนาม · สายช่วงต้นเป็น **ขนบ** ที่เรียบเรียงภายหลัง (ดูป้ายในรายละเอียดบุคคล)',
        actions: [h('a', { class: 'btn btn-ghost', href: '#/lineage/timeline' }, U.icon('clock'), h('span', null, 'เส้นเวลา'))] }),
      controls, legend,
      h('div', { class: 'tree-layout' }, h('div', { class: 'tree-main' }, treeBox, outline), detail));

    return {
      el,
      title: 'สายสืบทอด',
      anchor: { type: 'lineage', id: 'lineage', label: 'สายสืบทอด', route: '/lineage' },
      onMount() {
        render();
        requestAnimationFrame(() => { if (state.mode === 'tree') { if (state.selected) centerOn(state.selected); else { state.k = 0.9; centerOn('hongren', 0.18, 0.08); } } });
      },
      _state: state,
    };
  };

  Z.views.timeline = function (params, query) {
    const D = Z.registry.D;
    const REG = { india: 'อินเดีย', china: 'จีน', japan: 'ญี่ปุ่น', korea: 'เกาหลี', vietnam: 'เวียดนาม', west: 'ตะวันตก' };
    const active = new Set(Object.keys(REG));
    const grid = h('div', { class: 'timeline' });
    const events = D.timeline.slice().sort((a, b) => a.year - b.year);

    function renderGrid() {
      const regs = Object.keys(REG).filter((r) => active.has(r));
      const byCentury = new Map();
      for (const e of events) {
        if (!active.has(e.region)) continue;
        const c = Z.util.century(e.year);
        if (!byCentury.has(c)) byCentury.set(c, []);
        byCentury.get(c).push(e);
      }
      grid.style.setProperty('--cols', regs.length);
      grid.replaceChildren(
        h('div', { class: 'tl-row tl-head' }, h('div', { class: 'tl-century' }, 'ศตวรรษ'), regs.map((r) => h('div', { class: `tl-reg c-${r}` }, REG[r]))),
        ...Array.from(byCentury.entries()).map(([c, list]) => h('div', { class: 'tl-row' },
          h('div', { class: 'tl-century' }, c === 0 ? 'ก่อน ค.ศ.' : `ศ. ${c}`),
          regs.map((r) => h('div', { class: `tl-cell c-${r}`, 'data-region': REG[r] }, list.filter((e) => e.region === r).map((e) => {
            const ref = e.ref ? Z.registry.routeFromRef(e.ref) : null;
            return h('div', { class: 'tl-event' + (query.e === e.id ? ' tl-focus' : ''), id: 'tl-' + e.id },
              h('span', { class: 'tl-year' }, (e.approx ? 'ราว ' : '') + Z.util.fmtYear(e.year) + (e.yearEnd ? '–' + e.yearEnd : '')),
              h('p', null, U.rich(e.th)),
              ref && ref.route ? h('a', { class: 'link-small', href: '#' + ref.route }, '→ ' + ref.label) : null);
          }))))));
    }

    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'กรองภูมิภาค' }, Object.entries(REG).map(([k, v]) =>
      h('button', { type: 'button', class: `chip-btn c-${k}`, 'aria-pressed': 'true', on: { click: (e) => {
        if (active.has(k) && active.size > 1) active.delete(k); else active.add(k);
        e.currentTarget.setAttribute('aria-pressed', String(active.has(k)));
        renderGrid();
      } } }, v)));
    renderGrid();
    const el = h('div', { class: 'view view-timeline' },
      U.pageHead('เส้นเวลา', { zh: '年表 ', crumbs: [{ label: 'สายสืบทอด', route: '/lineage' }, { label: 'เส้นเวลา' }], sub: 'ศตวรรษที่ 5 → ปัจจุบัน แยกตามภูมิภาค · ปีที่มีคำว่า "ราว" เป็นการประมาณ' }),
      chips, grid);
    return {
      el, title: 'เส้นเวลา', anchor: { type: 'lineage', id: 'timeline', label: 'เส้นเวลา', route: '/lineage/timeline' },
      onMount() { if (query.e) { const t = document.getElementById('tl-' + query.e); if (t) t.scrollIntoView({ block: 'center' }); } },
    };
  };
})(window.ZEN);
