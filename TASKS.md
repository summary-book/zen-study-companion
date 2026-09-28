# TASKS — Zen Study Companion

> สถานะ: **APPROVED v1.0** (2026-09-27 — อนุมัติตามข้อเสนอ Q1–Q9 ทั้งหมด) · อ้างอิง SPEC.md / PLAN.md v1.0
> สัญลักษณ์: `[ ]` ยังไม่ทำ · `[~]` กำลังทำ · `[x]` เสร็จ · ✅ = เกณฑ์ยอมรับ
> Phase 1 แตก task ละเอียด · Phase 2–6 แตกละเอียดเมื่อ phase ก่อนหน้าผ่าน

---

## Phase 1 — โครงแอปครบทุก feature + lineage + หฤทัยสูตร, 信心銘, 六祖壇經

### A. Setup & ลิขสิทธิ์
- [x] **P1-A01** สร้าง `package.json`, โครงโฟลเดอร์ตาม PLAN §1, `README.md`, `LICENSES.md`
- [x] **P1-A02** ติดตั้ง devDependencies + `npx playwright install chromium`
- [x] **P1-C01** ตรวจ license CBETA และ SuttaCentral → บันทึกใน SPEC §4.1 · ✅ มี URL + ข้อความ license + วันที่
- [x] **P1-A03** ดาวน์โหลดฟอนต์ Sarabun + Noto Serif TC/JP (OFL) จากแหล่งทางการ ใส่ `src/fonts/` พร้อม OFL.txt

### B. Build & test harness
- [x] **P1-B01** `build.mjs`: node --check → Tailwind → inline JS/CSS → dist + index.html · ✅ `dist/zen-study.html` เปิดด้วย `file://` ได้
- [x] **P1-B02** `tools/subset-fonts.mjs` + `tools/gen-pinyin.mjs` (override ได้) · ✅ ฟอนต์ subset ครอบคลุมทุกอักษร CJK ใน data (test ตรวจ)
- [x] **P1-B03** `tests/helpers/load-app.mjs` (jsdom + mock localStorage/speechSynthesis/matchMedia)
- [x] **P1-B04** Playwright config + spec ว่าง + ตัวดัก pageerror/console/request ภายนอก
- [x] **P1-B05** npm scripts: `build`, `test`, `e2e`, `verify`

### C. Core
- [x] **P1-C02** `store.js` (try/catch, memory fallback, corrupt backup, migrate) + unit test
- [x] **P1-C03** `router.js` (hash, params, query `hl`/`p`, lastLocation) + unit test
- [x] **P1-C04** `dom.js` (`h()`), `events.js`, `settings.js`
- [x] **P1-C05** `registry.js`: รวม ZEN_DATA, byId, reverse index (บุคคล→texts/koans, ศัพท์→passages)
- [x] **P1-C06** schema validator + **data integrity tests** (SPEC §7.1, §3.7) — เขียนก่อนเนื้อหา

### D. UI shell
- [x] **P1-D01** Design tokens + Tailwind theme (ส้ม glass, ธีมมืด), `@font-face`, ขนาดตัวอักษร
- [x] **P1-D02** Layout: header/nav 7 views, reader | notes, drawer (tablet), **tab อ่าน/โน้ต (mobile)** · ✅ ไม่มี horizontal scroll ที่ 375px
- [x] **P1-D03** `passage.js` render ชั้นข้อความ + layer badges + ป้าย `draft` / `historicity`
- [x] **P1-D04** Display toggles 漢字/pinyin/romaji/ไทย (≥1 เปิด) · ✅ test DOM
- [x] **P1-D05** `name.js` ชื่อหลายระบบ + setting ชื่อหลัก + tooltip
- [x] **P1-D06** Settings modal (ชื่อหลัก, font size, ธีม, ความเร็วเสียง, รีเซ็ต)

