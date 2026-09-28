// The content data is packed into dist/zen-study.html (JSON → raw DEFLATE → base64) and unpacked at start-up
// by src/boot/unpack-data.js (SPEC §9). These tests check the round trip and the failure path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';
import { JSDOM, VirtualConsole } from 'jsdom';
import { ROOT } from '../../tools/manifest.mjs';
import { loadData } from '../helpers/load-data.mjs';
import { loadApp } from '../helpers/load-app.mjs';

const HTML = readFileSync(join(ROOT, 'dist/zen-study.html'), 'utf8');
const TAG = /<script id="zen-data-z" type="application\/octet-stream" data-bytes="(\d+)" data-adler32="(\d+)">([A-Za-z0-9+/=]+)<\/script>/;

test('dist embeds the data packed, not as plain script', () => {
  const m = TAG.exec(HTML);
  assert.ok(m, 'packed data element present');
  assert.ok(!/ZEN_DATA\.(people|koans)\.push/.test(HTML), 'no plain data files inlined');
  const json = zlib.inflateRawSync(Buffer.from(m[3], 'base64'));
  assert.equal(json.length, Number(m[1]), 'data-bytes matches the unpacked size');
  const packed = JSON.parse(json.toString('utf8'));
  const src = loadData();
  for (const k of ['sources', 'schools', 'people', 'timeline', 'texts', 'collections', 'koans', 'practice', 'oxherding', 'glossary', 'theravada', 'quiz']) {
    assert.equal(packed[k].length, src[k].length, `${k} count`);
  }
  assert.deepEqual(packed.koans.map((k) => k.id), src.koans.map((k) => k.id));
  assert.ok(Object.keys(packed.gen.pinyin).length > 1000, 'generated pinyin included');
  assert.ok(packed.svg['ox-01'] && packed.svg['ox-01'].startsWith('<svg'), 'SVG drawings included');
});

test('app unpacks the data at start-up and removes the packed element', async () => {
  const { window, document, errors } = await loadApp();
  assert.equal(errors.length, 0, errors.join('\n'));
  assert.ok(window.ZEN_DATA && window.ZEN_DATA.koans.length > 0);
  assert.equal(document.getElementById('zen-data-z'), null);
  // Thai and CJK survive the UTF-8 decoding
  const hs = window.ZEN_DATA.texts.find((t) => t.id === 'heart-sutra');
  assert.ok(/[฀-๿]/.test(JSON.stringify(hs)) && /般若/.test(JSON.stringify(hs)));
  const k = window.ZEN_DATA.koans[0];
  const s = loadData().koans.find((x) => x.id === k.id);
  assert.equal(k.layers.case[0].zh, s.layers.case[0].zh);
  assert.equal(k.layers.case[0].th, s.layers.case[0].th);
});

test('fallback UTF-8 decoder (no TextDecoder) gives exactly the same data', async () => {
  const vc = new VirtualConsole();
  const errs = [];
  vc.on('jsdomError', (e) => errs.push(e));
  const dom = new JSDOM(HTML.replace(/<script id="zen-app">[\s\S]*?<\/script>/, ''), {
    runScripts: 'dangerously', virtualConsole: vc,
    beforeParse(w) { w.TextDecoder = undefined; },
  });
  assert.equal(errs.length, 0, errs.join('\n'));
  const m = TAG.exec(HTML);
  const expected = zlib.inflateRawSync(Buffer.from(m[3], 'base64')).toString('utf8');
  assert.equal(JSON.stringify(dom.window.ZEN_DATA), JSON.stringify(JSON.parse(expected)));
});

test('a damaged file shows a message instead of crashing', async () => {
  const vc = new VirtualConsole();
  const logged = [];
  const uncaught = [];
  vc.on('jsdomError', (e) => uncaught.push(e));
  vc.on('error', (...a) => logged.push(a.map(String).join(' ')));
  // one flipped character in the middle of the packed data
  const broken = HTML.replace(TAG, (_, n, a, b64) => {
    const i = b64.length >> 1;
    return `<script id="zen-data-z" type="application/octet-stream" data-bytes="${n}" data-adler32="${a}">${b64.slice(0, i)}${b64[i] === 'A' ? 'B' : 'A'}${b64.slice(i + 1)}</script>`;
  });
  const dom = new JSDOM(broken, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(uncaught.length, 0, uncaught.join('\n'));
  assert.equal(dom.window.ZEN_DATA, null);
  assert.match(dom.window.document.getElementById('app').textContent, /เปิดข้อมูลเนื้อหาไม่สำเร็จ/);
  assert.ok(logged.some((l) => /could not unpack/.test(l)));
});
