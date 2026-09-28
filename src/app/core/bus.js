(function (Z) {
  'use strict';
  const handlers = {};
  Z.bus = {
    on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return () => this.off(ev, fn); },
    off(ev, fn) { handlers[ev] = (handlers[ev] || []).filter((f) => f !== fn); },
    emit(ev, payload) {
      for (const fn of handlers[ev] || []) {
        try { fn(payload); } catch (e) { console.error('[bus]', ev, e); }
      }
    },
  };
})(window.ZEN);
