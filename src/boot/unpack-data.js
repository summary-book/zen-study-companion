// Unpacks the embedded content data before the app starts:
// <script id="zen-data-z"> base64 → raw DEFLATE → UTF-8 JSON → window.ZEN_DATA.
// build.mjs packs src/data/** this way so the single offline file stays small (SPEC §9, approved 2026-09-28).
// The inflater is tiny-inflate 1.0.3 (MIT, © Devon Govett), inlined by build.mjs at the marker below.
(function () {
  'use strict';
  var module = { exports: {} };
  /*__INFLATE__*/
  var inflate = module.exports;

  // Fallback for engines without TextDecoder (e.g. jsdom in tests)
  function utf8(b) {
    var s = '';
    var chunk = [];
    var i = 0;
    while (i < b.length) {
      var c = b[i++];
      if (c > 239) {
        c = (((c & 7) << 18) | ((b[i++] & 63) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63)) - 0x10000;
        chunk.push(0xd800 + (c >> 10), 0xdc00 + (c & 1023));
      } else if (c > 223) chunk.push(((c & 15) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63));
      else if (c > 127) chunk.push(((c & 31) << 6) | (b[i++] & 63));
      else chunk.push(c);
      if (chunk.length >= 8192) { s += String.fromCharCode.apply(null, chunk); chunk = []; }
    }
    return s + String.fromCharCode.apply(null, chunk);
  }

  // Adler-32 of the packed bytes: a damaged stream is rejected before inflating (tiny-inflate can loop on bad input)
  function adler32(u) {
    var a = 1;
    var b = 0;
    for (var i = 0; i < u.length;) {
      for (var n = Math.min(u.length, i + 5552); i < n; i++) { a += u[i]; b += a; }
      a %= 65521;
      b %= 65521;
    }
    return (b * 65536 + a) >>> 0;
  }

  var el = document.getElementById('zen-data-z');
  try {
    var bin = atob(el.textContent.replace(/\s+/g, ''));
    var src = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) src[i] = bin.charCodeAt(i);
    if (adler32(src) !== Number(el.getAttribute('data-adler32'))) throw new Error('packed data checksum mismatch');
    var size = Number(el.getAttribute('data-bytes'));
    var out = inflate(src, new Uint8Array(size));
    if (out.length !== size) throw new Error('packed data size mismatch');
    window.ZEN_DATA = JSON.parse(typeof TextDecoder === 'function' ? new TextDecoder('utf-8').decode(out) : utf8(out));
  } catch (e) {
    window.ZEN_DATA = null;
    console.error('Zen Study Companion: could not unpack the content data', e);
    var app = document.getElementById('app');
    if (app) app.textContent = 'เปิดข้อมูลเนื้อหาไม่สำเร็จ — ไฟล์อาจเสียหายหรือไม่ครบ โปรดดาวน์โหลดไฟล์ใหม่';
  }
  if (el && el.parentNode) el.parentNode.removeChild(el);
})();
