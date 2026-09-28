(function (Z) {
  'use strict';
  const QUIZ_SIZE = 10;

  // Deterministic RNG for tests (mulberry32); defaults to Math.random.
  function seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const r = rng || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function scopes() {
    const D = Z.registry.D;
    const counts = {};
    for (const q of D.quiz) counts[q.scope] = (counts[q.scope] || 0) + 1;
    return Object.entries(counts).map(([id, count]) => ({ id, count, label: scopeLabel(id) }));
  }

  function scopeLabel(scope) {
    const [type, id] = scope.split(':');
    if (type === 'text') { const t = Z.registry.text.get(id); return t ? t.short : id; }
    if (type === 'collection') { const c = Z.registry.collection.get(id); return c ? c.short : id; }
    if (type === 'lineage') return 'สายสืบทอด';
    if (type === 'region') return { japan: 'เซนญี่ปุ่น', korea: 'ซอนเกาหลี', vietnam: 'เทียนเวียดนาม', west: 'เซนยุคใหม่' }[id] || id;
    if (type === 'all') return 'รวมทุกหมวด';
    if (type === 'wrong') return 'ข้อที่เคยตอบผิด';
    return scope;
  }

  function pool(scope) {
    const D = Z.registry.D;
    if (scope === 'all') return D.quiz.slice();
    if (scope === 'wrong') {
      const wrong = new Set(history().flatMap((h) => h.wrongIds || []));
      // drop ids answered correctly later
      const lastRight = new Set();
      for (const h of history().slice().reverse()) for (const id of h.rightIds || []) lastRight.add(id);
      return D.quiz.filter((q) => wrong.has(q.id) && !lastRight.has(q.id));
    }
    return D.quiz.filter((q) => q.scope === scope);
  }

  /** Build a session: up to 10 random questions, choices shuffled (answer re-indexed). */
  function start(scope, rng) {
    const qs = shuffle(pool(scope), rng).slice(0, QUIZ_SIZE).map((q) => prepare(q, rng));
    return { scope, questions: qs, index: 0, answers: [], startedAt: Date.now() };
  }

  function prepare(q, rng) {
    if (q.type === 'mcq') {
      const order = shuffle(q.choices.map((_, i) => i), rng);
      return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
    }
    if (q.type === 'match') {
      const rights = shuffle(q.pairs.map((p) => p[1]), rng);
      return { ...q, options: rights };
    }
    return { ...q };
  }

  /** Returns {correct, correctAnswer}. value: index (mcq), boolean (tf), array of right-values (match). */
  function check(q, value) {
    if (q.type === 'mcq') return { correct: value === q.answer, correctAnswer: q.answer };
    if (q.type === 'tf') return { correct: value === q.answer, correctAnswer: q.answer };
    if (q.type === 'match') {
      const correct = q.pairs.every((p, i) => value && value[i] === p[1]);
      return { correct, correctAnswer: q.pairs.map((p) => p[1]) };
    }
    return { correct: false };
  }

  function answer(session, value) {
    const q = session.questions[session.index];
    const res = check(q, value);
    session.answers[session.index] = { id: q.id, value, correct: res.correct };
    return res;
  }

  function finish(session) {
    const score = session.answers.filter((a) => a && a.correct).length;
    const entry = {
      scope: session.scope,
      date: Date.now(),
      score,
      total: session.questions.length,
      wrongIds: session.answers.filter((a) => a && !a.correct).map((a) => a.id),
      rightIds: session.answers.filter((a) => a && a.correct).map((a) => a.id),
    };
    const h = history();
    h.push(entry);
    Z.store.set('quizHistory', h.slice(-500));
    Z.bus.emit('quiz:finished', entry);
    return entry;
  }

  function history() {
    const h = Z.store.get('quizHistory', []);
    return Array.isArray(h) ? h : [];
  }

  function replaceHistory(h) { Z.store.set('quizHistory', Array.isArray(h) ? h : []); }

  Z.quiz = { start, answer, check, finish, history, replaceHistory, scopes, scopeLabel, pool, shuffle, seeded, QUIZ_SIZE };
})(window.ZEN);
