(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  const COUNTRY = { india: 'อินเดีย', china: 'จีน', japan: 'ญี่ปุ่น', korea: 'เกาหลี', vietnam: 'เวียดนาม', west: 'ตะวันตก' };
  const WHERE = { text: 'คัมภีร์', chapter: 'บทในคัมภีร์', koan: 'โกอาน', collection: 'ชุดโกอาน', practice: 'การปฏิบัติ', theravada: 'เทียบเถรวาท', term: 'ศัพท์' };

  function sortYear(p) {
    const d = p.dates || {};
    if (d.b !== undefined) return d.b;
    if (d.d !== undefined) return d.d - 60;
    const n = p.patriarch && p.patriarch.india;
    return n ? -450 + n * 30 : 3000;
  }

  Z.views.people = function (params, query) {
    const D = Z.registry.D;
    let country = query.country || '';
    let q = '';
    const listHost = h('div', { class: 'people-list' });
    const input = h('input', { type: 'search', class: 'input', placeholder: 'กรองชื่อ (ทุกระบบ)…', 'aria-label': 'กรองรายชื่อ', on: { input: (e) => { q = Z.util.norm(e.target.value); render(); } } });

    function render() {
      const list = D.people.filter((p) => (!country || p.country === country) && (!q || Z.names.allForms(p).some((f) => Z.util.norm(f).includes(q))))
        .sort((a, b) => sortYear(a) - sortYear(b));
      const groups = {};
      for (const p of list) (groups[p.country] = groups[p.country] || []).push(p);
      listHost.replaceChildren(...(list.length ? Object.keys(COUNTRY).filter((c) => groups[c]).map((c) => h('section', { class: 'people-group' },
        h('h2', { class: 'section-title' }, `${COUNTRY[c]} (${groups[c].length})`),
        h('div', { class: 'person-grid' }, groups[c].map((p) => h('a', { class: 'person-card glass' + (p.bio ? ' has-bio' : ''), href: `#/people/${p.id}` },
          h('div', { class: 'person-card-head' }, h('strong', null, Z.names.primary(p)), h('span', { class: 'cjk', lang: 'zh-Hant' }, p.names.zh)),
          h('p', { class: 'small muted' }, [Z.util.fmtDates(p.dates), p.patriarch && p.patriarch.india ? `สังฆปริณายกอินเดียองค์ที่ ${p.patriarch.india}` : '', p.patriarch && p.patriarch.china ? `สังฆปริณายกจีนองค์ที่ ${p.patriarch.china}` : ''].filter(Boolean).join(' · ')),
          h('p', { class: 'small clamp' }, U.rich(p.summary))))))) : [U.empty('ไม่พบรายชื่อ')]));
    }
    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'กรองประเทศ' }, [['', 'ทั้งหมด'], ...Object.entries(COUNTRY)].map(([k, v]) =>
      h('button', { type: 'button', class: 'chip-btn', 'aria-pressed': String(country === k), dataset: { c: k }, on: { click: () => { country = k; chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === k))); render(); } } }, v)));
    render();
    const el = h('div', { class: 'view view-people' },
      U.pageHead('บุคคล', { zh: '祖師 ', sub: `${D.people.length} ท่าน เรียงตามยุค · ชื่อแสดงตามการตั้งค่า "ชื่อหลัก" (ฮุ่ยเหนิง / เว่ยหล่าง / Enō)` }),
      h('div', { class: 'row filters' }, input, chips), listHost);
    return { el, title: 'บุคคล', anchor: { type: 'people', id: 'people', label: 'บุคคล (ทั่วไป)', route: '/people' } };
  };

  Z.views.person = function (params) {
    const R = Z.registry;
    const p = R.person.get(params.id);
    if (!p) return Z.views.notfound();
    const node = R.node.get(p.id);
    const nameOf = (id) => { const x = R.person.get(id); if (x) return h('a', { href: `#/people/${id}` }, Z.names.primary(x)); const n = R.node.get(id); return n ? h('span', { class: 'muted' }, n.label.th) : id; };
    let teacher = null;
    if (node && node.parent) {
      const par = R.node.get(node.parent);
      teacher = par.kind === 'group' ? [nameOf(par.id), ' (สืบจาก ', nameOf(par.parent), ')'] : nameOf(par.id);
    }
    const students = node ? (R.children.get(p.id) || []).map((c) => { const n = R.node.get(c); return n.kind === 'group' ? [nameOf(c), ' → ', (R.children.get(c) || []).map(nameOf).reduce((a, x, i) => (i ? [a, ', ', x] : [x]), [])] : nameOf(c); }) : [];
    const path = node ? R.lineagePath(p.id) : [];
    const mentions = (R.mentions.person.get(p.id) || []).map((w) => ({ ...w, r: R.resolve(w.type === 'collection' ? 'collection' : w.type, w.id) })).filter((w) => w.r.exists);
    const links = R.D.lineage.links.filter((l) => l.from === p.id || l.to === p.id);

    const el = h('div', { class: 'view view-person' },
      U.pageHead(Z.names.primary(p), {
        zh: p.names.zh + ' ',
        crumbs: [{ label: 'บุคคล', route: '/people' }, { label: Z.names.primary(p) }],
        sub: h('span', null, [Z.util.fmtDates(p.dates), COUNTRY[p.country]].filter(Boolean).join(' · '), ' ', U.historicity(p.historicity)),
        actions: node ? [h('a', { class: 'btn btn-ghost', href: Z.router.href('/lineage', { focus: 'person:' + p.id }) }, U.icon('tree'), h('span', null, 'ดูในแผนภูมิ'))] : null,
      }),
      U.section('ชื่อในระบบต่าง ๆ', h('dl', { class: 'name-table' }, Z.names.variants(p).map((v) => [h('dt', null, v.label), h('dd', { lang: v.lang, class: v.lang && v.lang.startsWith('zh') && !v.lang.includes('Latn') ? 'cjk' : null }, v.value)]))),
      U.section('สาย / สำนัก', h('div', null,
        (p.schools || []).length ? h('div', { class: 'chips' }, p.schools.map((s) => { const sc = R.school.get(s); return h('a', { class: 'chip', href: Z.router.href('/lineage', { focus: 'school:' + s }) }, sc.th, ' ', h('span', { class: 'cjk', lang: 'zh-Hant' }, sc.zh)); })) : null,
        p.patriarch ? h('p', null, [p.patriarch.india && `สังฆปริณายกอินเดียองค์ที่ ${p.patriarch.india}`, p.patriarch.china && `สังฆปริณายกจีนองค์ที่ ${p.patriarch.china}`].filter(Boolean).join(' · '), ' (ตามขนบ)') : null,
        teacher ? h('p', null, 'อาจารย์ (ในแผนภูมิ): ', teacher) : null,
        students.length ? h('p', null, 'ผู้สืบทอด (ในแผนภูมิ): ', students.map((s, i) => [i ? ', ' : '', s])) : null,
        links.length ? h('ul', { class: 'small prose-list' }, links.map((l) => h('li', null, nameOf(l.from), ' ⇢ ', nameOf(l.to), `: ${l.note || l.kind}`))) : null,
        path.length > 1 ? h('p', { class: 'small path' }, 'เส้นทางจากราก: ', path.map((x, i) => [i ? ' → ' : '', nameOf(x)])) : null)),
      U.section('ประวัติ', U.blocks(p.bio && p.bio.length ? p.bio : [p.summary])),
      U.section('ปรากฏในแอป', mentions.length ? h('ul', { class: 'mention-list' }, mentions.map((w) => h('li', null, U.badge(WHERE[w.type] || w.type), ' ', h('a', { href: '#' + w.r.route }, w.r.label)))) : h('p', { class: 'muted' }, 'ยังไม่มีคัมภีร์หรือกรณีโกอานในแอปที่กล่าวถึงท่านนี้ (จะเพิ่มในรุ่นถัดไป)')),
      (p.refs || []).length ? U.section('อ้างอิง', h('ul', { class: 'source-list' }, p.refs.map((r) => Z.views._shared.sourceItem(r)))) : null);
    return { el, title: Z.names.primary(p), anchor: { type: 'person', id: p.id, label: Z.names.primary(p), route: `/people/${p.id}` }, tts: true };
  };
})(window.ZEN);
