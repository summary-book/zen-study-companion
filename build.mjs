// Build: src/ → dist/zen-study.html (single offline file) + dist/index.html
// Steps: node --check → pinyin generation → Tailwind → font subsetting → pack data + inline → re-check → size report.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { dataFiles, appFiles, svgFiles, ROOT, rel } from './tools/manifest.mjs';

const require = createRequire(import.meta.url);
const DIST = join(ROOT, 'dist');
const TMP = join(ROOT, '.build');
mkdirSync(DIST, { recursive: true });
mkdirSync(TMP, { recursive: true });
const t0 = Date.now();
const log = (...a) => console.log('[build]', ...a);

// 1. syntax check every source file
const LOADER = join(ROOT, 'src/boot/unpack-data.js');
const allJs = [...dataFiles(), LOADER, ...appFiles()];
for (const f of allJs) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) {
    console.error(`✖ node --check failed: ${rel(f)}\n${e.stderr}`);
    process.exit(1);
  }
}
log(`node --check OK (${allJs.length} files)`);

// 2. load data (sandbox) for pinyin + charset
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of dataFiles()) vm.runInContext(`var ZEN_DATA = window.ZEN_DATA;\n${readFileSync(f, 'utf8')}`, sandbox, { filename: f });
const D = sandbox.window.ZEN_DATA;

const { pinyin, customPinyin } = require('pinyin-pro');
// Buddhist / Classical readings that differ from modern defaults
customPinyin({
  禪: 'chán', 禪師: 'chán shī', 坐禪: 'zuò chán', 參禪: 'cān chán', 禪宗: 'chán zōng',
  般若: 'bō rě', 波羅蜜多: 'bō luó mì duō', 南無: 'nā mó', 阿耨多羅三藐三菩提: 'ā nòu duō luó sān miǎo sān pú tí',
  揭帝: 'jiē dì', 般羅揭帝: 'bō luó jiē dì', 般羅僧揭帝: 'bō luó sēng jiē dì', 莎婆訶: 'suō pó hē',
  舍利子: 'shè lì zǐ', 菩薩: 'pú sà', 曹溪: 'cáo xī', 和尚: 'hé shàng', 行者: 'xíng zhě', 無明: 'wú míng',
  不覺: 'bù jué', 覺: 'jué', 大覺: 'dà jué', 正覺: 'zhèng jué', 了: 'liǎo', 了知: 'liǎo zhī', 著: 'zhuó',
  執著: 'zhí zhuó', 愛著: 'ài zhuó', 還: 'huán', 還源: 'huán yuán', 還家: 'huán jiā', 還同: 'huán tóng',
  說: 'shuō', 那箇: 'nǎ gè', 恁麼: 'rèn me', 與麼: 'yǔ me', 作麼生: 'zuò me shēng', 什麼: 'shén me', 甚麼: 'shén me',
  趙州: 'zhào zhōu', 從諗: 'cóng shěn', 狗子: 'gǒu zi', 佛性: 'fó xìng', 惠能: 'huì néng', 慧能: 'huì néng',
  得: 'dé', 行: 'xíng', 相應: 'xiāng yìng', 應: 'yìng', 一行三昧: 'yī xíng sān mèi', 三昧: 'sān mèi',
});
const genPinyin = {};
const fmt = (s) => s.replace(/\s+([，。、；：？！」』）,.;:?!])/g, '$1').replace(/([「『（])\s+/g, '$1').replace(/\s{2,}/g, ' ').trim();
const visit = (p) => {
  if (p && typeof p === 'object' && p.zh && p.id && !p.pinyin) {
    genPinyin[p.id] = fmt(pinyin(p.zh, { type: 'string', nonZh: 'consecutive', toneType: 'symbol' }));
  }
};
const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { visit(o); Object.values(o).forEach(walk); } };
walk(D);
log(`pinyin generated for ${Object.keys(genPinyin).length} passages`);

