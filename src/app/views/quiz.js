(function (Z) {
  'use strict';
  const { h, svgEl } = Z.util;
  const U = Z.ui;

  function historyChart(entries) {
    // tiny bar chart of the last 12 attempts (score %)
    const last = entries.slice(-12);
    const W = 240; const H = 60; const bw = W / 12;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H + 14}`, class: 'mini-chart', role: 'img', 'aria-label': 'คะแนนย้อนหลัง' });
    last.forEach((e, i) => {
      const pct = e.total ? e.score / e.total : 0;
      const bh = Math.max(2, pct * H);
      const r = svgEl('rect', { x: i * bw + 2, y: H - bh, width: bw - 4, height: bh, rx: 2, class: pct >= 0.8 ? 'bar-good' : pct >= 0.5 ? 'bar-mid' : 'bar-low' });
      r.appendChild(svgEl('title')).textContent = `${e.score}/${e.total} · ${Z.util.fmtDateTime(e.date)}`;
      svg.appendChild(r);
    });
    svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: H, y2: H, class: 'axis' }));
    return svg;
  }

  Z.views.quizHome = function () {
    const hist = Z.quiz.history();
    const scopes = Z.quiz.scopes();
    const wrongPool = Z.quiz.pool('wrong').length;
    const card = (s) => {
      const hs = hist.filter((x) => x.scope === s.id);
      const best = hs.reduce((m, x) => Math.max(m, x.total ? Math.round((x.score / x.total) * 100) : 0), 0);
      const lastE = hs[hs.length - 1];
      return h('div', { class: 'card glass quiz-card' },
        h('h2', { class: 'card-title' }, s.label),
        h('p', { class: 'small muted' }, `คลัง ${s.count} ข้อ · สุ่มครั้งละ ${Math.min(Z.quiz.QUIZ_SIZE, s.count)} ข้อ`),
        hs.length ? h('p', { class: 'small' }, `ทำแล้ว ${hs.length} ครั้ง · ล่าสุด ${lastE.score}/${lastE.total} · ดีที่สุด ${best}%`) : h('p', { class: 'small muted' }, 'ยังไม่เคยทำ'),
        hs.length ? historyChart(hs) : null,
        h('a', { class: 'btn btn-primary', href: `#/quiz/${encodeURIComponent(s.id)}` }, U.icon('quiz'), h('span', null, 'เริ่มทำ')));
    };
    const el = h('div', { class: 'view view-quiz' },
      U.pageHead('แบบทดสอบ', { zh: '考問 ', sub: 'สุ่ม 10 ข้อต่อครั้ง เฉลยทันทีพร้อมคำอธิบายและลิงก์ไปยังเนื้อหา · ประวัติคะแนนบันทึกในเครื่องนี้' }),
      h('div', { class: 'card-grid' }, scopes.map(card),
        h('div', { class: 'card glass quiz-card' }, h('h2', { class: 'card-title' }, 'รวมทุกหมวด'), h('p', { class: 'small muted' }, `คลัง ${Z.registry.D.quiz.length} ข้อ`), h('a', { class: 'btn btn-primary', href: '#/quiz/all' }, h('span', null, 'เริ่มทำ'))),
        h('div', { class: 'card glass quiz-card' }, h('h2', { class: 'card-title' }, 'ทบทวนข้อที่เคยผิด'), h('p', { class: 'small muted' }, `${wrongPool} ข้อ`),
          wrongPool ? h('a', { class: 'btn btn-primary', href: '#/quiz/wrong' }, h('span', null, 'ทบทวน')) : h('p', { class: 'small' }, 'ยังไม่มีข้อที่ผิด'))),
      hist.length ? U.section('ประวัติคะแนน', h('div', { class: 'table-wrap' }, h('table', { class: 'hist-table' },
        h('thead', null, h('tr', null, ['วันที่', 'หมวด', 'คะแนน'].map((x) => h('th', { scope: 'col' }, x)))),
        h('tbody', null, hist.slice().reverse().slice(0, 30).map((x) => h('tr', null, h('td', null, Z.util.fmtDateTime(x.date)), h('td', null, Z.quiz.scopeLabel(x.scope)), h('td', null, `${x.score}/${x.total}`))))))) : null);
    return { el, title: 'แบบทดสอบ', anchor: { type: 'quiz', id: 'quiz', label: 'แบบทดสอบ', route: '/quiz' } };
  };

  Z.views.quizRun = function (params) {
    const scope = params.scope;
    const host = h('div', { class: 'quiz-run' });
    let session = Z.quiz.start(scope);
    const label = Z.quiz.scopeLabel(scope);

    function refLink(ref) {
      const r = Z.registry.routeFromRef(ref);
      return r.exists && r.route ? h('a', { class: 'link-small', href: '#' + r.route, target: '_self' }, '→ อ่านเพิ่ม: ' + r.label) : null;
    }

    function renderQuestion() {
      const q = session.questions[session.index];
      if (!q) return renderSummary();
      const feedback = h('div', { class: 'quiz-feedback', role: 'status', 'aria-live': 'polite' });
      const nextBtn = U.btn(session.index + 1 < session.questions.length ? 'ข้อถัดไป' : 'ดูผลรวม', () => { session.index++; renderQuestion(); }, { cls: 'btn-primary', icon: 'right' });
      nextBtn.hidden = true;
      let answered = false;
      const reveal = (res) => {
        answered = true;
        feedback.replaceChildren(h('p', { class: res.correct ? 'ok' : 'error' }, res.correct ? '✓ ถูกต้อง' : '✗ ยังไม่ถูก'), h('p', null, U.rich(q.explain)), refLink(q.ref));
        nextBtn.hidden = false;
        nextBtn.focus();
      };
      let body;
      if (q.type === 'mcq' || q.type === 'tf') {
        const opts = q.type === 'tf' ? [['ถูก', true], ['ผิด', false]] : q.choices.map((c, i) => [c, i]);
        const buttons = opts.map(([txt, val]) => h('button', { type: 'button', class: 'choice', on: { click: () => {
          if (answered) return;
          const res = Z.quiz.answer(session, val);
          buttons.forEach((b, i) => {
            b.disabled = true;
            if (opts[i][1] === res.correctAnswer) b.classList.add('correct');
            else if (opts[i][1] === val) b.classList.add('wrong');
          });
          reveal(res);
        } } }, U.rich(String(txt))));
        body = h('div', { class: 'choices', role: 'group' }, buttons);
      } else {
        const selects = q.pairs.map((p) => h('select', { class: 'input select', 'aria-label': `คู่ของ ${p[0]}` }, h('option', { value: '' }, '— เลือก —'), q.options.map((o) => h('option', { value: o }, o))));
        const submit = U.btn('ตรวจคำตอบ', () => {
          if (answered) return;
          const val = selects.map((s) => s.value);
          const res = Z.quiz.answer(session, val);
          selects.forEach((s, i) => { s.disabled = true; s.classList.add(val[i] === q.pairs[i][1] ? 'correct' : 'wrong'); if (val[i] !== q.pairs[i][1]) s.after(h('span', { class: 'small ok' }, ' → ' + q.pairs[i][1])); });
          submit.disabled = true;
          reveal(res);
        }, { cls: 'btn-primary' });
        body = h('div', { class: 'match' }, h('table', { class: 'match-table' }, h('tbody', null, q.pairs.map((p, i) => h('tr', null, h('td', null, U.rich(p[0])), h('td', null, selects[i]))))), submit);
      }
      host.replaceChildren(
        h('div', { class: 'quiz-progress' }, h('span', null, `ข้อ ${session.index + 1} / ${session.questions.length}`), U.progressBar(Math.round((session.index / session.questions.length) * 100))),
        h('div', { class: 'quiz-q glass' }, h('p', { class: 'quiz-type small muted' }, q.type === 'mcq' ? 'เลือกคำตอบที่ถูกต้อง' : q.type === 'tf' ? 'ถูกหรือผิด' : 'จับคู่ให้ถูกต้อง'), h('h2', { class: 'quiz-question' }, U.rich(q.q)), body, feedback, h('div', { class: 'row row-end' }, nextBtn)));
    }

    function renderSummary() {
      const entry = Z.quiz.finish(session);
      const pct = entry.total ? Math.round((entry.score / entry.total) * 100) : 0;
      host.replaceChildren(h('div', { class: 'quiz-summary glass' },
        h('h2', null, `ได้ ${entry.score} / ${entry.total} (${pct}%)`),
        U.progressBar(pct),
        h('ol', { class: 'review' }, session.questions.map((q, i) => { const a = session.answers[i]; return h('li', { class: a && a.correct ? 'ok' : 'error' }, a && a.correct ? '✓ ' : '✗ ', U.rich(q.q), ' ', refLink(q.ref)); })),
        h('div', { class: 'row' },
          U.btn('ทำอีกครั้ง (สุ่มใหม่)', () => { session = Z.quiz.start(scope); renderQuestion(); }, { cls: 'btn-primary' }),
          h('a', { class: 'btn btn-ghost', href: '#/quiz' }, 'กลับหน้ารวมแบบทดสอบ'))));
    }

    if (!session.questions.length) host.replaceChildren(U.empty('ไม่มีคำถามในหมวดนี้'));
    else renderQuestion();
    const el = h('div', { class: 'view view-quiz-run' }, U.pageHead(label, { crumbs: [{ label: 'แบบทดสอบ', route: '/quiz' }, { label }] }), host);
    return { el, title: 'แบบทดสอบ: ' + label, anchor: { type: 'quiz', id: scope, label: 'แบบทดสอบ ' + label, route: '/quiz/' + scope }, _session: () => session };
  };
})(window.ZEN);
