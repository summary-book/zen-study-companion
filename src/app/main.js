(function (Z) {
  'use strict';
  const { h } = Z.util;
  let current = null;

  function registerRoutes() {
    const r = Z.router.add;
    r('/', 'home');
    r('/lineage', 'lineage');
    r('/lineage/timeline', 'timeline');
    r('/texts', 'texts');
    r('/texts/:text', 'text');
    r('/texts/:text/:chapter', 'chapter');
    r('/koans', 'koans');
    r('/koans/:collection', 'collection');
    r('/koans/:collection/:no', 'koan');
    r('/people', 'people');
    r('/people/:id', 'person');
    r('/practice', 'practiceList');
    r('/practice/:id', 'practice');
    r('/glossary', 'glossary');
    r('/glossary/:id', 'term');
    r('/theravada', 'theravadaList');
    r('/theravada/:id', 'theravada');
    r('/quiz', 'quizHome');
    r('/quiz/:scope', 'quizRun');
    r('/search', 'search');
    r('/progress', 'progress');
    r('/notes', 'notes');
    r('/about', 'about');
  }

  function render() {
    const route = Z.router.current();
    const main = Z.layout.els.main;
    if (current && typeof current.destroy === 'function') { try { current.destroy(); } catch (e) { console.error(e); } }
    Z.tts.stop();
    let result;
    try {
      const view = Z.views[route.view] || Z.views.notfound;
      result = view(route.params, route.query) || Z.views.notfound();
    } catch (err) {
      console.error('[render]', route.path, err);
      result = { el: h('div', { class: 'view' }, Z.ui.pageHead('เกิดข้อผิดพลาดในการแสดงผล', { sub: String(err && err.message ? err.message : err) }), h('a', { class: 'btn btn-primary', href: '#/' }, 'กลับหน้าแรก')), title: 'ข้อผิดพลาด', anchor: { type: 'general', label: 'ทั่วไป' } };
    }
    current = result;
    main.replaceChildren(result.el);
    document.title = `${result.title} · Zen Study Companion`;
    Z.layout.setActive(route.path);
    Z.layout.closeMenu();
    Z.notesPanel.setAnchor(result.anchor);
    Z.ttsBar.refresh(!!result.tts);
    if (typeof window.scrollTo === 'function') try { window.scrollTo(0, 0); } catch (e) { /* jsdom */ }
    if (typeof result.onMount === 'function') { try { result.onMount(); } catch (e) { console.error('[mount]', e); } }
    afterRender(route.query, main);
    try { main.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    Z.bus.emit('route', route);
  }

  function afterRender(query, main) {
    let target = null;
    if (query.p) {
      target = document.getElementById('p-' + query.p);
      if (target) target.classList.add('flash');
    }
    if (query.hl) {
      const n = Z.ui.highlight(main, query.hl);
      if (n) {
        const first = (target && target.querySelector('mark.hl')) || main.querySelector('mark.hl');
        if (first) target = first;
        const bar = h('div', { class: 'hl-bar glass-strong', role: 'status' }, `ไฮไลต์ "${query.hl}" ${n} แห่ง `,
          Z.ui.btn('ล้าง', () => { Z.ui.clearHighlight(main); bar.remove(); }, { cls: 'btn-ghost btn-small' }));
        main.prepend(bar);
      }
    }
    if (target && target.scrollIntoView) setTimeout(() => target.scrollIntoView({ block: 'center' }), 30);
  }

  function boot() {
    const D = window.ZEN_DATA;
    if (!D) return; // unpacking failed — src/boot/unpack-data.js has already shown the message
    Z.store.migrate();
    Z.settings.load();
    Z.registry.build(D);
    Z.settings.apply();
    registerRoutes();
    Z.layout.mount(document.getElementById('app'));
    Z.bus.on('settings', (s) => { if (Z._lastNameMode !== s.nameMode) { Z._lastNameMode = s.nameMode; Z.search.invalidate(); render(); } });
    Z._lastNameMode = Z.settings.get().nameMode;
    Z.bus.on('route:refresh', render);
    window.addEventListener('hashchange', render);
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) {
        e.preventDefault();
        const s = document.getElementById('global-search');
        if (s && s.offsetParent !== null) s.focus(); else { document.body.classList.add('menu-open'); const d = document.getElementById('drawer-search'); if (d) d.focus(); }
      }
    });
    render();
    document.documentElement.classList.add('ready');
  }

  Z.render = render;
  Z.boot = boot;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.ZEN);