### E. Features
- [x] **P1-E01** Notes CRUD + anchor + tag chips + kind + ค้นหา/กรอง + หน้า `#/notes` · ✅ jsdom CRUD test
- [x] **P1-E02** Export/Import JSON (validate, preview, merge/replace, ตัวเลือกรวม progress/quiz) · ✅ test round-trip + ไฟล์เสีย
- [x] **P1-E03** แถบเตือนเมื่อ localStorage ใช้ไม่ได้ · ✅ test
- [x] **P1-E04** Global search index + หน้าผลลัพธ์ + highlight ปลายทาง · ✅ ค้น "เว่ยหล่าง", "Enō", "慧能", "huineng" เจอบุคคลเดียวกัน
- [x] **P1-E05** TTS bar (th/zh/ja, 0.75–2x, play/pause/stop, ไฮไลต์, แบ่งประโยค, disable เมื่อไม่มี voice)
- [x] **P1-E06** Quiz engine + view (scope, สุ่ม 10, เฉลยทันที, history, ทำข้อที่เคยผิด) · ✅ test RNG deterministic
- [x] **P1-E07** Progress (mark อ่านแล้ว, %, อ่านต่อจากที่ค้าง, หน้า `#/progress`)

### F. Views
- [x] **P1-F01** View 1a Lineage tree (layout, ยุบ/ขยาย, pan/zoom, โฟกัสเส้นทาง, filter, โหมด outline, links รอง)
- [x] **P1-F02** View 1b Timeline (แถบตามภูมิภาค, คลิกไปบุคคล/คัมภีร์)
- [x] **P1-F03** View 2 Texts: หน้ารายการ, หน้าคัมภีร์ 6 ส่วน, reader ทีละบท (ก่อน/ถัดไป, mark, TTS, จดโน้ต)
- [x] **P1-F04** View 3 Koans: หน้ารายการชุด/กรณี, reader ชั้น 本則/頌/評唱 + กล่อง "มุมตีความ" (ว่างไว้รอ Phase 2 แต่ต้อง render ได้ด้วย fixture)
- [x] **P1-F05** View 4 People: รายการ (กรองประเทศ/สำนัก/ยุค), profile + reverse index
- [x] **P1-F06** View 5 Practice: หน้าหัวข้อ + 十牛圖 gallery/reader
- [x] **P1-F07** View 6 Glossary: ตาราง + กรอง + หน้า term
- [x] **P1-F08** View 7 Theravada: หน้าหัวข้อ 3 คอลัมน์ (เซน | เถรวาท | เหมือน/ต่าง/ข้อควรระวัง)

### G. เนื้อหา Phase 1
- [x] **P1-G01** `sources.js`: ฉบับต้นฉบับ (Taishō refs), ฉบับแปล/งานศึกษาที่อ้างชื่อ (ไม่คัดลอก)
- [x] **P1-G02** People + Lineage **ครบโครง**: ศากยมุนี, 28 องค์อินเดีย, 6 องค์จีน, สาขาเสินซิ่ว/หนิวโถว, บุคคลหลักสู่ 5 สำนัก 7 สาย, โหนดญี่ปุ่น/เกาหลี/เวียดนาม (ชื่อ/ปี/parent) · profile เต็ม: บุคคลในคัมภีร์ Phase 1 (≥ 12 ท่าน) · ✅ lineage tests ผ่าน
- [x] **P1-G03** Timeline ≥ 40 เหตุการณ์ (ศ. 5 → ปัจจุบัน)
- [x] **P1-G04** หฤทัยสูตร: 6 ส่วน + **ตัวบทเต็ม** (漢字/pinyin/romaji 音読み/ถอดความไทย) แบ่งบทตามโครงความ
- [x] **P1-G05** 信心銘: 6 ส่วน + **ตัวบทเต็ม 146 บาท** 4 ชั้น, แบ่งเป็นตอนตามหัวข้อ
- [x] **P1-G06** 六祖壇經 (宗寶本 10 บท): 6 ส่วน + สรุปทุกบท + ข้อความสำคัญ (เช่น โศลกเสินซิ่ว/ฮุ่ยเหนิง, 風幡, 無念無相無住, 定慧一體) + หมายเหตุฉบับตุนหวงและข้อถกเถียงเรื่องผู้แต่ง
- [x] **P1-G07** Glossary ≥ 40 คำ
- [x] **P1-G08** Practice: ซาเซน, ชิกันตะซะ, โกอาน/ฮวาโถว, 默照 + **十牛圖 SVG 10 ภาพ** (วาดเอง) + 頌 廓庵 + ถอดความ
- [x] **P1-G09** Theravada ≥ 5 หัวข้อ (บาลี + อ้างพระสูตร + ถอดความเอง)
- [x] **P1-G10** Quiz: หฤทัยสูตร ≥ 20, 信心銘 ≥ 20, 六祖壇經 ≥ 25, lineage ≥ 30 (รวม ≥ 95 ข้อ)

