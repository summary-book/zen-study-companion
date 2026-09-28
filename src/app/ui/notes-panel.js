(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  // Right-hand notes pane: shows notes attached to the current anchor + a composer.
  let root;
  let anchor = { type: 'general', label: 'ทั่วไป' };
  let editingId = null;
  const f = {};

  function tagEditor(initial) {
    let tags = initial.slice();
    const list = h('div', { class: 'tag-chips' });
    const listId = 'tag-suggest';
    const input = h('input', { type: 'text', class: 'input tag-input', placeholder: 'เพิ่มแท็ก แล้วกด Enter', 'aria-label': 'แท็ก', list: listId });
    const datalist = h('datalist', { id: listId });
    const render = () => {
      list.replaceChildren(...tags.map((t) => h('span', { class: 'chip chip-tag' }, '#' + t,
        h('button', { type: 'button', class: 'chip-x', 'aria-label': `ลบแท็ก ${t}`, on: { click: () => { tags = tags.filter((x) => x !== t); render(); } } }, '×'))));
      datalist.replaceChildren(...Z.notes.allTags().filter((t) => !tags.includes(t)).map((t) => h('option', { value: t })));
    };
    const commit = () => {
      const parts = input.value.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean);
      if (parts.length) { tags = Z.notes.cleanTags(tags.concat(parts)); input.value = ''; render(); }
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
      else if (e.key === 'Backspace' && !input.value && tags.length) { tags.pop(); render(); }
    });
    input.addEventListener('blur', commit);
    render();
    return { el: h('div', { class: 'tag-editor' }, list, input, datalist), get: () => { commit(); return tags; }, set: (t) => { tags = t.slice(); render(); } };
  }

  function composer() {
    f.title = h('input', { type: 'text', class: 'input', placeholder: 'หัวข้อ (ไม่บังคับ)', 'aria-label': 'หัวข้อโน้ต', maxlength: String(Z.notes.MAX_TITLE) });
    f.kind = h('select', { class: 'input select', 'aria-label': 'ประเภทโน้ต' }, Object.entries(Z.notes.KINDS).map(([k, v]) => h('option', { value: k }, v)));
    f.body = h('textarea', { class: 'input textarea', rows: '4', placeholder: 'จดคำถาม ข้อสังเกต หรือสิ่งที่จะค้นคว้าต่อ…', 'aria-label': 'เนื้อหาโน้ต' });
    f.tags = tagEditor([]);
    f.save = U.btn('บันทึกโน้ต', save, { icon: 'plus', cls: 'btn-primary' });
    f.cancel = U.btn('ยกเลิกแก้ไข', resetForm, { cls: 'btn-ghost', title: 'ยกเลิกการแก้ไข' });
    f.cancel.hidden = true;
    f.body.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save(); });
    return h('form', { class: 'note-composer', on: { submit: (e) => { e.preventDefault(); save(); } } },
      h('div', { class: 'row' }, f.title, f.kind), f.body, f.tags.el, h('div', { class: 'row row-end' }, f.cancel, f.save));
  }

  function save() {
    const data = { title: f.title.value.trim(), body: f.body.value.trim(), kind: f.kind.value, tags: f.tags.get() };
    if (!data.title && !data.body) { U.toast('โน้ตว่าง — พิมพ์อะไรสักหน่อยก่อน'); f.body.focus(); return; }
    if (editingId) { Z.notes.update(editingId, data); U.toast('แก้ไขโน้ตแล้ว'); } else { Z.notes.create({ ...data, anchor }); U.toast('บันทึกโน้ตแล้ว'); }
    resetForm();
  }

  function resetForm() {
    editingId = null;
    f.title.value = '';
    f.body.value = '';
    f.kind.value = 'question';
    f.tags.set([]);
    f.save.querySelector('span').textContent = 'บันทึกโน้ต';
    f.cancel.hidden = true;
  }

  function edit(note) {
    editingId = note.id;
    f.title.value = note.title;
    f.body.value = note.body;
    f.kind.value = note.kind;
    f.tags.set(note.tags || []);
    f.save.querySelector('span').textContent = 'บันทึกการแก้ไข';
    f.cancel.hidden = false;
    f.body.focus();
  }

  async function del(note) {
    if (await U.confirmDialog(`ลบโน้ต "${note.title || note.body.slice(0, 30)}" ? การลบกู้คืนไม่ได้`, 'ลบ')) {
      Z.notes.remove(note.id);
      if (editingId === note.id) resetForm();
      U.toast('ลบโน้ตแล้ว');
    }
  }

  function noteCard(note, opts) {
    const o = opts || {};
    const a = note.anchor || {};
    return h('article', { class: 'note-card', dataset: { id: note.id } },
      h('div', { class: 'note-card-head' },
        h('span', { class: `badge kind-${note.kind}` }, Z.notes.KINDS[note.kind] || note.kind),
        note.title ? h('h3', { class: 'note-title' }, note.title) : null),
      note.body ? h('p', { class: 'note-body' }, note.body) : null,
      (note.tags || []).length ? h('div', { class: 'tag-chips' }, note.tags.map((t) => h('a', { class: 'chip chip-tag', href: Z.router.href('/notes', { tag: t }) }, '#' + t))) : null,
      h('div', { class: 'note-card-foot' },
        o.showAnchor && a.label ? h('a', { class: 'note-anchor', href: a.route ? '#' + a.route : '#/notes' }, '↳ ', a.label) : null,
        h('time', { class: 'note-time', datetime: new Date(note.updatedAt).toISOString() }, Z.util.fmtDateTime(note.updatedAt)),
        h('span', { class: 'spacer' }),
        U.btn('', () => (o.onEdit ? o.onEdit(note) : edit(note)), { icon: 'edit', cls: 'btn-ghost btn-icon btn-small', title: 'แก้ไข', aria: 'แก้ไขโน้ต' }),
        U.btn('', () => del(note), { icon: 'trash', cls: 'btn-ghost btn-icon btn-small', title: 'ลบ', aria: 'ลบโน้ต' })));
  }

  function renderList() {
    if (!root) return;
    const list = Z.notes.forAnchor(anchor).sort((a, b) => b.updatedAt - a.updatedAt);
    root.querySelector('.notes-anchor-label').textContent = anchor.label || 'ทั่วไป';
    const host = root.querySelector('.notes-list');
    host.replaceChildren(...(list.length ? list.map((n) => noteCard(n)) : [h('p', { class: 'muted small' }, 'ยังไม่มีโน้ตในตำแหน่งนี้')]));
    const total = Z.notes.all().length;
    root.querySelector('.notes-total').textContent = `ทั้งหมด ${total}`;
    Z.bus.emit('notes:count', list.length);
  }

  function mount(el) {
    root = el;
    el.replaceChildren(
      h('div', { class: 'notes-head' },
        h('h2', { class: 'notes-heading' }, U.icon('note'), 'โน้ต'),
        h('a', { href: '#/notes', class: 'notes-total link-small' }, ''),
        U.btn('', () => Z.dialogs.io(), { icon: 'download', cls: 'btn-ghost btn-icon btn-small', title: 'Export / Import', aria: 'Export หรือ Import โน้ต' }),
        U.btn('', () => Z.layout.toggleNotes(), { icon: 'x', cls: 'btn-ghost btn-icon btn-small notes-close', title: 'ซ่อนแผงโน้ต', aria: 'ซ่อนแผงโน้ต' })),
      h('p', { class: 'notes-anchor' }, 'ผูกกับ: ', h('strong', { class: 'notes-anchor-label' }, '')),
      composer(),
      h('div', { class: 'notes-list', 'aria-live': 'polite' }));
    resetForm();
    Z.bus.on('notes:changed', renderList);
    renderList();
  }

  function setAnchor(a) {
    anchor = a && a.type ? a : { type: 'general', label: 'ทั่วไป' };
    if (editingId) resetForm();
    renderList();
  }

  Z.notesPanel = { mount, setAnchor, noteCard, getAnchor: () => anchor, edit };
})(window.ZEN);
