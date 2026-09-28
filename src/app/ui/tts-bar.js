(function (Z) {
  'use strict';
  const { h } = Z.util;
  const U = Z.ui;
  // Read-aloud bar: collects readable elements from the current <main> by language.
  const LANG_LABEL = { th: 'ไทย', zh: '中文', ja: '日本語' };
  let bar;
  let lang = 'th';
  let playBtn;
  let msg;
  let langWrap;

  function collect(which) {
    const main = document.getElementById('main');
    if (!main) return [];
    let nodes = [];
    if (which === 'zh') nodes = Array.from(main.querySelectorAll('.passage .layer-zh[lang="zh-Hant"]'));
    else if (which === 'ja') nodes = Array.from(main.querySelectorAll('.passage .layer-zh[lang="ja"]'));
    else nodes = Array.from(main.querySelectorAll('.page-title, .prose > p, .prose-h, .prose-list > li, .callout, .passage .layer-th'));
    return nodes.filter((el) => !el.closest('[hidden], .collapsed-body')).map((el) => {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.th-tag, .title-zh').forEach((x) => x.remove());
      const target = el.closest('.passage') || el;
      return { text: clone.textContent.trim(), lang: which, el: target };
    }).filter((x) => x.text);
  }

  function available() {
    const out = [];
    const main = document.getElementById('main');
    if (!main) return out;
    out.push('th');
    if (main.querySelector('.passage .layer-zh[lang="zh-Hant"]')) out.push('zh');
    if (main.querySelector('.passage .layer-zh[lang="ja"]')) out.push('ja');
    return out;
  }

  /** Reading-speed control [🔊 − 1x +]; placed in the topbar so it is always reachable. */
  function rateControl() {
    const label = h('span', { class: 'rate-value', 'aria-live': 'polite' });
    const slower = h('button', { type: 'button', class: 'rate-btn rate-slower', title: 'อ่านช้าลง', 'aria-label': 'อ่านช้าลง', on: { click: () => Z.tts.step(-1) } }, '−');
    const faster = h('button', { type: 'button', class: 'rate-btn rate-faster', title: 'อ่านเร็วขึ้น', 'aria-label': 'อ่านเร็วขึ้น', on: { click: () => Z.tts.step(1) } }, '+');
    const el = h('div', { class: 'rate-control', role: 'group', 'aria-label': 'ความเร็วเสียงอ่าน', title: 'ความเร็วเสียงอ่าน (0.75x–2x)' },
      U.icon('speaker', 'rate-icon'), slower, label, faster);
    const sync = () => {
      const r = Z.settings.get().ttsRate;
      const R = Z.settings.RATES;
      label.textContent = r + 'x';
      slower.disabled = r <= R[0];
      faster.disabled = r >= R[R.length - 1];
    };
    sync();
    Z.bus.on('settings', sync);
    if (!Z.tts.supported()) el.hidden = true;
    return el;
  }

  function create() {
    playBtn = U.btn('ฟังทั้งหน้า', togglePlay, { icon: 'play', cls: 'btn-primary btn-small', title: 'อ่านทั้งหน้า / หยุดชั่วคราว' });
    const stopBtn = U.btn('', () => Z.tts.stop(), { icon: 'stop', cls: 'btn-ghost btn-icon btn-small', title: 'หยุด', aria: 'หยุด' });
    langWrap = h('div', { class: 'tts-langs', role: 'group', 'aria-label': 'ภาษาที่อ่าน' });
    msg = h('span', { class: 'tts-msg', role: 'status' });
    bar = h('div', { id: 'tts-bar', class: 'tts-bar glass-strong', hidden: true, 'aria-label': 'อ่านออกเสียง' },
      U.icon('speaker', 'tts-icon'), langWrap, playBtn, stopBtn, msg);
    Z.bus.on('tts:state', render);
    if (typeof window !== 'undefined' && window.speechSynthesis && 'onvoiceschanged' in window.speechSynthesis) {
      try { window.speechSynthesis.addEventListener('voiceschanged', () => refresh()); } catch (e) { /* ignore */ }
    }
    return bar;
  }

  function refresh(show) {
    if (!bar) return;
    if (show !== undefined) bar.hidden = !show || !Z.tts.supported();
    document.body.classList.toggle('has-tts', !bar.hidden);
    const langs = available();
    if (!langs.includes(lang)) lang = 'th';
    langWrap.replaceChildren(...langs.map((l) => h('button', { type: 'button', class: 'chip-btn', 'aria-pressed': String(l === lang), on: { click: () => { lang = l; Z.tts.stop(); refresh(); } } }, LANG_LABEL[l])));
    const ok = Z.tts.hasVoice(lang);
    playBtn.disabled = !ok;
    msg.textContent = ok ? '' : `ไม่พบเสียงภาษา${LANG_LABEL[lang]}ในเครื่องนี้ (ติดตั้ง voice ในระบบปฏิบัติการ)`;
  }

  function togglePlay() {
    const st = Z.tts.state();
    if (st.playing) { Z.tts.pause(); return; }
    const items = collect(lang);
    if (!items.length) { msg.textContent = 'ไม่มีข้อความให้อ่านในหน้านี้'; return; }
    Z.tts.play(items);
  }

  function render(st) {
    if (!playBtn) return;
    const label = playBtn.querySelector('span');
    playBtn.replaceChild(U.icon(st.playing && !st.paused ? 'pause' : 'play'), playBtn.querySelector('svg'));
    if (label) label.textContent = st.playing ? (st.paused ? 'เล่นต่อ' : 'หยุดชั่วคราว') : 'ฟังทั้งหน้า';
  }

  Z.ttsBar = { create, refresh, collect, available, rateControl };
})(window.ZEN);
