(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;

  const NAV = [
    { route: '/lineage', label: 'สายสืบทอด', icon: 'tree', match: /^\/lineage/ },
    { route: '/texts', label: 'คัมภีร์', icon: 'book', match: /^\/texts/ },
    { route: '/koans', label: 'โกอาน', icon: 'koan', match: /^\/koans/ },
    { route: '/people', label: 'บุคคล', icon: 'person', match: /^\/people/ },
    { route: '/practice', label: 'การปฏิบัติ', icon: 'lotus', match: /^\/practice/ },
    { route: '/glossary', label: 'ศัพท์', icon: 'glossary', match: /^\/glossary/ },
    { route: '/theravada', label: 'เทียบเถรวาท', icon: 'compare', match: /^\/theravada/ },
  ];
  const TOOLS = [
    { route: '/quiz', label: 'แบบทดสอบ', icon: 'quiz', match: /^\/quiz/ },
    { route: '/progress', label: 'ความคืบหน้า', icon: 'progress', match: /^\/progress/ },
    { route: '/notes', label: 'โน้ตทั้งหมด', icon: 'note', match: /^\/notes/ },
  ];
  const LAYERS = [
    { key: 'zh', short: '漢', label: '漢字 (ต้นฉบับ)', lang: 'zh-Hant' },
    { key: 'pinyin', short: 'pīn', label: 'พินอิน' },
    { key: 'romaji', short: 'rō', label: 'โรมาจิ (เสียงอ่านญี่ปุ่น)' },
    { key: 'th', short: 'ไทย', label: 'ถอดความไทย' },
  ];

  const els = {};

  function navLinks(list, cls) {
    return list.map((n) => h('a', { href: '#' + n.route, class: 'nav-link ' + (cls || ''), dataset: { route: n.route } }, U.icon(n.icon), h('span', null, n.label)));
  }

  function layerToggles() {
    const s = Z.settings.get();
    return h('div', { class: 'layer-toggles', role: 'group', 'aria-label': 'ชั้นการแสดงผล' },
      LAYERS.map((l) => h('button', {
        type: 'button', class: 'layer-btn', dataset: { layer: l.key }, title: l.label, 'aria-label': 'แสดง ' + l.label,
        'aria-pressed': String(!!s.layers[l.key]), lang: l.lang || null,
        on: { click: () => { if (!Z.settings.toggleLayer(l.key)) U.toast('ต้องเปิดอย่างน้อยหนึ่งชั้น'); } },
      }, l.short)));
  }

  function syncToggles() {
    const s = Z.settings.get();
    document.querySelectorAll('.layer-btn').forEach((b) => b.setAttribute('aria-pressed', String(!!s.layers[b.dataset.layer])));
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) { themeBtn.replaceChildren(U.icon(s.theme === 'dark' ? 'sun' : 'moon')); }
  }

  function searchForm(id) {
    const input = h('input', { type: 'search', id, class: 'search-input', placeholder: 'ค้นหา เช่น 無, เว่ยหล่าง, ศูนยตา', 'aria-label': 'ค้นหาทั้งแอป', autocomplete: 'off' });
    return h('form', { class: 'search-form', role: 'search', on: { submit: (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { closeMenu(); Z.router.go('/search', { q }); } } } },
      U.icon('search', 'search-icon'), input);
  }

  function openMenu() { document.body.classList.add('menu-open'); els.menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { document.body.classList.remove('menu-open'); if (els.menuBtn) els.menuBtn.setAttribute('aria-expanded', 'false'); }

  function mount(root) {
    els.menuBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-icon menu-btn', 'aria-label': 'เมนู', 'aria-expanded': 'false', 'aria-controls': 'drawer', on: { click: () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()) } }, U.icon('menu'));

    const topbar = h('header', { class: 'topbar glass-strong' },
      h('div', { class: 'topbar-row' },
        els.menuBtn,
        h('a', { href: '#/', class: 'brand', 'aria-label': 'หน้าแรก Zen Study Companion' },
          h('span', { class: 'brand-mark cjk', lang: 'zh-Hant' }, '禪'),
          h('span', { class: 'brand-text' }, h('strong', null, 'Zen Study Companion'), h('small', null, 'ฉาน · เซน · ซอน · เทียน'))),
        h('nav', { class: 'nav-main', 'aria-label': 'หมวดหลัก' }, navLinks(NAV)),
        h('div', { class: 'topbar-tools' },
          searchForm('global-search'),
          layerToggles(),
          Z.ttsBar.rateControl(),
          h('button', { type: 'button', id: 'theme-btn', class: 'btn btn-ghost btn-icon', title: 'สลับธีมสว่าง/มืด', 'aria-label': 'สลับธีม', on: { click: () => Z.settings.set({ theme: Z.settings.get().theme === 'dark' ? 'light' : 'dark' }) } }, U.icon('moon')),
          U.btn('', () => Z.dialogs.settings(), { icon: 'settings', cls: 'btn-ghost btn-icon', title: 'ตั้งค่า', aria: 'ตั้งค่า' }))));

    const drawer = h('div', { id: 'drawer', class: 'drawer glass-strong' },
      searchForm('drawer-search'),
      h('nav', { 'aria-label': 'หมวดหลัก (เมนู)' }, h('p', { class: 'drawer-label' }, 'หมวดเนื้อหา'), navLinks(NAV, 'drawer-link'), h('p', { class: 'drawer-label' }, 'เครื่องมือ'), navLinks(TOOLS, 'drawer-link')),
      h('div', { class: 'drawer-toggles' }, h('p', { class: 'drawer-label' }, 'ชั้นการแสดงผล'), layerToggles()));
    drawer.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    const scrim = h('div', { class: 'scrim', on: { click: closeMenu } });

    els.warning = h('div', { id: 'storage-warning', class: 'storage-warning', role: 'alert', hidden: true },
      '⚠ เบราว์เซอร์ไม่อนุญาตให้บันทึกข้อมูล (localStorage) — โน้ตและความคืบหน้าจะหายเมื่อปิดหน้า กรุณา Export เก็บไว้',
      U.btn('Export', () => Z.dialogs.io(), { cls: 'btn-small' }));

    els.main = h('main', { id: 'main', class: 'reader', tabindex: '-1' });
    els.notes = h('aside', { id: 'notes-pane', class: 'notes-pane glass', 'aria-label': 'โน้ต' });
    els.workspace = h('div', { class: 'workspace', dataset: { tab: 'read' } }, els.main, els.notes);

    els.tabRead = h('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': 'true', on: { click: () => setTab('read') } }, U.icon('book'), h('span', null, 'อ่าน'));
    els.noteCount = h('span', { class: 'tab-count' });
    els.tabNotes = h('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': 'false', on: { click: () => setTab('notes') } }, U.icon('note'), h('span', null, 'โน้ต'), els.noteCount);
    const tabs = h('nav', { class: 'mobile-tabs glass-strong', role: 'tablist', 'aria-label': 'สลับอ่าน/โน้ต' }, els.tabRead, els.tabNotes);

    els.notesFab = h('button', { type: 'button', class: 'notes-fab btn btn-primary', 'aria-label': 'เปิด/ปิดแผงโน้ต', on: { click: toggleNotes } }, U.icon('note'), h('span', null, 'โน้ต'));

    els.tts = Z.ttsBar.create();

    root.replaceChildren(
      h('a', { href: '#main', class: 'skip-link', on: { click: (e) => { e.preventDefault(); els.main.focus(); } } }, 'ข้ามไปเนื้อหา'),
      topbar, els.warning, drawer, scrim, els.workspace, els.tts, els.notesFab, tabs,
      h('footer', { class: 'site-foot' }, 'ตัวบท 漢文 จาก CBETA (CC BY-NC-SA 4.0) · ข้อความญี่ปุ่นของโดเก็นยกอ้างจาก SAT DB · ถอดความและเนื้อหาเขียนโดยโปรเจกต์ · ', h('a', { href: '#/about' }, 'เกี่ยวกับ / ลิขสิทธิ์')));

    Z.notesPanel.mount(els.notes);
    Z.bus.on('settings', syncToggles);
    Z.bus.on('storage:unavailable', () => { els.warning.hidden = false; });
    if (!Z.store.isAvailable()) els.warning.hidden = false;
    Z.bus.on('notes:count', (n) => { els.noteCount.textContent = n ? String(n) : ''; });
    syncToggles();
    return els;
  }

  function setTab(tab) {
    els.workspace.dataset.tab = tab;
    els.tabRead.setAttribute('aria-selected', String(tab === 'read'));
    els.tabNotes.setAttribute('aria-selected', String(tab === 'notes'));
    if (tab === 'notes') { const f = els.notes.querySelector('textarea, input'); if (f) f.focus({ preventScroll: true }); }
  }

  function toggleNotes() {
    const wide = window.matchMedia && window.matchMedia('(min-width: 1024px)').matches;
    document.body.classList.toggle(wide ? 'notes-collapsed' : 'notes-open');
  }

  function setActive(path) {
    document.querySelectorAll('.nav-link').forEach((a) => {
      const item = NAV.concat(TOOLS).find((n) => n.route === a.dataset.route);
      const on = item && item.match.test(path);
      a.classList.toggle('active', !!on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  Z.layout = { mount, setActive, setTab, closeMenu, toggleNotes, els, NAV, TOOLS, LAYERS };
})(window.ZEN);
