(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  const CATEGORY = { sutra: 'พระสูตร', verse: 'บทกวี/จารึก', record: 'บันทึกคำสอน', japanese: 'งานญี่ปุ่น' };
  const KIND = { primary: 'ต้นฉบับ', digital: 'ฉบับดิจิทัล', translation: 'ฉบับแปล (มีลิขสิทธิ์ — อ้างอิงเท่านั้น)', study: 'งานศึกษา', reference: 'อ้างอิง' };

  function readToggle(key, onChange) {
    const b = h('button', { type: 'button', class: 'btn btn-small read-toggle' });
    const sync = () => {
      const on = Z.progress.isRead(key);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('btn-primary', on);
      b.classList.toggle('btn-ghost', !on);
      b.replaceChildren(U.icon('check'), h('span', null, on ? 'อ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว'));
    };
    b.addEventListener('click', () => { Z.progress.toggle(key); sync(); if (onChange) onChange(); });
    sync();
    return b;
  }

  function noteHere() {
    return U.btn('จดโน้ตที่นี่', () => {
      if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) Z.layout.setTab('notes');
      else { document.body.classList.remove('notes-collapsed'); document.body.classList.add('notes-open'); }
      const t = document.querySelector('#notes-pane textarea');
      if (t) t.focus();
    }, { icon: 'note', cls: 'btn-ghost btn-small' });
  }

  function sourceItem(src, note) {
    const s = Z.registry.source.get(src);
    if (!s) return null;
    return h('li', { class: 'source-item' },
      h('span', { class: `badge kind-${s.kind}` }, KIND[s.kind] || s.kind), ' ',
      h('span', null, Z.registry.fullCite(s)),
      s.license ? h('span', { class: 'muted small' }, ` · ${s.license}`) : null,
      s.url ? [' · ', h('a', { href: s.url, target: '_blank', rel: 'noopener', class: 'link-small' }, 'ลิงก์')] : null,
      note ? h('div', { class: 'muted small' }, U.rich(note)) : s.note ? h('div', { class: 'muted small' }, U.rich(s.note)) : null);
  }

  Z.views.texts = function () {
    const D = Z.registry.D;
    const upcoming = D.meta.upcoming || [];
    const el = h('div', { class: 'view view-texts' },
      U.pageHead('คัมภีร์หลัก', { zh: '經錄 ', sub: 'อ่านทีละบท: ต้นฉบับ 漢文 (จาก CBETA) หรือญี่ปุ่นโบราณ (ยกอ้างจาก SAT) · พินอิน · โรมาจิ · ถอดความไทย — สลับชั้นได้ที่แถบบน' }),
      h('div', { class: 'card-grid' }, D.texts.map((t) => {
        const st = Z.progress.textStats(t);
        return h('a', { class: 'card glass text-card', href: `#/texts/${t.id}` },
          h('div', { class: 'card-head' }, h('span', { class: 'card-zh cjk big', lang: t.lang === 'ja' ? 'ja' : 'zh-Hant' }, t.titles.zh)),
          h('h2', { class: 'card-title' }, t.short),
          h('p', { class: 'muted small' }, t.titles.th),
          h('p', { class: 'small' }, `${CATEGORY[t.category] || ''} · ${t.chapters.length} บท`),
          U.progressBar(st.pct, `อ่านแล้ว ${st.pct}%`), h('p', { class: 'small muted' }, `อ่านแล้ว ${st.done}/${st.total} บท (${st.pct}%)`));
      })),
      upcoming.length ? U.section('จะเพิ่มในรุ่นถัดไป', h('ul', { class: 'upcoming' }, upcoming.filter((u) => u.kind === 'text').map((u) => h('li', null, h('span', { class: 'cjk', lang: 'zh-Hant' }, u.zh), ' ', u.th, ' ', U.badge(`Phase ${u.phase}`, 'badge-phase'))))) : null);
    return { el, title: 'คัมภีร์หลัก', anchor: { type: 'texts', id: 'texts', label: 'คัมภีร์ (ทั่วไป)', route: '/texts' } };
  };

  Z.views.text = function (params) {
    const R = Z.registry;
    const t = R.text.get(params.text);
    if (!t) return Z.views.notfound();
    const st = Z.progress.textStats(t);
    const toc = [['history', 'ประวัติที่มา'], ['author', 'ผู้แต่ง/ผู้บันทึก'], ['chapters', 'สรุปทีละบท'], ['key', 'ข้อความสำคัญ'], ['people', 'บุคคลในคัมภีร์'], ['further', 'ศึกษาต่อ']];
    const titles = [t.titles.ja && `ญี่ปุ่น ${t.titles.ja}${t.titles.romaji ? ' ' + t.titles.romaji : ''}`, t.titles.sa && `สันสกฤต ${t.titles.sa}`, t.titles.en && `อังกฤษ ${t.titles.en}`].filter(Boolean).join(' · ');
    const firstPara = (blocks) => { const s = (blocks || []).find((b) => typeof b === 'string' && !b.startsWith('## ')); return s || ''; };
    const keyPassages = (t.keyPassages || []).map((pid) => {
      for (const c of t.chapters) {
        const p = (c.passages || []).find((x) => x.id === pid);
        if (p) return h('div', { class: 'key-passage' }, U.passage(p), h('a', { class: 'link-small', href: Z.router.href(`/texts/${t.id}/${c.id}`, { p: pid }) }, `→ ${c.title.th}`));
      }
      return null;
    });
    const el = h('div', { class: 'view view-text' },
      U.pageHead(t.short, {
        zh: t.titles.zh + ' ',
        crumbs: [{ label: 'คัมภีร์', route: '/texts' }, { label: t.short }],
        sub: h('span', null, t.titles.th, titles ? h('span', { class: 'muted small' }, ' · ' + titles) : null),
        actions: [h('a', { class: 'btn btn-primary', href: `#/texts/${t.id}/${t.chapters[0].id}` }, U.icon('book'), h('span', null, 'เริ่มอ่านบทแรก')), noteHere()],
      }),
      h('div', { class: 'glass text-progress' }, U.progressBar(st.pct), h('span', { class: 'small' }, `อ่านแล้ว ${st.done}/${st.total} บท (${st.pct}%)`), h('span', { class: 'small muted' }, ' · ต้นฉบับ: ', U.rich(`[[source:${t.sourceId}]]`), ` via ${(Z.registry.source.get(t.sourceId) || {}).edition || 'CBETA'}`)),
      h('nav', { class: 'toc chips', 'aria-label': 'สารบัญ' }, toc.map(([id, l], i) => h('a', { class: 'chip-btn', href: '#', on: { click: (e) => { e.preventDefault(); const s = document.getElementById('sec-' + id); if (s) s.scrollIntoView({ behavior: 'smooth' }); } } }, `${i + 1}. ${l}`))),
      U.section('① ประวัติที่มา', U.blocks(t.about.history), { id: 'sec-history' }),
      U.section('② ผู้แต่ง / ผู้บันทึก', U.blocks(t.about.author), { id: 'sec-author' }),
      U.section('③ สรุปทีละบท', h('ol', { class: 'chapter-list' }, t.chapters.map((c) => h('li', { class: 'chapter-item' + (Z.progress.isRead(`chapter:${t.id}/${c.id}`) ? ' is-read' : '') },
        h('a', { href: `#/texts/${t.id}/${c.id}`, class: 'chapter-link' }, c.title.zh ? h('span', { class: 'cjk', lang: t.lang === 'ja' ? 'ja' : 'zh-Hant' }, c.title.zh + ' ') : null, h('strong', null, c.title.th)),
        Z.progress.isRead(`chapter:${t.id}/${c.id}`) ? U.badge('อ่านแล้ว', 'badge-read') : null,
        h('p', { class: 'small' }, U.rich(firstPara(c.summary)))))), { id: 'sec-chapters' }),
      U.section('④ ข้อความสำคัญ', keyPassages.length ? h('div', null, keyPassages) : U.empty('ยังไม่ได้เลือกข้อความสำคัญ'), { id: 'sec-key' }),
      U.section('⑤ บุคคลในคัมภีร์', h('div', { class: 'chips' }, (t.people || []).map(U.personChip)), { id: 'sec-people' }),
      U.section('⑥ ศึกษาต่อ', h('ul', { class: 'source-list' }, [sourceItem(t.sourceId), sourceItem(isSat(t) ? 'sat' : 'cbeta'), ...(t.furtherReading || []).map((f) => sourceItem(f.sourceId, f.note))]), { id: 'sec-further' }));
    return { el, title: t.short, anchor: { type: 'text', id: t.id, label: t.short, route: `/texts/${t.id}` }, tts: true };
  };

  /** Texts quoted from the SAT database (Taishō vols. 56–84) rather than taken whole from CBETA. */
  function isSat(t) { return ((Z.registry.source.get(t.sourceId) || {}).edition) === 'SAT'; }

  Z.views.chapter = function (params, query) {
    const R = Z.registry;
    const entry = R.chapter.get(`${params.text}/${params.chapter}`);
    if (!entry) return Z.views.notfound();
    const { text: t, chapter: c, index } = entry;
    const prev = t.chapters[index - 1];
    const next = t.chapters[index + 1];
    const key = `chapter:${t.id}/${c.id}`;
    const nav = () => h('nav', { class: 'pager', 'aria-label': 'บทก่อนหน้า/ถัดไป' },
      prev ? h('a', { class: 'btn btn-ghost', href: `#/texts/${t.id}/${prev.id}`, rel: 'prev' }, U.icon('left'), h('span', null, prev.title.th)) : h('span'),
      h('span', { class: 'muted small' }, `บทที่ ${index + 1} / ${t.chapters.length}`),
      next ? h('a', { class: 'btn btn-ghost', href: `#/texts/${t.id}/${next.id}`, rel: 'next' }, h('span', null, next.title.th), U.icon('right')) : h('span'));
    const label = `${t.short} · ${c.title.th}`;
    const el = h('div', { class: 'view view-chapter' },
      U.pageHead(c.title.th, {
        zh: c.title.zh ? c.title.zh + ' ' : null,
        crumbs: [{ label: 'คัมภีร์', route: '/texts' }, { label: t.short, route: `/texts/${t.id}` }, { label: `บทที่ ${index + 1}` }],
        actions: [readToggle(key), noteHere()],
      }),
      nav(),
      U.section('สรุปบท', U.blocks(c.summary), { cls: 'chapter-summary' }),
      isSat(t)
        ? U.section('ข้อความยกอ้างจากต้นฉบับ', [h('p', { class: 'small muted' }, 'ยกอ้างเฉพาะตอนสำคัญจาก SAT大正新脩大藏經テキストデータベース ตามเงื่อนไขการใช้งานของ SAT — ไม่ใช่ตัวบทเต็มบท · ตัวบทไทโชเขียนด้วยคาตากานะไม่มีเครื่องหมายเสียงขุ่น ชั้นโรมาจิให้เสียงอ่าน'), h('div', { class: 'passages' }, (c.passages || []).map((p) => U.passage(p)))], { cls: 'chapter-text' })
        : U.section('ตัวบท', h('div', { class: 'passages' }, (c.passages || []).map((p) => U.passage(p))), { cls: 'chapter-text' }),
      h('div', { class: 'chapter-foot' }, readToggle(key)),
      nav());
    Z.progress.setLast({ route: `/texts/${t.id}/${c.id}`, label });
    return { el, title: label, anchor: { type: 'chapter', id: `${t.id}/${c.id}`, label, route: `/texts/${t.id}/${c.id}` }, tts: true };
  };

  Z.views._shared = { readToggle, noteHere, sourceItem, KIND };
})(window.ZEN);
