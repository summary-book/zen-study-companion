# Zen Study Companion — ศึกษานิกายเซน (ฉาน 禪 / เซน / ซอน 선 / เทียน Thiền)

เว็บแอปไฟล์เดียว (`dist/zen-study.html`) สำหรับศึกษาเซนอย่างจริงจัง เปิดออฟไลน์ได้ และ deploy บน GitHub Pages ได้
เนื้อหาอยู่ซ้าย โน้ตอยู่ขวา (บนมือถือสลับเป็นแท็บ) — ดู [SPEC.md](SPEC.md), [PLAN.md](PLAN.md), [TASKS.md](TASKS.md)

## ใช้งาน
เปิด `dist/zen-study.html` ในเบราว์เซอร์ได้เลย (ไม่ต้องมีเซิร์ฟเวอร์) หรืออัปโหลด `dist/index.html` ขึ้น GitHub Pages

## พัฒนา
```bash
npm install
npx playwright install chromium   # ครั้งแรกเท่านั้น
npm run build      # src/ → dist/zen-study.html + dist/index.html
npm test           # build + node --check + data integrity + unit + jsdom views
npm run e2e        # Playwright: desktop + mobile screenshots (dist/screenshots/), ต้องไม่มี pageerror
npm run verify     # ทั้งหมด
npm run report     # รายงานสถานะการตรวจทานตัวบท (ไม่ fail)
npm run fetch:cbeta -- T2012A T1985   # ดึงตัวบทจาก CBETA เก็บใน tools/raw/
```

## โครงสร้าง
- `src/data/` — **เนื้อหาทั้งหมด** เป็น JS object ล้วน (ไม่มี logic) เพิ่มคัมภีร์/กรณี/ศัพท์ได้โดยไม่แตะโค้ด — schema อยู่ที่ [src/data/README.md](src/data/README.md)
- `src/app/` — โค้ดแอป (vanilla JS): `core/` `data/` `features/` `ui/` `views/` `main.js`
- `src/styles/app.css` — Tailwind v4 + design tokens (โทนส้ม glassmorphism)
- `src/svg/oxherding/` — ภาพฝึกวัวสิบภาพ วาดเอง
- `tools/raw/` — ตัวบทดิบจาก CBETA (ใช้ตรวจว่า passage ตรงต้นฉบับทุกตัวอักษร)
- `tests/` — `data/` (integrity, lineage, coverage) · `unit/` · `views/` (jsdom) · `e2e/` (Playwright)

## หลักการเนื้อหา
- passage ที่ `verify: 'checked'` ต้องตรงกับ CBETA ทุกตัวอักษร (test บังคับ)
- ถอดความไทยเขียนเอง ไม่คัดลอกคำแปลสมัยใหม่ (อ้างชื่อได้เท่านั้น)
- การตีความของผู้อื่นอยู่ในกล่อง "มุมตีความ" แยก และต้องมี `sourceId`
- เถรวาทอยู่เฉพาะ view เทียบเถรวาท

## ลิขสิทธิ์
ดู [LICENSES.md](LICENSES.md)

## Deploy ขึ้น GitHub Pages

1. สร้าง repository เปล่าบน GitHub แล้ว push โค้ดขึ้น branch `main`
2. ที่ repo → **Settings → Pages → Build and deployment → Source** เลือก **GitHub Actions**
3. ทุกครั้งที่ push ขึ้น `main` workflow `.github/workflows/pages.yml` จะ build + รัน test แล้วเผยแพร่ `dist/index.html`
   ที่ `https://<user>.github.io/<repo>/`

หมายเหตุ: `tools/raw-private/` (ตัวบทจาก SAT) อยู่ใน `.gitignore` และห้ามเผยแพร่ (SPEC §4.1) — บน CI การตรวจข้อความ 正法眼藏
เทียบต้นฉบับจะถูกข้าม ให้รันตรวจในเครื่องด้วย `node tools/fetch-sat.mjs T2582 T2580 && node tools/split-shobogenzo.mjs`
