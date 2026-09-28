(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  const DISCLAIMER = 'เนื้อหานี้เป็นข้อมูลเพื่อการศึกษา การปฏิบัติจริงควรมีครูผู้แนะนำ';

  function svgFigure(id, cls) {
    const markup = Z.registry.D.svg[id];
    // SVG markup is bundled at build time from src/svg (trusted, not user data)
    return h('div', { class: 'ox-svg ' + (cls || ''), html: markup || '' });
  }

  Z.views.practiceList = function () {
    const D = Z.registry.D;
    const list = D.practice.slice().sort((a, b) => a.order - b.order);
    const el = h('div', { class: 'view view-practice' },
      U.pageHead('การปฏิบัติ', { zh: '修行 ', sub: DISCLAIMER }),
      h('div', { class: 'card-grid' }, list.map((p) => h('a', { class: 'card glass', href: `#/practice/${p.id}` },
        h('div', { class: 'card-head' }, p.id === 'oxherding' ? svgFigure('ox-06', 'mini') : U.icon('lotus', 'card-icon'), p.title.zh ? h('span', { class: 'card-zh cjk', lang: 'zh-Hant' }, p.title.zh) : null),
        h('h2', { class: 'card-title' }, p.title.th), h('p', null, U.rich(p.summary))))));
    return { el, title: 'การปฏิบัติ', anchor: { type: 'practice', id: 'practice', label: 'การปฏิบัติ (ทั่วไป)', route: '/practice' } };
  };

  Z.views.practice = function (params, query) {
    if (params.id === 'oxherding') return Z.views.oxherding(params, query);
    const p = Z.registry.practice.get(params.id);
    if (!p) return Z.views.notfound();
    const el = h('div', { class: 'view view-practice-topic' },
      U.pageHead(p.title.th, { zh: p.title.zh ? p.title.zh + ' ' : null, crumbs: [{ label: 'การปฏิบัติ', route: '/practice' }, { label: p.title.th }], sub: p.summary }),
      h('div', { class: 'callout' }, DISCLAIMER),
      U.section(null, U.blocks(p.body)));
    return { el, title: p.title.th, anchor: { type: 'practice', id: p.id, label: p.title.th, route: `/practice/${p.id}` }, tts: true };
  };

  Z.views.oxherding = function (params, query) {
    const R = Z.registry;
    const intro = R.practice.get('oxherding');
    const list = R.D.oxherding.slice().sort((a, b) => a.no - b.no);
    const n = Math.min(Math.max(Number(query.n) || 0, 0), list.length);
    const gallery = h('ol', { class: 'ox-gallery' }, list.map((o) => h('li', { class: n === o.no ? 'current' : null },
      h('a', { href: Z.router.href('/practice/oxherding', { n: o.no }), 'aria-label': `ภาพที่ ${o.no} ${o.title.th}` },
        svgFigure(o.svg, 'thumb'), h('span', { class: 'ox-no' }, String(o.no)), h('span', { class: 'cjk', lang: 'zh-Hant' }, o.title.zh), h('span', { class: 'small' }, o.title.th),
        Z.progress.isRead(`ox:${o.no}`) ? U.badge('อ่านแล้ว', 'badge-read') : null))));
    let body;
    if (n) {
      const o = list[n - 1];
      body = h('article', { class: 'ox-reader glass' },
        h('div', { class: 'ox-figure' }, svgFigure(o.svg, 'large'), h('p', { class: 'muted small center' }, 'ภาพวาดประกอบโดยผู้จัดทำ (ไม่ได้คัดลอกจากภาพโบราณ)')),
        h('div', { class: 'ox-text' },
          h('h2', null, `${o.no}. `, h('span', { class: 'cjk', lang: 'zh-Hant' }, o.title.zh), ' ', o.title.th),
          Z.views._shared.readToggle(`ox:${o.no}`),
          o.preface ? h('div', null, h('h3', { class: 'layer-title' }, h('span', { class: 'cjk', lang: 'zh-Hant' }, '序'), ' บทนำของฉือหยวน'), U.passage(o.preface)) : null,
          h('h3', { class: 'layer-title' }, h('span', { class: 'cjk', lang: 'zh-Hant' }, '頌'), ' โศลกของกั่วอาน'),
          U.passage(o.verse),
          h('h3', { class: 'layer-title' }, 'คำอธิบาย'),
          U.blocks(o.explain)),
        h('nav', { class: 'pager' },
          n > 1 ? h('a', { class: 'btn btn-ghost', href: Z.router.href('/practice/oxherding', { n: n - 1 }) }, U.icon('left'), h('span', null, list[n - 2].title.th)) : h('span'),
          n < list.length ? h('a', { class: 'btn btn-ghost', href: Z.router.href('/practice/oxherding', { n: n + 1 }) }, h('span', null, list[n].title.th), U.icon('right')) : h('span')));
    } else {
      body = intro ? U.section('ความเป็นมา', U.blocks(intro.body)) : null;
    }
    const el = h('div', { class: 'view view-oxherding' },
      U.pageHead('ภาพฝึกวัวสิบภาพ', { zh: '十牛圖 ', crumbs: [{ label: 'การปฏิบัติ', route: '/practice' }, { label: '十牛圖' }], sub: 'ฉบับกั่วอาน ซือหย่วน (廓庵師遠) ศตวรรษที่ 12 · ตัวบทจาก X1269' }),
      gallery, body);
    const label = n ? `十牛圖 ${n}` : '十牛圖';
    return { el, title: label, anchor: { type: 'practice', id: n ? `oxherding/${n}` : 'oxherding', label, route: n ? `/practice/oxherding?n=${n}` : '/practice/oxherding' }, tts: true };
  };
})(window.ZEN);
