(function (Z) {
  'use strict';
  // Hash router: "#/texts/heart-sutra/c1?hl=空&p=hs-3"
  const routes = [];

  function add(pattern, view) {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
    routes.push({ pattern, re, keys, view });
  }

  function parse(hash) {
    let h = (hash || '').replace(/^#/, '');
    if (!h || h === '/') h = '/';
    const [path, qs] = h.split('?');
    const query = {};
    if (qs) {
      for (const part of qs.split('&')) {
        if (!part) continue;
        const [k, v = ''] = part.split('=');
        try { query[decodeURIComponent(k)] = decodeURIComponent(v); } catch (e) { query[k] = v; }
      }
    }
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { try { params[k] = decodeURIComponent(m[i + 1]); } catch (e) { params[k] = m[i + 1]; } });
        return { path, params, query, view: r.view, pattern: r.pattern };
      }
    }
    return { path, params: {}, query, view: 'notfound', pattern: null };
  }

  function href(path, query) {
    let s = '#' + path;
    if (query) {
      const q = Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      if (q) s += '?' + q;
    }
    return s;
  }

  function go(path, query) {
    const target = href(path, query);
    if (location.hash === target) Z.bus.emit('route:refresh');
    else location.hash = target;
  }

  function current() { return parse(location.hash); }

  Z.router = { add, parse, href, go, current, routes };
})(window.ZEN);