// 3. SVG
const svg = {};
for (const f of svgFiles()) {
  const id = f.split('/').slice(-2).join('-').replace(/\.svg$/, '').replace(/^oxherding-/, 'ox-');
  svg[id] = readFileSync(f, 'utf8').replace(/<\?xml[^>]*>\s*/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
}

// 4. Tailwind
const twOut = join(TMP, 'tw.css');
execFileSync(join(ROOT, 'node_modules/.bin/tailwindcss'), ['-i', join(ROOT, 'src/styles/app.css'), '-o', twOut, '--minify'], { stdio: 'pipe', cwd: ROOT });
let css = readFileSync(twOut, 'utf8');
log(`tailwind OK (${(css.length / 1024).toFixed(1)} KB)`);

// 5. Fonts (subset to characters actually used)
const subsetFont = require('subset-font');
const allText = [...dataFiles(), LOADER, ...appFiles()].map((f) => readFileSync(f, 'utf8')).join('') + Object.values(genPinyin).join('');
const cjkChars = new Set();
const otherChars = new Set();
for (const ch of allText) {
  const cp = ch.codePointAt(0);
  if ((cp >= 0x2e80 && cp <= 0x9fff) || (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x20000 && cp <= 0x3134f) || (cp >= 0x3000 && cp <= 0x30ff) || (cp >= 0xff00 && cp <= 0xffef)) cjkChars.add(ch);
  else otherChars.add(ch);
}
const latinThai = Array.from(otherChars).join('') + ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~…–—“”‘’·•';
const fontFaces = [];
const fontsDir = join(ROOT, 'src/fonts');
const cacheKey = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) >>> 0; return h.toString(36); };
async function sub(file, text, opts) {
  const key = join(TMP, `${file}-${cacheKey(text)}-${opts && opts.variationAxes ? JSON.stringify(opts.variationAxes).replace(/\W/g, '') : ''}.woff2`);
  if (existsSync(key)) return readFileSync(key);
  const out = await subsetFont(readFileSync(join(fontsDir, file)), text, { targetFormat: 'woff2', ...(opts || {}) });
  writeFileSync(key, out);
  return out;
}
for (const [w, file] of [[400, 'Sarabun-Regular.ttf'], [600, 'Sarabun-SemiBold.ttf'], [700, 'Sarabun-Bold.ttf']]) {
  const buf = await sub(file, latinThai);
  fontFaces.push(`@font-face{font-family:'Sarabun';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2')}`);
}
const cjkText = Array.from(cjkChars).join('');
const cjkBuf = await sub('NotoSerifTC.ttf', cjkText, { variationAxes: { wght: 500 } });
fontFaces.push(`@font-face{font-family:'Noto Serif TC Subset';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${cjkBuf.toString('base64')}) format('woff2')}`);
log(`fonts subset: CJK ${cjkChars.size} chars → ${(cjkBuf.length / 1024).toFixed(0)} KB`);
css = fontFaces.join('\n') + '\n' + css.replace('/*__FONTS__*/', '');

// 6. Pack the data (SPEC §9: JSON → raw DEFLATE → base64, unpacked at start-up by src/boot/unpack-data.js) and inline
D.gen.pinyin = genPinyin;
D.svg = svg;
const dataJson = Buffer.from(JSON.stringify(D), 'utf8');
const packed = zlib.deflateRawSync(dataJson, { level: 9, memLevel: 9 });
if (!zlib.inflateRawSync(packed).equals(dataJson)) {
  console.error('✖ packed data does not round-trip');
  process.exit(1);
}
const dataB64 = packed.toString('base64');
const adler32 = (u) => { let a = 1, b = 0; for (const x of u) { a = (a + x) % 65521; b = (b + a) % 65521; } return (b * 65536 + a) >>> 0; };
const inflateJs = readFileSync(require.resolve('tiny-inflate'), 'utf8');
const loaderJs = readFileSync(LOADER, 'utf8').replace('/*__INFLATE__*/', () => inflateJs);
const appJs = appFiles().map((f) => `// ── ${rel(f)}\n${readFileSync(f, 'utf8')}`).join('\n');
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');
const stamp = new Date().toISOString();
let html = readFileSync(join(ROOT, 'src/index.template.html'), 'utf8');
html = html.replace('/*__CSS__*/', () => css)
  .replace('__DATA_BYTES__', String(dataJson.length)).replace('__DATA_ADLER__', String(adler32(packed))).replace('__DATA_B64__', () => dataB64)
  .replace('/*__DATA__*/', () => safe(loaderJs)).replace('/*__APP__*/', () => safe(appJs)).replace('__BUILD__', stamp);
const outFile = join(DIST, 'zen-study.html');
writeFileSync(outFile, html);
writeFileSync(join(DIST, 'index.html'), html);

// 7. re-check the inlined scripts
for (const [name, code] of [['loader', loaderJs], ['app', appJs]]) {
  const f = join(TMP, `check-${name}.js`);
  writeFileSync(f, code);
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) {
    console.error(`✖ node --check failed on inlined ${name} script\n${e.stderr}`);
    process.exit(1);
  }
}

// 8. size report
const size = Buffer.byteLength(html);
const PHASE = D.meta.phase || 1;
const BUDGET_MB = { 1: 2, 2: 3, 3: 4, 4: 6, 5: 7, 6: 8 }[PHASE] || 8; // SPEC §9
const BUDGET = BUDGET_MB * 1024 * 1024;
log(`dist/zen-study.html ${(size / 1024).toFixed(0)} KB / budget ${BUDGET_MB} MB (data ${(dataB64.length / 1024).toFixed(0)} KB packed from ${(dataJson.length / 1024).toFixed(0)} KB JSON, app ${(appJs.length / 1024).toFixed(0)} KB, css ${(css.length / 1024).toFixed(0)} KB) in ${Date.now() - t0} ms`);
if (size > BUDGET) console.warn(`⚠ size exceeds Phase ${PHASE} budget of ${BUDGET_MB} MB`);