### H. ตรวจและส่งมอบ
- [x] **P1-H01** `npm run verify` ผ่านทั้งหมด
- [x] **P1-H02** Playwright screenshot desktop + mobile ทุก view, ไม่มี pageerror, ไม่มี request ภายนอก
- [x] **P1-H03** รายงาน Phase 1 (สิ่งที่ทำ, จำนวนคัมภีร์/บท/บุคคล/ศัพท์/quiz, ผล test, passage `draft` คงเหลือ, งานค้าง)

---

## Phase 2 — 無門關 48 กรณี  (APPROVED 2026-09-27)
- [x] **P2-01** บุคคลใหม่ที่ปรากฏใน 無門關 (≈17 ท่าน) + ปรับแผนภูมิ (大梅, 南陽慧忠, 巖頭, 瑞巖, 洞山守初, 長沙, 乾峯 ฯลฯ) · ✅ lineage tests ผ่าน
- [x] **P2-02** กรณี 2–12 (本則 / 無門曰 / 頌 ตัวบทเต็ม verbatim T2005 + ถอดความไทย + romaji คุนโดกุ + notes + มุมตีความ ≥2 ที่มีที่มา)
- [x] **P2-03** กรณี 13–24
- [x] **P2-04** กรณี 25–36
- [x] **P2-05** กรณี 37–48
- [x] **P2-06** โปรไฟล์เต็มของบุคคลหลักใน 無門關 (อู๋เหมิน, หนานเฉวียน, หยุนเหมิน, เต๋อซาน, หม่าจู่, ไป่จ้าง, อู่จู่ ฯลฯ ≥ 12 ท่าน)
- [x] **P2-07** ศัพท์เพิ่ม ≥ 10 คำ (關, 轉語, 不落/不昧因果, 非心非佛, 話墮, 竿頭進步 …) + Quiz 無門關 ≥ 40 ข้อ (scope `collection:mumonkan`)
- [x] **P2-08** test: 無門關 ครบ 48 กรณี, ทุกกรณีมี case/commentary/verse, ทุกกรณีมีมุมตีความ ≥ 1 · verify + รายงาน

