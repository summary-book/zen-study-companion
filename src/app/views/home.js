(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;

  const CARDS = [
    { route: '/lineage', icon: 'tree', title: 'ประวัติและสายสืบทอด', zh: '傳燈', text: 'แผนภูมิสายสืบทอดจากพระศากยมุนี ผ่านสังฆปริณายก 28+6 สู่ห้าสำนักเจ็ดสาย ญี่ปุ่น เกาหลี เวียดนาม และเส้นเวลา' },
    { route: '/texts', icon: 'book', title: 'คัมภีร์หลัก', zh: '經錄', text: 'อ่านทีละบท ต้นฉบับ 漢文 คู่ถอดความไทย พร้อมประวัติ ผู้แต่ง บุคคล และแหล่งศึกษาต่อ' },
    { route: '/koans', icon: 'koan', title: 'โกอาน', zh: '公案', text: 'ทีละกรณี แยกชั้น 本則 / 頌 / 評唱 และกล่อง "มุมตีความ" ที่ระบุที่มาเสมอ' },
    { route: '/people', icon: 'person', title: 'บุคคล', zh: '祖師', text: 'ประวัติอาจารย์เซน ชื่อทุกระบบ และทุกเรื่องราวที่ปรากฏในแอป' },
    { route: '/practice', icon: 'lotus', title: 'การปฏิบัติ', zh: '修行', text: 'ซาเซน ชิกันตะซะ การพิจารณาโกอาน/ฮวาโถว และภาพฝึกวัวสิบภาพ' },
    { route: '/glossary', icon: 'glossary', title: 'ศัพท์', zh: '詞彙', text: '漢字 · pinyin · romaji · คำอ่านไทย · ความหมาย' },
    { route: '/theravada', icon: 'compare', title: 'เทียบเถรวาท', zh: '對照', text: 'เทียบหลักการ ศัพท์ และวิธีปฏิบัติกับพระไตรปิฎกบาลี แยกจากตัวบทเซน' },
  ];

  Z.views.home = function () {
    const D = Z.registry.D;
    const last = Z.progress.getLast();
    const stats = [
      [D.texts.length, 'คัมภีร์'],
      [D.texts.reduce((a, t) => a + t.chapters.length, 0), 'บท'],
      [D.koans.length, 'กรณีโกอาน'],
      [D.people.length, 'บุคคล'],
      [D.glossary.length, 'ศัพท์'],
      [D.quiz.length, 'ข้อสอบ'],
    ];
    const el = h('div', { class: 'view view-home' },
      h('section', { class: 'hero glass' },
        h('div', { class: 'hero-mark cjk', lang: 'zh-Hant', 'aria-hidden': 'true' }, '禪'),
        h('div', null,
          h('h1', { class: 'hero-title' }, 'ศึกษานิกายเซน'),
          h('p', { class: 'hero-sub' }, h('span', { class: 'cjk', lang: 'zh-Hant' }, '禪 Chán'), ' · ', h('span', { lang: 'ja' }, '禅 Zen'), ' · ', h('span', { lang: 'ko' }, '선 Seon'), ' · ', h('span', { lang: 'vi' }, 'Thiền')),
          h('p', null, 'คู่มือศึกษาแบบออฟไลน์: อ่านตัวบทต้นฉบับคู่ถอดความไทย จดคำถามและข้อค้นคว้าไว้ข้างเนื้อหา ทุกชั้นของข้อความ — ต้นฉบับ ถอดความ อรรถาธิบายดั้งเดิม และการตีความสมัยหลัง — แยกจากกันและระบุที่มา'),
          h('div', { class: 'row' },
            last ? h('a', { class: 'btn btn-primary', href: '#' + last.route }, U.icon('book'), h('span', null, 'อ่านต่อ: ' + last.label)) : h('a', { class: 'btn btn-primary', href: '#/texts/heart-sutra' }, U.icon('book'), h('span', null, 'เริ่มที่หฤทัยสูตร')),
            h('a', { class: 'btn btn-ghost', href: '#/lineage' }, U.icon('tree'), h('span', null, 'ดูสายสืบทอด'))))),
      h('div', { class: 'stats' }, stats.map(([n, l]) => h('div', { class: 'stat glass' }, h('strong', null, String(n)), h('span', null, l)))),
      h('div', { class: 'card-grid' }, CARDS.map((c) => h('a', { class: 'card glass', href: '#' + c.route },
        h('div', { class: 'card-head' }, U.icon(c.icon, 'card-icon'), h('span', { class: 'card-zh cjk', lang: 'zh-Hant' }, c.zh)),
        h('h2', { class: 'card-title' }, c.title), h('p', null, c.text)))),
      h('p', { class: 'muted small center' }, `Phase ${D.meta.phase} · ปรับปรุง ${D.meta.updated} · `, h('a', { href: '#/about' }, 'แหล่งที่มาและลิขสิทธิ์')));
    return { el, title: 'Zen Study Companion', anchor: { type: 'general', label: 'ทั่วไป', route: '/' } };
  };

  Z.views.notfound = function () {
    return { el: h('div', { class: 'view' }, U.pageHead('ไม่พบหน้านี้', { sub: 'ลิงก์อาจผิดหรือเนื้อหายังไม่ถูกเพิ่ม' }), h('a', { class: 'btn btn-primary', href: '#/' }, 'กลับหน้าแรก')), title: 'ไม่พบหน้า', anchor: { type: 'general', label: 'ทั่วไป' } };
  };
})(window.ZEN);
