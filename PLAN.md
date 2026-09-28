# PLAN — Zen Study Companion

> สถานะ: **APPROVED v1.1** (v1.0 2026-09-27 · v1.1 2026-09-28 — build บีบอัดข้อมูล §2, ความเสี่ยงแหล่งตัวบทญี่ปุ่น §6) · อ้างอิง SPEC.md v1.1

---

## 1. แนวทางสถาปัตยกรรม

**Vanilla JS (ES2020) + Tailwind (build) → รวมเป็นไฟล์เดียวด้วย build script**
- ไม่ใช้ framework (React/Vue) เพื่อให้ไฟล์เล็ก เปิด `file://` ได้ ไม่มี runtime dependency
- พัฒนาแยกไฟล์ใน `src/` (อ่านง่าย, test ง่าย) → `build.mjs` inline ทุกอย่างเป็น `dist/zen-study.html`
- **Data แยกจาก logic เด็ดขาด**: `src/data/*.js` มีแต่ object literal (ไม่มีฟังก์ชัน) → เพิ่มคัมภีร์/กรณีใหม่ = เพิ่มไฟล์ data เท่านั้น

```
Zen Study Companion/
├── SPEC.md  PLAN.md  TASKS.md  README.md  LICENSES.md
├── package.json            # devDependencies เท่านั้น
├── build.mjs               # รวมไฟล์ → dist/zen-study.html (+ index.html)
├── src/
│   ├── index.template.html # โครง HTML + จุด inject
│   ├── styles/app.css      # @import tailwind + @font-face + component classes
│   ├── fonts/              # Sarabun, Noto Serif TC/JP (OFL) — ต้นฉบับก่อน subset
│   ├── data/
│   │   ├── sources.js      # แหล่งอ้างอิงทั้งหมด (primary/translation/study) + license
│   │   ├── people/*.js     # แยกตามยุค/ประเทศ (india.js, china-early.js, china-houses.js, japan.js, korea.js, vietnam.js, modern.js)
│   │   ├── lineage.js      # nodes/parent/links/schools
│   │   ├── timeline.js
│   │   ├── texts/*.js      # heart-sutra.js, xinxinming.js, platform-sutra.js, ...
│   │   ├── koans/*.js      # mumonkan.js, hekiganroku-01-50.js, ...
│   │   ├── practice.js     # รวม oxherding (อ้าง SVG id)
│   │   ├── glossary.js
│   │   ├── theravada.js
│   │   └── quiz/*.js       # แยกตาม scope
│   ├── svg/oxherding/01..10.svg
│   └── app/
│       ├── core/  store.js (localStorage wrapper), router.js, events.js, dom.js (h() helper, escape), settings.js
│       ├── data/  registry.js (รวม ZEN_DATA + สร้าง index: byId, reverse index บุคคล/ศัพท์), normalize.js
│       ├── ui/    layout.js, header.js, notes-panel.js, passage.js (render ชั้นข้อความ), name.js, badges.js, tts-bar.js, toast.js, modal.js
│       ├── views/ lineage.js, timeline.js, texts.js, koans.js, people.js, practice.js, glossary.js, theravada.js, quiz.js, search.js, progress.js, notes.js
│       ├── features/ notes.js, search-index.js, quiz-engine.js, progress.js, tts.js, export-import.js, highlight.js
│       └── main.js
├── tools/
│   ├── fetch-cbeta.mjs      # (ถ้า Q1=ก) ดึงตัวบทจาก CBETA → JSON ดิบ เก็บใน tools/raw/ พร้อม metadata license
│   ├── gen-pinyin.mjs       # เติม pinyin ด้วย pinyin-pro + ใช้ override
│   └── subset-fonts.mjs     # สแกน data หาอักษร CJK ที่ใช้ → subset woff2
├── tests/
│   ├── helpers/load-app.mjs # โหลด dist html ใน jsdom (runScripts: "dangerously", mock speechSynthesis/localStorage)
│   ├── unit/*.test.mjs      # store, router, search, quiz, progress, notes, export-import
│   ├── data/*.test.mjs      # integrity, lineage, layers, theravada-separation
│   ├── views/*.test.mjs     # render ทุก route
│   └── e2e/screens.spec.mjs # Playwright
└── dist/ zen-study.html  index.html  screenshots/
```