## Phase 3 — 傳心法要 + 臨濟錄 + วัชรสูตร + ลังกาวตารสูตร (APPROVED 2026-09-27)
- [x] **P3-00** ย้ายตัวควบคุมความเร็วเสียงอ่านออกมาไว้ที่แถบบน (ตามคำขอ) · ✅ test + screenshot
- [x] **P3-01** ดึงตัวบท T2012A, T1985, T0235, T0670 · บุคคลใหม่ 10 ท่าน · lineage (ซานเซิ่ง, ติ้ง)
- [x] **P3-02** 傳心法要: ประวัติ/ผู้บันทึก (เผยซิว) + แบ่งบทตามหัวข้อ + สรุปทุกบท + ข้อความสำคัญ verbatim + quiz ≥ 20 + ศัพท์ 3
- [x] **P3-03** 臨濟錄: คำนำ, 上堂, 示眾, 勘辨, 行錄, 塔記 + สรุปทุกตอน + ข้อความสำคัญ + quiz ≥ 20 + ศัพท์ 6
- [x] **P3-04** วัชรสูตร: สรุป 32 ตอน (การแบ่งของเจ้าชายเจาหมิง) + ข้อความสำคัญ + quiz ≥ 20 + ศัพท์ 3
- [x] **P3-05** ลังกาวตารสูตร (เฉพาะส่วนเกี่ยวกับเซน): ความสัมพันธ์กับโพธิธรรม–ฮุ่ยเข่อ, 自覺聖智, 宗通/說通, 如來藏/藏識 ฯลฯ + quiz ≥ 20 + ศัพท์ 4
- [x] **P3-06** เส้นเวลา + ลิงก์ข้ามคัมภีร์ (เช่น ฮุ่ยเหนิงกับวัชรสูตร) · test coverage Phase 3 · verify + รายงาน

## Phase 4 — 碧巖錄 100 กรณี (APPROVED 2026-09-28)
- [x] **P4-01** แยกตัวบท T2003 เป็น 100 กรณี (`tools/split-hekigan.mjs` → `tools/raw/T2003-cases.json`): 垂示 / 本則 / 評唱 / 頌 / 評唱 + ฉบับละ著語 · แยกหมายเหตุเสียงอ่านและคำนำ/刊記/後序
- [x] **P4-02** โครงข้อมูล: ลำดับชั้นจริง (intro → case → commentary → verse → commentary2), `summaries` สำหรับสรุป 評唱, `notesOmitted` + test verbatim แบบละ著語 · หน้าแสดงผล
- [x] **P4-03** บุคคลที่ปรากฏใน 100 กรณี (ตรวจกับตัวบท) + แผนที่ กรณี → บุคคล
- [x] **P4-04** กรณี 1–20 · **P4-05** 21–40 · **P4-06** 41–60 · **P4-07** 61–80 · **P4-08** 81–100 (垂示/本則/頌 ครบทุกตัวอักษร ละ著語 · สรุป 評唱 ทั้งสองช่วง + ข้อความเด่น · notes · มุมตีความ ≥ 2 · related)
- [x] **P4-09** คำนำ/後序 ในหน้าแนะนำชุด + ศัพท์ใหม่ + Quiz 碧巖錄 ≥ 60 + เส้นเวลา
- [x] **P4-10** test Phase 4 · verify · รายงาน

