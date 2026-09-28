// Load dist/zen-study.html in jsdom with browser APIs the app needs mocked.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { ROOT } from '../../tools/manifest.mjs';

const HTML = readFileSync(join(ROOT, 'dist/zen-study.html'), 'utf8');

/**
 * opts: { width=1280, storage: 'ok'|'throw', voices: ['th-TH',...], hash, preload: {key: value} }
 * returns { window, document, Z, errors, go(hash) }
 */
export async function loadApp(opts = {}) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e));
  vc.on('error', (...a) => errors.push(a.map(String).join(' ')));
  const width = opts.width || 1280;
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/zen-study.html' + (opts.hash || ''),
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.matchMedia = (q) => {
        const min = /min-width:\s*(\d+)/.exec(q);
        const max = /max-width:\s*(\d+)/.exec(q);
        const matches = (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
        return { matches, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
      };
      window.CSS = window.CSS || {};
      window.CSS.escape = window.CSS.escape || ((s) => String(s).replace(/[^\w-]/g, (c) => '\\' + c));
      window.Element.prototype.scrollIntoView = function () {};
      window.scrollTo = () => {};
      window.URL.createObjectURL = () => 'blob:mock';
      window.URL.revokeObjectURL = () => {};
      // speechSynthesis mock
      const spoken = [];
      const voices = (opts.voices || ['th-TH', 'zh-CN', 'ja-JP']).map((lang) => ({ lang, name: 'mock ' + lang }));
      window.SpeechSynthesisUtterance = function (text) { this.text = text; };
      window.speechSynthesis = {
        spoken,
        getVoices: () => voices,
        speak(u) { spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); setTimeout(() => u.onend && u.onend(), 0); },
        cancel() {}, pause() {}, resume() {},
        addEventListener() {},
        onvoiceschanged: null,
      };
      if (opts.storage === 'throw') {
        Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: storage disabled'); } });
      } else if (opts.preload) {
        for (const [k, v] of Object.entries(opts.preload)) window.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    },
  });
  const { window } = dom;
  await new Promise((r) => setTimeout(r, 0));
  const Z = window.ZEN;
  const go = async (hash) => {
    window.location.hash = hash;
    await new Promise((r) => setTimeout(r, 5));
    if (window.location.hash !== hash && hash !== '') window.ZEN.render();
    return window.document.getElementById('main');
  };
  return { window, document: window.document, Z, errors, go, dom };
}