## 2. Build pipeline (`npm run build`)
1. `node --check` ทุกไฟล์ใน `src/**/*.js` → fail ทันทีถ้า syntax ผิด
2. `gen-pinyin` (เฉพาะ passage ที่มี `zh` แต่ไม่มี `pinyin` หรือมี `pinyinOverride`) — ผลลัพธ์เขียนกลับเป็นไฟล์ `src/data/.generated/pinyin.js` (ไม่แก้ไฟล์ที่เขียนมือ)
3. Tailwind CLI v4 (`@tailwindcss/cli`) scan `src/**/*.{js,html}` → CSS minified
4. `subset-fonts` (ไลบรารี `subset-font` — harfbuzz wasm, ไม่ต้องใช้ Python) → woff2 base64 ใน `@font-face`
5. รวม JS ตามลำดับ: app/core → app/data → features → ui → views → main (IIFE เดียว, ไม่ใช้ ES modules เพื่อให้ `file://` ใช้ได้ทุก browser) · **data (ตั้งแต่ Phase 5)**: รวม `ZEN_DATA` (+ pinyin/SVG ที่สร้าง) เป็น JSON → DEFLATE (zlib ระดับ 9) → base64 ฝังใน `<script type="application/octet-stream" id="zen-data-z">` พร้อมขนาดและ Adler-32 · `src/boot/unpack-data.js` + tiny-inflate (MIT) คลายเป็น `window.ZEN_DATA` ก่อนแอปเริ่ม
6. inject ลง template → `dist/zen-study.html`, สำเนา `dist/index.html`
7. extract `<script>` (loader + app) จาก dist แล้ว `node --check` อีกรอบ · ตรวจว่าข้อมูลที่บีบอัดคลายกลับได้ตรงทุกไบต์
8. รายงานขนาดไฟล์ + เตือนถ้าเกินงบ (SPEC §9)

devDependencies: `@tailwindcss/cli`, `tailwindcss`, `pinyin-pro`, `subset-font`, `jsdom`, `@playwright/test` (Chromium ดาวน์โหลดครั้งแรกด้วย `npx playwright install chromium`)

## 3. การออกแบบโมดูลหลัก

### 3.1 Render
- ฟังก์ชัน `h(tag, attrs, ...children)` สร้าง DOM โดยตรง — ข้อความทั้งหมดผ่าน `textContent` (ปลอดภัยจากข้อมูล import)
- แต่ละ view = `render(params, ctx) → HTMLElement` + `destroy()` (ถอด listener) — test ได้ด้วย jsdom
- `passage.js` render ชั้นข้อความ: แต่ละ layer เป็น element ที่มี class `layer-zh|layer-pinyin|layer-romaji|layer-th` + `lang` · toggles ทำงานโดยตั้ง class บน `<body>` (`hide-pinyin` ฯลฯ) → CSS ซ่อน ไม่ต้อง re-render

### 3.2 Router
hash-based, pattern → view; เก็บ `lastLocation`; scroll-to + highlight ด้วย query `?hl=<term>&p=<passageId>`

### 3.3 Store (localStorage)
```js
store.get(key, fallback)  // try/catch → fallback, JSON เสีย → สำรอง corrupt-<ts>
store.set(key, value)     // try/catch → คืน false + emit "storage:unavailable" → แสดงแถบเตือน
```
memory fallback (Map) เมื่อ localStorage ใช้ไม่ได้ ข้อมูลจึงยังใช้ได้ใน session นั้น