## Phase 5 — 從容錄 100 กรณี + 正法眼藏 (บทเลือก) + เซนญี่ปุ่น (APPROVED 2026-09-28 · บีบอัดข้อมูลตามข้อเสนอ)
- [x] **P5-00** บีบอัดข้อมูลในไฟล์ (JSON → DEFLATE → base64 + tiny-inflate, ตรวจ Adler-32 ก่อนคลาย) · ✅ test round-trip / ไฟล์เสีย / fallback decoder · 5.8 → 2.5 MB
- [x] **P5-01** แหล่งตัวบท 正法眼藏: CBETA ไม่มีเล่ม 82 → ตรวจเงื่อนไข SAT DB (ยกอ้างได้ ห้ามแจกจ่ายซ้ำ) บันทึก SPEC §4.1 · `tools/fetch-sat.mjs` → `tools/raw-private/` (git-ignore) · เลือก 14 บท (`tools/split-shobogenzo.mjs`)
- [x] **P5-02** แยกตัวบท T2004 เป็น 100 กรณี (`tools/split-shoyo.mjs` → `tools/raw/T2004-cases.json`): 示眾 / 本則 / 評唱 / 頌 / 評唱 + ชื่อกรณีจากต้นฉบับ · โครงข้อมูล `ZEN_DATA.chapters`, `edition: 'SAT'`, `romajiKind: 'wabun'`, quiz scope `region:japan` · test Phase 5 (สัญญาให้ทุก agent)
- [x] **P5-03** บุคคลใน 從容錄 + แผนที่ กรณี → บุคคล (`tools/raw/T2004-people.json`) · บุคคลใหม่ 30 · โหนดสายสืบทอด 24
- [x] **P5-04** 從容錄 กรณี 1–20 · **P5-05** 21–40 · **P5-06** 41–60 · **P5-07** 61–80 · **P5-08** 81–100 (示眾/本則/頌 ครบทุกตัวอักษร ละ著語 · สรุป 評唱 ทั้งสองช่วง + ข้อความเด่น · มุมตีความ ≥ 2 · related)
- [x] **P5-09** คำนำ/บทส่งท้ายของ 從容錄 ในหน้าแนะนำชุด + ศัพท์ 4 + Quiz 從容錄 ≥ 60 + เส้นเวลา
- [x] **P5-10** 正法眼藏 14 บท (辨道話 · 摩訶般若波羅蜜 · 現成公案 · 一顆明珠 · 即心是佛 · 有時 · 山水經 · 佛性 · 坐禪箴 · 全機 · 葛藤 · 坐禪儀 · 生死 · 八大人覺): สรุปทุกบท + ข้อความยกอ้าง (ญี่ปุ่น + โรมาจิ + ถอดความไทย) ตามนโยบายการยกอ้าง · ประวัติ/ผู้แต่ง · ศัพท์ 10 · quiz ≥ 25
- [x] **P5-11** เซนญี่ปุ่น: โปรไฟล์เต็ม 43 ท่าน (โซโต 14 · รินไซยุคคามากุระ–มุโรมาจิ 14 · เอโดะ + โอบากุ 15) · สายสืบทอด (สายโอโตกังถึงฮากูอิน) · เส้นเวลา ≥ 25 · ศัพท์ 9 · quiz `region:japan` ≥ 25
- [x] **P5-12** test Phase 5 · verify · รายงาน

## Phase 6 — เกาหลี/เวียดนาม + อาจารย์ยุคใหม่ (APPROVED 2026-09-28)
- [x] **P6-00** แตกงาน · ดึงตัวบท T2020 修心訣 และ X1255 禪家龜鑑 จาก CBETA · แหล่งอ้างอิง Phase 6 · test Phase 6 (สัญญาให้ทุก agent)
- [x] **P6-01** 修心訣 ของชินุล ตัวบทเต็มทุกตอน + ถอดความ + ศัพท์ 3 + quiz ≥ 20 · 禪家龜鑑 ของซอซาน (คำสอนหลักทุกข้อ + สรุปคำอธิบาย) + ศัพท์ 2 + quiz ≥ 20
- [x] **P6-02** เกาหลี: โปรไฟล์เต็ม 17 ท่าน (โทอี ชินุล แทโก ซอซาน คยองฮอ … ซองชอล ซึงซาน) + สายสืบทอด + เส้นเวลา ≥ 10 + quiz `region:korea` ≥ 20
- [x] **P6-03** เวียดนาม: โปรไฟล์เต็ม 17 ท่าน (วินีตารุจิ … จุกเลิม … เลี่ยวกวาน … ติช นัท ฮันห์ ติช ทาน ตื่อ) + สายสืบทอด + เส้นเวลา ≥ 10 + ศัพท์ 2 + quiz `region:vietnam` ≥ 20
- [x] **P6-04** อาจารย์ยุคใหม่ 18 ท่าน (D.T. Suzuki, Shunryu Suzuki, ซาวากิ, ยาซูทานิ, ยามาดะ, มาเอซูมิ, ซวีอวิ๋น, เซิ่งเหยียน, Aitken, Kapleau, Jiyu-Kennett, Loori, Joko Beck, Glassman, Watts, Blyth) — ข้อมูลชีวประวัติเขียนเอง + เส้นเวลา + ศัพท์ 2 + quiz `region:west` ≥ 20
- [x] **P6-05** test Phase 6 · verify · รายงานสรุปรวมโปรเจกต์
