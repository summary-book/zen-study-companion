(function (Z) {
  'use strict';
  // Export / import of notes (+ optionally progress and quiz history) as JSON.
  const APP = 'zen-study-companion';

  function exportData(opts) {
    const o = opts || {};
    const payload = { app: APP, schemaVersion: Z.store.SCHEMA_VERSION, exportedAt: new Date().toISOString(), notes: Z.notes.all() };
    if (o.progress) payload.progress = Z.progress.state();
    if (o.quiz) payload.quizHistory = Z.quiz.history();
    return payload;
  }

  function download(opts) {
    const data = exportData(opts);
    Z.util.download(`zen-study-notes-${Z.util.todayStamp()}.json`, JSON.stringify(data, null, 2));
    return data;
  }

  const isStr = (v) => typeof v === 'string';
  const isNum = (v) => typeof v === 'number' && isFinite(v);

  /** Validate and normalise an import payload. Returns {ok, errors[], data?} */
  function validate(input) {
    const errors = [];
    let obj = input;
    if (isStr(input)) {
      try { obj = JSON.parse(input); } catch (e) { return { ok: false, errors: ['ไฟล์ไม่ใช่ JSON ที่ถูกต้อง'] }; }
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, errors: ['รูปแบบไฟล์ไม่ถูกต้อง'] };
    if (obj.app !== APP) errors.push('ไฟล์นี้ไม่ได้มาจาก Zen Study Companion');
    if (!isNum(obj.schemaVersion) || obj.schemaVersion > Z.store.SCHEMA_VERSION) errors.push('schemaVersion ไม่รองรับ');
    if (!Array.isArray(obj.notes)) errors.push('ไม่มีรายการโน้ต (notes)');
    if (errors.length) return { ok: false, errors };

    const notes = [];
    obj.notes.forEach((n, i) => {
      if (!n || typeof n !== 'object') { errors.push(`โน้ตลำดับ ${i + 1}: ไม่ใช่ object`); return; }
      if (!isStr(n.id) || !/^[\w-]{1,80}$/.test(n.id)) { errors.push(`โน้ตลำดับ ${i + 1}: id ไม่ถูกต้อง`); return; }
      if (!isStr(n.body) && !isStr(n.title)) { errors.push(`โน้ตลำดับ ${i + 1}: ไม่มีเนื้อหา`); return; }
      notes.push({
        id: n.id,
        anchor: Z.notes.cleanAnchor(n.anchor),
        title: String(n.title || '').slice(0, Z.notes.MAX_TITLE),
        body: String(n.body || '').slice(0, Z.notes.MAX_BODY),
        tags: Z.notes.cleanTags(Array.isArray(n.tags) ? n.tags : []),
        kind: Z.notes.KINDS[n.kind] ? n.kind : 'general',
        createdAt: isNum(n.createdAt) ? n.createdAt : Date.now(),
        updatedAt: isNum(n.updatedAt) ? n.updatedAt : Date.now(),
      });
    });
    let progress;
    if (obj.progress !== undefined) {
      if (obj.progress && typeof obj.progress === 'object' && !Array.isArray(obj.progress)) {
        progress = {};
        for (const [k, v] of Object.entries(obj.progress)) if (/^(chapter|koan|ox):[\w/-]{1,120}$/.test(k) && isNum(v)) progress[k] = v;
      } else errors.push('progress ไม่ถูกต้อง');
    }
    let quizHistory;
    if (obj.quizHistory !== undefined) {
      if (Array.isArray(obj.quizHistory)) {
        quizHistory = obj.quizHistory.filter((h) => h && isStr(h.scope) && isNum(h.score) && isNum(h.total) && isNum(h.date))
          .map((h) => ({ scope: h.scope, date: h.date, score: h.score, total: h.total, wrongIds: (h.wrongIds || []).filter(isStr), rightIds: (h.rightIds || []).filter(isStr) }));
      } else errors.push('quizHistory ไม่ถูกต้อง');
    }
    return { ok: errors.length === 0, errors, data: { notes, progress, quizHistory } };
  }

  /** mode: 'merge' | 'replace'. Applies validated data. */
  function apply(data, mode, opts) {
    const o = opts || {};
    const res = Z.notes.importNotes(data.notes, mode);
    if (o.progress && data.progress) {
      Z.progress.replace(mode === 'replace' ? data.progress : { ...Z.progress.state(), ...data.progress });
    }
    if (o.quiz && data.quizHistory) {
      Z.quiz.replaceHistory(mode === 'replace' ? data.quizHistory : Z.quiz.history().concat(data.quizHistory));
    }
    Z.search.invalidate();
    return res;
  }

  Z.io = { exportData, download, validate, apply, APP };
})(window.ZEN);