### 3.4 Lineage tree
- เขียน tidy-tree layout เอง (Reingold–Tilford แบบง่าย) → SVG; ~200–300 nodes ที่ Phase 6
- โหมดตั้งต้น: แสดงถึงระดับ 5 สำนัก, ยุบสาขาย่อย; ปุ่ม ขยายทั้งหมด / ยุบ / โฟกัสเส้นทาง
- ช่วง 28 องค์อินเดียยาวเป็นเส้นตรง → แสดงแบบ "โซ่ย่อ" (compact chain) ขยายได้
- Pan/zoom ด้วย pointer events + wheel, ปุ่ม +/- สำหรับคีย์บอร์ด; บนมือถือแสดงทางเลือกเป็น **รายการแบบ outline** (accessible) สลับกับ SVG ได้
- `links` (เส้นประ) แสดงเมื่อเปิด toggle "ความสัมพันธ์รอง"

### 3.5 Search
- สร้าง index ครั้งเดียวตอน boot (lazy ตอนเปิดช่องค้นครั้งแรก): รายการ `{type, id, route, fields:[normalizedText], display}`
- normalize: lowercase, NFKD ตัด diacritics (pinyin/romaji/vi), ตาราง 繁→简 เฉพาะอักษรที่ปรากฏใน data (สร้างตอน build จาก field `zhS`) , ตัด whitespace
- ค้นแบบ substring ทุก field, จัดอันดับ: ชื่อ/หัวเรื่องตรง > ขึ้นต้น > ในเนื้อหา; จำกัด 20 ต่อประเภท
- highlight: TreeWalker ห่อ `<mark>` บน text node ในหน้าปลายทาง (ไม่แก้ data)

### 3.6 Quiz engine
Fisher–Yates ด้วย RNG ที่ inject ได้ (test แบบ deterministic), รองรับ mcq/tf/match, เก็บ history, โหมด "ข้อที่เคยผิด"

### 3.7 TTS
wrapper `speechSynthesis` — เลือก voice ตาม lang, แบ่งประโยคด้วย `。！？；.!?` และช่องว่างไทย, คิวต่อเนื่อง, rate 0.75–2, event → ไฮไลต์ passage; `voiceschanged` สำหรับ Safari/Chrome ที่โหลด voice ช้า; ไม่มี API → ซ่อนแถบ

### 3.8 Notes panel
state แบบ event bus: route เปลี่ยน → panel แสดงโน้ตของ anchor ปัจจุบัน; editor ใน panel (textarea + tag chips + kind), autosave debounce 500 ms, ปุ่ม "ทั้งหมด" → `#/notes`

### 3.9 Export/Import
`{app:"zen-study-companion", schemaVersion:1, exportedAt, notes:[], progress?:{}, quizHistory?:[]}` — validate เอง (ไม่ใช้ไลบรารี): ชนิด field, ความยาวสูงสุด, id รูปแบบถูก; ผลลัพธ์แสดง preview จำนวนก่อนยืนยัน

## 4. กระบวนการเขียนเนื้อหา (content workflow)
1. **ตัวบทต้นฉบับ**: ตาม Q1 — ดึง/พิมพ์ → ใส่ `source.loc` → `verify: "draft"`
2. **ถอดความไทย**: เขียนเองจากต้นฉบับ 漢文 (ไม่เปิดคำแปลลิขสิทธิ์ระหว่างเขียนเพื่อกันการคัดลอกโดยไม่ตั้งใจ), ใช้ภาษาชัด ไม่ใส่การตีความลงในชั้นถอดความ
3. **มุมตีความ**: สรุปแนวคิดของผู้ตีความด้วยคำของเราเอง + `sourceId` (ชื่อหนังสือ/ผู้แต่ง/ปี) — ไม่ยกข้อความ
4. **ตรวจทาน**: script `tools/verify-report.mjs` แสดงรายการ passage `draft` ต่อคัมภีร์ → ผู้ใช้/ผู้ตรวจเปลี่ยนเป็น `checked`
5. **Quiz**: เขียนจากเนื้อหาในแอปเท่านั้น (มี `ref` ชี้กลับเสมอ)

