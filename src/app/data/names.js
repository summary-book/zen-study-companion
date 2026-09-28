(function (Z) {
  'use strict';
  // Person names in several systems. Setting "nameMode" chooses the primary display.
  const MODES = {
    th: 'ไทย (ถอดเสียงจีนกลาง)',
    thCommon: 'ชื่อที่ใช้ทั่วไปในไทย',
    ja: 'ญี่ปุ่น (โรมาจิ)',
    native: 'ตามประเทศของบุคคล',
  };

  function primary(p, mode) {
    const n = p.names || {};
    const m = mode || (Z.settings ? Z.settings.get().nameMode : 'th');
    if (m === 'thCommon' && n.thCommon && n.thCommon.length) return n.thCommon[0];
    if (m === 'ja' && n.romaji) return n.romaji.replace(/\s*\(.*\)$/, '');
    if (m === 'native') {
      if (p.country === 'japan' && n.romaji) return n.romaji.replace(/\s*\(.*\)$/, '');
      if (p.country === 'korea' && n.rr) return n.rr;
      if (p.country === 'vietnam' && n.vi) return n.vi;
      if (p.country === 'india' && (n.sa || n.pali)) return n.sa || n.pali;
    }
    return n.th;
  }

  /** All name variants for display: [{label, value, lang}] */
  function variants(p) {
    const n = p.names || {};
    const out = [];
    const push = (label, value, lang) => { if (value) out.push({ label, value, lang }); };
    push('漢字', n.zh, 'zh-Hant');
    if (n.zhS && n.zhS !== n.zh) push('简体', n.zhS, 'zh-Hans');
    push('พินอิน', n.pinyin, 'zh-Latn-pinyin');
    push('ไทย', n.th, 'th');
    if (n.thCommon) push('ชื่อที่ใช้ในไทย', n.thCommon.join(' / '), 'th');
    push('ญี่ปุ่น', [n.ja, n.romaji].filter(Boolean).join(' · '), 'ja');
    push('เกาหลี', [n.ko, n.rr].filter(Boolean).join(' · '), 'ko');
    push('เวียดนาม', n.vi, 'vi');
    push('สันสกฤต', n.sa, 'sa');
    push('บาลี', n.pali, 'pi');
    push('อังกฤษ', n.en, 'en');
    return out;
  }

  /** Every searchable name form. */
  function allForms(p) {
    const n = p.names || {};
    return [n.zh, n.zhS, n.pinyin, n.th, ...(n.thCommon || []), n.ja, n.romaji, n.ko, n.rr, n.vi, n.sa, n.pali, n.en].filter(Boolean);
  }

  Z.names = { primary, variants, allForms, MODES };
})(window.ZEN);
