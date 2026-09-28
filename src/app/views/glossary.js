(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  const CAT = { core: 'แก่น', practice: 'การปฏิบัติ', awakening: 'การรู้แจ้ง', doctrine: 'หลักคำสอน', institution: 'สถาบัน/บทบาท', slogan: 'คำขวัญ' };
  const WHERE = { text: 'คัมภีร์', chapter: 'บท', koan: 'โกอาน', collection: 'ชุดโกอาน', practice: 'การปฏิบัติ', theravada: 'เทียบเถรวาท', term: 'ศัพท์' };

  function readings(g) {
    return [['漢字', g.zh, 'zh-Hant'], ['简体', g.zhS, 'zh-Hans'], ['พินอิน', g.pinyin, 'zh-Latn-pinyin'], ['โรมาจิ', g.romaji, 'ja-Latn'], ['เกาหลี', [g.ko, g.rr].filter(Boolean).join(' · '), 'ko'], ['เวียดนาม', g.vi, 'vi'], ['คำอ่านไทย', g.th, 'th'], ['สันสกฤต', g.sa, 'sa'], ['บาลี', g.pali, 'pi'], ['อังกฤษ', g.en, 'en']].filter((r) => r[1]);
  }

  function firstSentence(g) {
    const s = Z.search.plain((g.meaning || []).find((b) => typeof b === 'string' && !b.startsWith('## ')) || '');
    return s.length > 110 ? s.slice(0, 108) + '…' : s;
  }

  Z.views.glossary = function () {
    const D = Z.registry.D;
    let cat = '';
    let q = '';
    const tbody = h('tbody');
    const render = () => {
      const list = D.glossary.filter((g) => (!cat || g.cat === cat) && (!q || Z.util.norm([g.zh, g.zhS, g.pinyin, g.romaji, g.th, g.en, g.sa, g.pali].join(' ')).includes(q)));
      tbody.replaceChildren(...list.map((g) => h('tr', null,
        h('td', { class: 'cjk big', lang: 'zh-Hant' }, h('a', { href: `#/glossary/${g.id}` }, g.zh)),
        h('td', { class: 'layer-pinyin-cell' }, g.pinyin), h('td', null, g.romaji || ''), h('td', null, h('a', { href: `#/glossary/${g.id}` }, g.th)),
        h('td', { class: 'small' }, firstSentence(g)))));
      if (!list.length) tbody.replaceChildren(h('tr', null, h('td', { colspan: '5' }, 'ไม่พบคำนี้')));
    };
    const input = h('input', { type: 'search', class: 'input', placeholder: 'กรอง: 無, wu, mu, มุ…', 'aria-label': 'กรองศัพท์', on: { input: (e) => { q = Z.util.norm(e.target.value); render(); } } });
    const chips = h('div', { class: 'chips' }, [['', 'ทั้งหมด'], ...Object.entries(CAT)].map(([k, v]) => h('button', { type: 'button', class: 'chip-btn', 'aria-pressed': String(cat === k), dataset: { k }, on: { click: () => { cat = k; chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k))); render(); } } }, v)));
    render();
    const el = h('div', { class: 'view view-glossary' },
      U.pageHead('ศัพท์', { zh: '詞彙 ', sub: `${D.glossary.length} คำ · 漢字 + pinyin + romaji + คำอ่านไทย + ความหมาย` }),
      h('div', { class: 'row filters' }, input, chips),
      h('div', { class: 'table-wrap glass' }, h('table', { class: 'gloss-table' },
        h('thead', null, h('tr', null, ['漢字', 'พินอิน', 'โรมาจิ', 'คำอ่านไทย', 'ความหมายโดยย่อ'].map((x) => h('th', { scope: 'col' }, x)))), tbody)));
    return { el, title: 'ศัพท์', anchor: { type: 'glossary', id: 'glossary', label: 'ศัพท์ (ทั่วไป)', route: '/glossary' } };
  };

  Z.views.term = function (params) {
    const R = Z.registry;
    const g = R.term.get(params.id);
    if (!g) return Z.views.notfound();
    const mentions = (R.mentions.term.get(g.id) || []).map((w) => ({ ...w, r: R.resolve(w.type, w.id) })).filter((w) => w.r.exists && !(w.type === 'term' && w.id === g.id));
    const el = h('div', { class: 'view view-term' },
      U.pageHead(g.th, { zh: g.zh + ' ', crumbs: [{ label: 'ศัพท์', route: '/glossary' }, { label: g.zh }], sub: [g.pinyin, g.romaji, CAT[g.cat]].filter(Boolean).join(' · ') }),
      h('div', { class: 'term-hero glass' }, h('div', { class: 'term-zh cjk', lang: 'zh-Hant' }, g.zh),
        h('dl', { class: 'name-table' }, readings(g).map(([l, v, lang]) => [h('dt', null, l), h('dd', { lang }, v)]))),
      U.section('ความหมาย', U.blocks(g.meaning)),
      (g.related || []).length ? U.section('คำที่เกี่ยวข้อง', h('div', { class: 'chips' }, g.related.map((r) => { const t = R.term.get(r); return t ? h('a', { class: 'chip', href: `#/glossary/${r}` }, h('span', { class: 'cjk', lang: 'zh-Hant' }, t.zh), ' ', t.th) : null; }))) : null,
      mentions.length ? U.section('ปรากฏใน', h('ul', { class: 'mention-list' }, mentions.map((w) => h('li', null, U.badge(WHERE[w.type] || w.type), ' ', h('a', { href: '#' + w.r.route }, w.r.label))))) : null);
    return { el, title: `${g.zh} ${g.th}`, anchor: { type: 'term', id: g.id, label: `ศัพท์ ${g.zh}`, route: `/glossary/${g.id}` }, tts: true };
  };
})(window.ZEN);