### ข้อจำกัดที่ต้องบอกตรง ๆ
- ตัวบท 漢文 ที่พิมพ์โดยไม่อิงฉบับดิจิทัล อาจมีอักษรคลาดเคลื่อน → จึงมี `verify` flag และข้อเสนอ Q1(ก)
- ข้อมูลบุคคลบางท่าน (โดยเฉพาะสังฆปริณายกอินเดียและพระเวียดนามยุคต้น) เป็นขนบ ไม่มีหลักฐานประวัติศาสตร์ — จะระบุ `historicity` ทุกครั้ง
- การถอดเสียงไทยจากจีนกลางใช้หลักเกณฑ์ราชบัณฑิตยสภา (ถ้าชื่อที่นิยมต่างออกไปจะใส่ใน `thCommon`)

## 5. กลยุทธ์การทดสอบ
| ชั้น | เครื่องมือ | สิ่งที่ตรวจ |
|---|---|---|
| Syntax | `node --check` | ทุกไฟล์ src + script ที่ extract จาก dist |
| Data | node:test (ไม่ต้องใช้ DOM) | SPEC §7.1 ทั้งหมด, schema validator, การแยกเถรวาท |
| Unit | node:test | store (localStorage พัง/เต็ม), router, normalize, search ranking, quiz RNG, progress %, export/import validate/merge |
| View | node:test + jsdom โหลด `dist/zen-study.html` | ทุก route render, toggles, notes CRUD ผ่าน UI, search highlight, quiz flow, mobile tab (จำลอง matchMedia) |
| E2E | Playwright (Chromium) | screenshot desktop 1440×900 + mobile 390×844 ทุก view, ไม่มี pageerror/console.error, ไม่มี request ภายนอก, `scrollWidth <= clientWidth` บน mobile |

คำสั่ง: `npm run build` · `npm test` (check + data + unit + view) · `npm run e2e` · `npm run verify` (ทั้งหมด)

## 6. ความเสี่ยงและการรับมือ
| ความเสี่ยง | ผลกระทบ | การรับมือ |
|---|---|---|
| License CBETA ไม่เข้ากับการเผยแพร่ | ต้องเปลี่ยนแหล่งตัวบท | ตรวจเป็น task แรกของ Phase 1 ก่อนเขียนเนื้อหา |
| ความผิดพลาดในตัวบท/ปี/ลำดับสาย | ความน่าเชื่อถือ | `verify` flag, `historicity`, test ลำดับสังฆปริณายก, อ้างเลข Taishō |
| ขนาดไฟล์โตจาก 碧巖錄/ฟอนต์ | โหลดช้าบนมือถือ | subset ฟอนต์, 評唱 แบบสรุป, งบขนาดใน build, บีบอัดข้อมูล (Phase 5: 5.8 → 2.5 MB, คลาย ≈50 ms desktop / ≈190 ms CPU×4) |
| ตัวบทญี่ปุ่นไม่มีใน CBETA (正法眼藏) | ไม่มีแหล่งที่ license เปิด | ใช้ SAT DB แบบยกอ้างเท่านั้น, test บังคับสัดส่วน, raw เก็บเฉพาะในเครื่อง (SPEC §4.1) |
| Web Speech voice ไม่มี (โดยเฉพาะ th-TH บางเครื่อง) | ฟีเจอร์ใช้ไม่ได้ | ตรวจ voice, disable พร้อมคำอธิบาย |
| Playwright ต้องดาวน์โหลด Chromium | ต้องใช้เน็ตครั้งแรก | ทำครั้งเดียวใน setup |
| ปริมาณเนื้อหามหาศาล (Phase 4–5) | ใช้เวลานาน | data แยกไฟล์ต่อ 50 กรณี, ทำเป็น batch, test integrity ทุก batch |

## 7. การส่งมอบแต่ละ Phase
build → `npm run verify` → screenshot → รายงานตาม SPEC §12 → รออนุมัติก่อนเริ่ม phase ถัดไป
