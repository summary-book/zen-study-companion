(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;

  function radioGroup(name, options, value, onChange) {
    return h('div', { class: 'radio-group', role: 'radiogroup' }, Object.entries(options).map(([v, label]) =>
      h('label', { class: 'radio' }, h('input', { type: 'radio', name, value: v, checked: v === value ? true : null, on: { change: () => onChange(v) } }), h('span', null, label))));
  }

  function settings() {
    const s = Z.settings.get();
    const body = h('div', { class: 'settings' },
      h('h3', null, 'ชื่อบุคคลที่แสดงเป็นหลัก'),
      radioGroup('nameMode', Z.names.MODES, s.nameMode, (v) => Z.settings.set({ nameMode: v })),
      h('p', { class: 'muted small' }, 'ตัวอย่าง: ฮุ่ยเหนิง / เว่ยหล่าง / Enō — ชื่ออื่นยังแสดงในหน้าบุคคลและค้นหาได้ทุกแบบ'),
      h('h3', null, 'ขนาดตัวอักษร'),
      radioGroup('fontSize', { S: 'เล็ก', M: 'กลาง', L: 'ใหญ่', XL: 'ใหญ่มาก' }, s.fontSize, (v) => Z.settings.set({ fontSize: v })),
      h('h3', null, 'ธีม'),
      radioGroup('theme', { light: 'สว่าง', dark: 'มืด' }, s.theme, (v) => Z.settings.set({ theme: v })),
      h('h3', null, 'ความเร็วเสียงอ่าน'),
      radioGroup('ttsRate', Object.fromEntries(Z.settings.RATES.map((r) => [String(r), r + 'x'])), String(s.ttsRate), (v) => Z.settings.set({ ttsRate: Number(v) })),
      h('h3', null, 'ข้อมูลของฉัน'),
      h('p', { class: 'muted small' }, Z.store.isAvailable() ? 'บันทึกในเบราว์เซอร์นี้ (localStorage)' : 'เบราว์เซอร์นี้บันทึกข้อมูลไม่ได้ — ข้อมูลจะหายเมื่อปิดหน้า'),
      h('div', { class: 'row' },
        U.btn('Export / Import', () => io(), { icon: 'download', cls: 'btn-ghost' }),
        U.btn('ล้างข้อมูลทั้งหมด', async () => {
          if (await U.confirmDialog('ล้างโน้ต ความคืบหน้า ประวัติแบบทดสอบ และการตั้งค่าทั้งหมด? ควร Export ก่อน การล้างกู้คืนไม่ได้', 'ล้างข้อมูล')) {
            Z.store.clearAll();
            Z.settings.load();
            Z.settings.apply();
            Z.bus.emit('notes:changed', []);
            Z.bus.emit('progress:changed', {});
            U.toast('ล้างข้อมูลแล้ว');
          }
        }, { icon: 'trash', cls: 'btn-danger' })));
    U.modal({ title: 'ตั้งค่า', body });
  }

  function io() {
    const withProgress = h('input', { type: 'checkbox', checked: true });
    const withQuiz = h('input', { type: 'checkbox', checked: true });
    const file = h('input', { type: 'file', accept: 'application/json,.json', class: 'input', 'aria-label': 'เลือกไฟล์ JSON' });
    const result = h('div', { class: 'import-result', role: 'status' });
    let validated = null;

    file.addEventListener('change', () => {
      const fl = file.files && file.files[0];
      result.replaceChildren();
      validated = null;
      if (!fl) return;
      if (fl.size > 5 * 1024 * 1024) { result.replaceChildren(h('p', { class: 'error' }, 'ไฟล์ใหญ่เกิน 5 MB')); return; }
      const reader = new FileReader();
      reader.onload = () => showPreview(String(reader.result));
      reader.onerror = () => result.replaceChildren(h('p', { class: 'error' }, 'อ่านไฟล์ไม่ได้'));
      reader.readAsText(fl);
    });

    function showPreview(text) {
      const v = Z.io.validate(text);
      if (!v.data) { result.replaceChildren(h('p', { class: 'error' }, v.errors.join(' · '))); return; }
      validated = v;
      result.replaceChildren(
        h('p', null, `พบโน้ต ${v.data.notes.length} รายการ`, v.data.progress ? ` · ความคืบหน้า ${Object.keys(v.data.progress).length} รายการ` : '', v.data.quizHistory ? ` · ประวัติแบบทดสอบ ${v.data.quizHistory.length} ครั้ง` : ''),
        v.errors.length ? h('p', { class: 'warn small' }, 'ข้ามบางรายการ: ', v.errors.slice(0, 5).join(' · ')) : null,
        h('div', { class: 'row' },
          U.btn('รวมกับข้อมูลเดิม', () => doImport('merge'), { cls: 'btn-primary' }),
          U.btn('แทนที่ทั้งหมด', () => doImport('replace'), { cls: 'btn-danger' })));
    }

    async function doImport(mode) {
      if (!validated) return;
      if (mode === 'replace' && !(await U.confirmDialog('แทนที่โน้ตทั้งหมดด้วยข้อมูลในไฟล์? โน้ตเดิมที่ไม่มีในไฟล์จะหายไป', 'แทนที่'))) return;
      const r = Z.io.apply(validated.data, mode, { progress: withProgress.checked, quiz: withQuiz.checked });
      result.replaceChildren(h('p', { class: 'ok' }, `นำเข้าแล้ว: เพิ่ม ${r.added} · อัปเดต ${r.updated}`));
      U.toast('นำเข้าข้อมูลแล้ว');
    }

    const body = h('div', { class: 'io' },
      h('h3', null, 'Export'),
      h('p', { class: 'muted small' }, 'ดาวน์โหลดเป็นไฟล์ JSON เพื่อสำรองหรือย้ายเครื่อง'),
      h('label', { class: 'check' }, withProgress, ' รวมความคืบหน้าการอ่าน'),
      h('label', { class: 'check' }, withQuiz, ' รวมประวัติแบบทดสอบ'),
      h('div', { class: 'row' }, U.btn('ดาวน์โหลด JSON', () => { Z.io.download({ progress: withProgress.checked, quiz: withQuiz.checked }); U.toast('ดาวน์โหลดแล้ว'); }, { icon: 'download', cls: 'btn-primary' })),
      h('h3', null, 'Import'),
      h('p', { class: 'muted small' }, 'เลือกไฟล์ที่ Export จากแอปนี้ ระบบจะตรวจรูปแบบก่อนนำเข้า'),
      file, result);
    U.modal({ title: 'Export / Import โน้ต', body });
  }

  Z.dialogs = { settings, io };
})(window.ZEN);
