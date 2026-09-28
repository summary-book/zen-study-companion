(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;

  // ── Search results ─────────────────────────────────────────
  Z.views.search = function (params, query) {
    const q = (query.q || '').trim();
    const input = h('input', { type: 'search', class: 'input input-lg', value: q, placeholder: 'ค้นหา…', 'aria-label': 'คำค้น' });
    const form = h('form', { class: 'row', role: 'search', on: { submit: (e) => { e.preventDefault(); const v = input.value.trim(); if (v) Z.router.go('/search', { q: v }); } } }, input, h('button', { type: 'submit', class: 'btn btn-primary' }, U.icon('search'), h('span', null, 'ค้นหา')));
    const groups = q ? Z.search.query(q) : [];
    const total = groups.reduce((a, g) => a + g.total, 0);
    const results = h('div', { class: 'search-results' }, q ? (groups.length ? groups.map((g) => U.section(`${g.label} (${g.total})`, h('ul', { class: 'result-list' }, g.items.map((it) => {
      const link = it.type === 'note' ? '#' + it.route : Z.router.href(it.route.split('?')[0], { ...Object.fromEntries(new URLSearchParams(it.route.split('?')[1] || '')), hl: q, p: it.p });
      const snip = h('p', { class: 'snippet small' }, it.snippet);
      U.highlight(snip, q);
      return h('li', { class: 'result' }, h('a', { href: link, class: 'result-title' }, it.title), it.sub ? h('span', { class: 'muted small cjk', lang: 'zh-Hant' }, ' ' + it.sub) : null, snip);
    })))) : [U.empty(`ไม่พบ "${q}"`)]) : [h('p', { class: 'muted' }, 'พิมพ์คำค้น — ค้นได้ทั้ง 漢字 พินอิน (ไม่ต้องใส่วรรณยุกต์) โรมาจิ ไทย และชื่อทุกระบบ')]);
    const el = h('div', { class: 'view view-search' }, U.pageHead('ค้นหา', { sub: q ? `พบ ${total} รายการสำหรับ "${q}"` : null }), form, results);
    return { el, title: q ? `ค้นหา: ${q}` : 'ค้นหา', anchor: { type: 'general', label: 'ทั่วไป', route: '/' }, onMount() { if (!q) input.focus(); } };
  };

  // ── Progress ──────────────────────────────────────────────
  Z.views.progress = function () {
    const D = Z.registry.D;
    const last = Z.progress.getLast();
    const textRows = D.texts.map((t) => {
      const st = Z.progress.textStats(t);
      return h('div', { class: 'progress-row glass' },
        h('div', { class: 'row' }, h('a', { href: `#/texts/${t.id}` }, h('strong', null, t.short), ' ', h('span', { class: 'cjk', lang: 'zh-Hant' }, t.titles.zh)), h('span', { class: 'spacer' }), h('span', { class: 'small' }, `${st.done}/${st.total} บท · ${st.pct}%`)),
        U.progressBar(st.pct, `${t.short} ${st.pct}%`),
        h('ol', { class: 'check-list small' }, t.chapters.map((c) => h('li', { class: Z.progress.isRead(`chapter:${t.id}/${c.id}`) ? 'is-read' : null }, h('a', { href: `#/texts/${t.id}/${c.id}` }, c.title.th)))));
    });
    const colRows = D.collections.map((c) => {
      const st = Z.progress.collectionStats(c);
      return h('div', { class: 'progress-row glass' }, h('div', { class: 'row' }, h('a', { href: `#/koans/${c.id}` }, h('strong', null, c.short), ' ', c.titles.th), h('span', { class: 'spacer' }), h('span', { class: 'small' }, `${st.done}/${st.total} กรณี · ${st.pct}%`)), U.progressBar(st.pct));
    });
    const oxDone = D.oxherding.filter((o) => Z.progress.isRead(`ox:${o.no}`)).length;
    const hist = Z.quiz.history();
    const el = h('div', { class: 'view view-progress' },
      U.pageHead('ความคืบหน้า', { sub: 'ทำเครื่องหมาย "อ่านแล้ว" ได้ที่ท้ายแต่ละบท/กรณี' }),
      last ? h('a', { class: 'btn btn-primary', href: '#' + last.route }, U.icon('book'), h('span', null, 'อ่านต่อ: ' + last.label)) : null,
      U.section('คัมภีร์', h('div', { class: 'stack' }, textRows)),
      U.section('โกอาน', h('div', { class: 'stack' }, colRows)),
      D.oxherding.length ? U.section('ภาพฝึกวัวสิบภาพ', h('div', null, U.progressBar(Math.round((oxDone / D.oxherding.length) * 100)), h('p', { class: 'small' }, `${oxDone}/${D.oxherding.length} ภาพ`))) : null,
      U.section('แบบทดสอบ', hist.length ? h('p', null, `ทำไปแล้ว ${hist.length} ครั้ง · คะแนนเฉลี่ย ${Math.round((hist.reduce((a, x) => a + (x.total ? x.score / x.total : 0), 0) / hist.length) * 100)}% `, h('a', { href: '#/quiz' }, 'ดูรายละเอียด')) : h('p', { class: 'muted' }, 'ยังไม่เคยทำแบบทดสอบ')));
    return { el, title: 'ความคืบหน้า', anchor: { type: 'general', label: 'ทั่วไป', route: '/' } };
  };

  // ── All notes ─────────────────────────────────────────────
  Z.views.notes = function (params, query) {
    const filter = { q: '', tag: query.tag || '', kind: '', anchorType: '' };
    const list = h('div', { class: 'notes-full' });
    const tagsHost = h('div', { class: 'chips' });
    const ANCHOR_TYPES = { chapter: 'บทในคัมภีร์', text: 'คัมภีร์', koan: 'โกอาน', person: 'บุคคล', term: 'ศัพท์', practice: 'การปฏิบัติ', theravada: 'เถรวาท', lineage: 'สายสืบทอด', general: 'ทั่วไป' };

    function editModal(note) {
      const title = h('input', { class: 'input', value: note.title, 'aria-label': 'หัวข้อ' });
      const body = h('textarea', { class: 'input textarea', rows: '8', 'aria-label': 'เนื้อหา' });
      body.value = note.body;
      const tags = h('input', { class: 'input', value: (note.tags || []).join(', '), 'aria-label': 'แท็ก (คั่นด้วยจุลภาค)' });
      const kind = h('select', { class: 'input select', 'aria-label': 'ประเภท' }, Object.entries(Z.notes.KINDS).map(([k, v]) => h('option', { value: k, selected: k === note.kind ? true : null }, v)));
      U.modal({
        title: 'แก้ไขโน้ต',
        body: h('div', { class: 'stack' }, title, kind, body, tags, h('p', { class: 'small muted' }, 'ผูกกับ: ', note.anchor.label || 'ทั่วไป')),
        actions: (close) => [U.btn('ยกเลิก', close, { cls: 'btn-ghost' }), U.btn('บันทึก', () => { Z.notes.update(note.id, { title: title.value, body: body.value, kind: kind.value, tags: tags.value.split(/[,，]/) }); close(); U.toast('บันทึกแล้ว'); }, { cls: 'btn-primary' })],
      });
    }

    function render() {
      const notes = Z.notes.search(filter);
      tagsHost.replaceChildren(...Z.notes.allTags().map((t) => h('button', { type: 'button', class: 'chip-btn', 'aria-pressed': String(filter.tag === t), on: { click: () => { filter.tag = filter.tag === t ? '' : t; render(); } } }, '#' + t)));
      list.replaceChildren(...(notes.length ? notes.map((n) => Z.notesPanel.noteCard(n, { showAnchor: true, onEdit: editModal })) : [U.empty(Z.notes.all().length ? 'ไม่พบโน้ตที่ตรงเงื่อนไข' : 'ยังไม่มีโน้ต — เปิดคัมภีร์หรือกรณีโกอานแล้วจดที่แผงด้านขวา')]));
      if (query.id) { const t = list.querySelector(`[data-id="${CSS.escape(query.id)}"]`); if (t) { t.classList.add('flash'); t.scrollIntoView({ block: 'center' }); } }
    }
    const qInput = h('input', { type: 'search', class: 'input', placeholder: 'ค้นในโน้ต…', 'aria-label': 'ค้นในโน้ต', on: { input: (e) => { filter.q = e.target.value; render(); } } });
    const kindSel = h('select', { class: 'input select', 'aria-label': 'กรองประเภท', on: { change: (e) => { filter.kind = e.target.value; render(); } } }, h('option', { value: '' }, 'ทุกประเภท'), Object.entries(Z.notes.KINDS).map(([k, v]) => h('option', { value: k }, v)));
    const anchorSel = h('select', { class: 'input select', 'aria-label': 'กรองตำแหน่ง', on: { change: (e) => { filter.anchorType = e.target.value; render(); } } }, h('option', { value: '' }, 'ทุกตำแหน่ง'), Object.entries(ANCHOR_TYPES).map(([k, v]) => h('option', { value: k }, v)));
    const off = Z.bus.on('notes:changed', render);
    render();
    const el = h('div', { class: 'view view-notes' },
      U.pageHead('โน้ตทั้งหมด', { sub: 'ค้นหา กรองด้วยแท็ก/ประเภท และ Export/Import เป็น JSON', actions: [U.btn('Export / Import', () => Z.dialogs.io(), { icon: 'download', cls: 'btn-ghost' })] }),
      h('div', { class: 'row filters' }, qInput, kindSel, anchorSel), tagsHost, list);
    return { el, title: 'โน้ตทั้งหมด', anchor: { type: 'general', label: 'ทั่วไป', route: '/' }, destroy: off };
  };

  // ── About / licenses ──────────────────────────────────────
  Z.views.about = function () {
    const D = Z.registry.D;
    const KIND = Z.views._shared.KIND;
    const byKind = {};
    for (const s of D.sources) (byKind[s.kind] = byKind[s.kind] || []).push(s);
    const el = h('div', { class: 'view view-about' },
      U.pageHead('เกี่ยวกับ / แหล่งที่มา / ลิขสิทธิ์', {}),
      U.section('หลักการของแอป', U.blocks([
        'ทุกข้อความแยกชั้นชัดเจน: **ต้นฉบับ** (漢文/ญี่ปุ่นโบราณ) · **ถอดความ** (เขียนโดยผู้จัดทำ) · **อรรถาธิบายดั้งเดิม** ในตัวคัมภีร์ (เช่น 無門曰, 評唱) · **มุมตีความ** ของผู้อื่นซึ่งอยู่ในกล่องแยกและระบุที่มาเสมอ',
        'ข้อความต้นฉบับที่มีป้าย "ตรงกับ CBETA" หรือ "ยกอ้างตรงตาม SAT" ได้รับการตรวจอัตโนมัติว่าตรงกับฉบับดิจิทัลนั้นทุกตัวอักษร ส่วนที่มีป้าย "ยังไม่ได้ทานกับต้นฉบับ" ยังไม่ได้ตรวจ',
        'ข้อมูลบุคคลมีป้าย **ตามขนบ / ประวัติศาสตร์ / มีข้อถกเถียง** เพื่อแยกเรื่องเล่าตามประเพณีออกจากหลักฐานทางประวัติศาสตร์',
      ])),
      U.section('สัญญาอนุญาต', U.blocks([{ list: [
        'ตัวบท 漢文: ต้นฉบับเป็นสาธารณสมบัติ นำมาจาก **CBETA 電子佛典集成** ซึ่งเผยแพร่ภายใต้ CC BY-NC-SA 4.0 (https://cbeta.org/copyright) ข้อมูลส่วนนี้จึงเผยแพร่ต่อภายใต้สัญญาเดียวกัน ใช้เพื่อการศึกษาที่ไม่แสวงหากำไร',
        'ตัวบทญี่ปุ่นของโดเก็น (正法眼藏, 普勸坐禪儀): ต้นฉบับเป็นสาธารณสมบัติ ข้อความที่แสดงเป็น **การยกอ้าง** (引用) เฉพาะตอนสำคัญจาก **SAT大正新脩大藏經テキストデータベース** (มหาวิทยาลัยโตเกียว) ตามเงื่อนไขการใช้งานของ SAT ซึ่งอนุญาตการใช้เพื่อการศึกษาไม่แสวงหากำไรและการยกอ้างโดยระบุที่มา แต่ไม่อนุญาตให้แจกจ่ายข้อมูลซ้ำ แอปจึงไม่มีตัวบททั้งบท (https://21dzk.l.u-tokyo.ac.jp/SAT/termsofuse.html)',
        'ตัวบทบาลี: Mahāsaṅgīti Tipiṭaka ผ่าน SuttaCentral (Public Domain Mark 1.0)',
        'ถอดความไทย สรุป คำอธิบาย แบบทดสอบ และภาพวาด SVG: เขียนโดยผู้จัดทำ เผยแพร่ภายใต้ CC BY-NC-SA 4.0',
        'ฉบับแปลสมัยใหม่ (อังกฤษ/ไทย) มีลิขสิทธิ์ — แอปนี้อ้างชื่อเท่านั้น ไม่คัดลอกตัวบท',
        'โค้ดของแอป: MIT · ฟอนต์ Sarabun และ Noto Serif TC: SIL Open Font License 1.1 · Tailwind CSS: MIT · tiny-inflate (คลายข้อมูลที่บีบอัดไว้ในไฟล์): MIT',
      ] }])),
      U.section('บรรณานุกรม', h('div', null, Object.keys(KIND).filter((k) => byKind[k]).map((k) => h('div', null, h('h3', null, KIND[k]), h('ul', { class: 'source-list small' }, byKind[k].map((s) => Z.views._shared.sourceItem(s.id))))))));
    return { el, title: 'เกี่ยวกับ', anchor: { type: 'general', label: 'ทั่วไป', route: '/' } };
  };
})(window.ZEN);
