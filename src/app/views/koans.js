(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  const S = () => Z.views._shared;

  Z.views.koans = function () {
    const D = Z.registry.D;
    const el = h('div', { class: 'view view-koans' },
      U.pageHead('โกอาน', { zh: '公案 ', sub: 'ทีละกรณี แยกชั้นให้ชัด: **本則** ตัวกรณี · **頌** โศลก · **評唱** อรรถาธิบายของผู้รวบรวม — การตีความของผู้อื่นอยู่ในกล่อง "มุมตีความ" แยกต่างหากและระบุที่มาเสมอ' }),
      h('div', { class: 'card-grid' }, D.collections.map((c) => {
        const have = D.koans.filter((k) => k.collection === c.id).length;
        const st = Z.progress.collectionStats(c);
        return h('a', { class: 'card glass', href: `#/koans/${c.id}` },
          h('div', { class: 'card-head' }, h('span', { class: 'card-zh cjk big', lang: 'zh-Hant' }, c.titles.zh)),
          h('h2', { class: 'card-title' }, c.titles.th),
          h('p', { class: 'small muted' }, [c.titles.ja && `${c.titles.ja} ${c.titles.romaji || ''}`, c.titles.en].filter(Boolean).join(' · ')),
          h('p', { class: 'small' }, `${c.count} กรณี · มีในแอปแล้ว ${have} กรณี`),
          U.progressBar(st.pct), h('p', { class: 'small muted' }, `อ่านแล้ว ${st.done}/${st.total}`));
      })));
    return { el, title: 'โกอาน', anchor: { type: 'koans', id: 'koans', label: 'โกอาน (ทั่วไป)', route: '/koans' } };
  };

  Z.views.collection = function (params) {
    const R = Z.registry;
    const c = R.collection.get(params.collection);
    if (!c) return Z.views.notfound();
    const cases = new Map(R.D.koans.filter((k) => k.collection === c.id).map((k) => [k.no, k]));
    const planned = (R.D.meta.upcoming || []).find((u) => u.kind === 'collection' && u.id === c.id);
    const grid = h('ol', { class: 'case-grid' }, Array.from({ length: c.count }, (_, i) => {
      const no = i + 1;
      const k = cases.get(no);
      if (!k) return h('li', { class: 'case case-missing', title: planned ? `จะเพิ่มใน Phase ${planned.phase}` : 'ยังไม่มีในแอป' }, h('span', { class: 'case-no' }, String(no)));
      const read = Z.progress.isRead(`koan:${k.id}`);
      return h('li', { class: 'case' + (read ? ' is-read' : '') }, h('a', { href: `#/koans/${c.id}/${no}` }, h('span', { class: 'case-no' }, String(no)), h('span', { class: 'case-title cjk', lang: 'zh-Hant' }, k.title.zh), h('span', { class: 'case-th' }, k.title.th)));
    }));
    const compiler = R.person.get(c.compiler);
    const el = h('div', { class: 'view view-collection' },
      U.pageHead(c.titles.th, {
        zh: c.titles.zh + ' ',
        crumbs: [{ label: 'โกอาน', route: '/koans' }, { label: c.short }],
        sub: h('span', null, compiler ? ['ผู้รวบรวม: ', h('a', { href: `#/people/${compiler.id}` }, Z.names.primary(compiler))] : null, ` · ค.ศ. ${c.year} · ${c.count} กรณี`, planned ? ` · กรณีที่เหลือจะเพิ่มใน Phase ${planned.phase}` : ''),
      }),
      U.section('โครงสร้างแต่ละกรณี', h('div', { class: 'chips' }, c.layerOrder.map((k, i) => h('span', { class: 'chip' }, `${i + 1}. `, h('span', { class: 'cjk', lang: 'zh-Hant' }, c.layerLabels[k].zh), ' ', c.layerLabels[k].th)))),
      U.section('กรณีทั้งหมด', grid),
      U.section('เกี่ยวกับชุดนี้', U.blocks(c.about)));
    return { el, title: c.short, anchor: { type: 'collection', id: c.id, label: c.short, route: `/koans/${c.id}` }, tts: true };
  };

  Z.views.koan = function (params) {
    const R = Z.registry;
    const c = R.collection.get(params.collection);
    const k = R.koan.get(`${params.collection}-${params.no}`);
    if (!c || !k) return Z.views.notfound();
    const available = R.D.koans.filter((x) => x.collection === c.id).sort((a, b) => a.no - b.no);
    const i = available.indexOf(k);
    const prev = available[i - 1];
    const next = available[i + 1];
    const key = `koan:${k.id}`;
    const label = `${c.short} ${k.no} ${k.title.zh}`;

    const summaries = k.summaries || {};
    const related = Array.from(R.relatedOf.get(k.id) || []).filter((r) => r !== k.id);
    const layers = c.layerOrder.filter((l) => (k.layers[l] && k.layers[l].length) || (summaries[l] && summaries[l].length)).map((l) => h('section', { class: `koan-layer glass layer-box-${l}` },
      h('h2', { class: 'layer-title' }, h('span', { class: 'cjk', lang: 'zh-Hant' }, c.layerLabels[l].zh), ' ', h('span', null, c.layerLabels[l].th)),
      summaries[l] && summaries[l].length ? h('div', { class: 'layer-summary' },
        h('p', { class: 'layer-summary-tag' }, U.badge('สรุปความโดยผู้จัดทำ', 'badge-editorial'), ' ', h('span', { class: 'muted small' }, 'ต้นฉบับยาว — แสดงสรุปและข้อความเด่นด้านล่าง')),
        U.blocks(summaries[l])) : null,
      (k.layers[l] || []).length && summaries[l] && summaries[l].length ? h('p', { class: 'small muted excerpt-label' }, 'ข้อความเด่นจากต้นฉบับ') : null,
      (k.layers[l] || []).map((p) => U.passage(p, { showSource: true }))));

    const interp = (k.interpretations || []).length ? h('details', { class: 'interp glass' },
      h('summary', null, h('strong', null, 'มุมตีความ'), h('span', { class: 'muted small' }, ` (${k.interpretations.length} มุม — ไม่ใช่ส่วนของตัวบท)`)),
      h('p', { class: 'muted small' }, 'สรุปแนวทางของผู้ตีความแต่ละท่านด้วยถ้อยคำของผู้จัดทำ ไม่ใช่การอ้างข้อความ โปรดอ่านต้นฉบับของแต่ละท่านตามรายการที่อ้าง'),
      k.interpretations.map((it) => h('div', { class: 'interp-item' }, h('h3', null, it.by), h('p', null, U.rich(it.th)), h('p', { class: 'small muted' }, 'ที่มา: ', U.rich(`[[source:${it.sourceId}]]`))))) : null;

    const el = h('div', { class: 'view view-koan' },
      U.pageHead(k.title.th, {
        zh: k.title.zh + ' ',
        crumbs: [{ label: 'โกอาน', route: '/koans' }, { label: c.short, route: `/koans/${c.id}` }, { label: `กรณีที่ ${k.no}` }],
        sub: `${c.titles.zh} กรณีที่ ${k.no}`,
        actions: [S().readToggle(key), S().noteHere()],
      }),
      (k.people || []).length ? h('div', { class: 'chips' }, h('span', { class: 'small muted' }, 'บุคคล: '), k.people.map(U.personChip)) : null,
      layers,
      (k.notes || []).length ? U.section('หมายเหตุบรรณาธิการ', U.blocks(k.notes), { cls: 'editorial' }) : null,
      interp,
      (k.terms || []).length ? h('div', { class: 'chips' }, h('span', { class: 'small muted' }, 'ศัพท์: '), k.terms.map((t) => { const r = R.resolve('term', t); return r.exists ? h('a', { class: 'chip', href: '#' + r.route }, r.label) : null; })) : null,
      related.length ? h('div', { class: 'chips' }, h('span', { class: 'small muted' }, 'กรณีที่เกี่ยวข้อง: '), related.map((r) => {
        const x = R.resolve('koan', r);
        if (x.exists) return h('a', { class: 'chip', href: '#' + x.route }, x.label);
        const [cid, no] = r.split(/-(?=\d+$)/);
        const col = R.collection.get(cid);
        const plan = (R.D.meta.upcoming || []).find((u) => u.kind === 'collection' && u.id === cid);
        return h('span', { class: 'chip chip-missing', title: 'ยังไม่มีในแอป' }, `${col ? col.short : cid} กรณีที่ ${no}`, plan ? ` · Phase ${plan.phase}` : '');
      })) : null,
      h('nav', { class: 'pager' },
        prev ? h('a', { class: 'btn btn-ghost', href: `#/koans/${c.id}/${prev.no}` }, U.icon('left'), h('span', null, `${prev.no} ${prev.title.zh}`)) : h('span'),
        next ? h('a', { class: 'btn btn-ghost', href: `#/koans/${c.id}/${next.no}` }, h('span', null, `${next.no} ${next.title.zh}`), U.icon('right')) : h('span')));
    Z.progress.setLast({ route: `/koans/${c.id}/${k.no}`, label });
    return { el, title: label, anchor: { type: 'koan', id: k.id, label, route: `/koans/${c.id}/${k.no}` }, tts: true };
  };
})(window.ZEN);
