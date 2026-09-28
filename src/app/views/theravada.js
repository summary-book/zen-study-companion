(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  const INTRO = 'view นี้แยกออกจากตัวบทเซนโดยเจตนา: ฝั่งซ้ายสรุปมุมเซนพร้อมลิงก์ไปยังเนื้อหาในแอป ฝั่งขวาอ้างพระไตรปิฎกบาลี (ต้นฉบับบาลีจาก SuttaCentral — Public Domain) พร้อมถอดความของผู้จัดทำ และปิดท้ายด้วยจุดเหมือน จุดต่าง และข้อควรระวังในการเทียบ';

  Z.views.theravadaList = function () {
    const D = Z.registry.D;
    const el = h('div', { class: 'view view-theravada' },
      U.pageHead('เทียบเถรวาท', { zh: '對照 ', sub: INTRO }),
      h('div', { class: 'card-grid' }, D.theravada.map((t) => h('a', { class: 'card glass', href: `#/theravada/${t.id}` },
        h('div', { class: 'card-head' }, t.title.zh ? h('span', { class: 'card-zh cjk', lang: 'zh-Hant' }, t.title.zh) : null, t.title.pali ? h('span', { class: 'pali small' }, t.title.pali) : null),
        h('h2', { class: 'card-title' }, t.title.th),
        h('p', { class: 'small' }, `เหมือน ${t.same.length} · ต่าง ${t.diff.length} · ข้อควรระวัง ${t.caution.length}`)))));
    return { el, title: 'เทียบเถรวาท', anchor: { type: 'theravada', id: 'theravada', label: 'เทียบเถรวาท (ทั่วไป)', route: '/theravada' } };
  };

  Z.views.theravada = function (params) {
    const R = Z.registry;
    const t = R.theravada.get(params.id);
    if (!t) return Z.views.notfound();
    const zenRefs = (t.zen.refs || []).map((r) => R.routeFromRef(r)).filter((r) => r.exists);
    const el = h('div', { class: 'view view-theravada-topic' },
      U.pageHead(t.title.th, { zh: t.title.zh ? t.title.zh + ' ' : null, crumbs: [{ label: 'เทียบเถรวาท', route: '/theravada' }, { label: t.title.th }], sub: t.title.pali ? h('span', { class: 'pali' }, t.title.pali) : null }),
      h('div', { class: 'compare' },
        h('section', { class: 'compare-col glass col-zen' }, h('h2', { class: 'section-title' }, 'มุมเซน'), U.blocks(t.zen.summary),
          zenRefs.length ? h('div', { class: 'chips' }, h('span', { class: 'small muted' }, 'อ่านต่อในแอป: '), zenRefs.map((r) => h('a', { class: 'chip', href: '#' + r.route }, r.label))) : null),
        h('section', { class: 'compare-col glass col-thera' }, h('h2', { class: 'section-title' }, 'มุมเถรวาท (พระไตรปิฎกบาลี)'),
          (t.theravada.pali || []).map((x) => h('blockquote', { class: 'pali-quote' }, h('p', { class: 'pali', lang: 'pi' }, x.text), h('p', { class: 'layer-th-plain' }, h('span', { class: 'th-tag' }, 'ถอดความ'), x.th), h('cite', { class: 'small muted' }, x.ref))),
          U.blocks(t.theravada.summary),
          (t.theravada.refs || []).length ? h('ul', { class: 'source-list small' }, t.theravada.refs.map((r) => { const s = R.source.get(r.sourceId); return s ? h('li', null, R.fullCite(s), r.loc ? ` — ${r.loc}` : '') : null; })) : null)),
      h('div', { class: 'compare-summary' },
        U.section('จุดเหมือน', h('ul', { class: 'prose-list' }, t.same.map((x) => h('li', null, U.rich(x)))), { cls: 'cmp-same' }),
        U.section('จุดต่าง', h('ul', { class: 'prose-list' }, t.diff.map((x) => h('li', null, U.rich(x)))), { cls: 'cmp-diff' }),
        U.section('ข้อควรระวังในการเทียบ', h('ul', { class: 'prose-list' }, t.caution.map((x) => h('li', null, U.rich(x)))), { cls: 'cmp-caution' })));
    return { el, title: t.title.th, anchor: { type: 'theravada', id: t.id, label: `เทียบเถรวาท: ${t.title.th}`, route: `/theravada/${t.id}` }, tts: true };
  };
})(window.ZEN);
