// Lineage nodes — Edo-period Rinzai (the Ōtōkan chain gudo → shido-bunan → shoju → hakuin, Hakuin's heirs, Bankei, Takuan,
// Sengai) and Ōbaku (Ingen's heirs). Phase 5 (TASKS P5-11). Teacher → heir relations as given in Dumoulin, Baroni and Hori;
// 'g-otokan' (the Myōshinji generations between Kanzan and Gudō) and the hakuin → shoju link live in lineage.js.
ZEN_DATA.lineage.nodes.push(
  // ── The Ōtōkan chain to Hakuin ───────────────────────
  { id: 'gudo', parent: 'g-otokan' },
  { id: 'shido-bunan', parent: 'gudo', note: 'ฆราวาสศิษย์ของกูโดอยู่นาน ออกบวชเมื่อราวอายุห้าสิบ' },
  { id: 'shoju', parent: 'shido-bunan' },

  // ── Hakuin's heirs ───────────────────────────────────
  { id: 'torei', parent: 'hakuin' },
  { id: 'gasan-jito', parent: 'hakuin', note: 'ฝึกกับเก็สเซ็น เซ็นเน (月船禪慧) ก่อนมาศึกษากับฮากูอินในบั้นปลายของอาจารย์' },
  { id: 'inzan', parent: 'gasan-jito', note: 'ต้นสายอินซัน (隠山派)' },
  { id: 'takuju', parent: 'gasan-jito', note: 'ต้นสายทากุจู (卓洲派)' },

  // ── Other Myōshinji lines ────────────────────────────
  { id: 'g-bokuo', parent: 'g-otokan', kind: 'group', label: { th: 'หลายรุ่นในสายเมียวชินจิ ถึงโบกูโอ โซกิว', zh: '… 牧翁祖牛' } },
  { id: 'bankei', parent: 'g-bokuo', note: 'บวชกับอุมโป เซ็นโช (雲甫全祥) ได้รับการรับรองจากโบกูโอ โซกิว (牧翁祖牛) และยังได้ศึกษากับพระจีนเต้าเจ่อ เชาหยวน (道者超元 ญี่ปุ่นเรียกโดฉะ โชเง็น) ที่นางาซากิด้วย' },
  { id: 'g-kogetsu', parent: 'g-otokan', kind: 'group', label: { th: 'สายโคเก็ตสึ: โคเก็ตสึ เซ็นไซ → เก็สเซ็น เซ็นเน', zh: '古月禪材 → 月船禪慧' } },
  { id: 'sengai', parent: 'g-kogetsu' },

  // ── Daitokuji line ───────────────────────────────────
  { id: 'g-daitokuji-takuan', parent: 'kaso', kind: 'group', label: { th: 'หลายรุ่นในสายไดโตกุจิหลังคาโซ (โยโซ โซอิ …) ถึงอิตโต โชเตกิ', zh: '養叟宗頤 … 一凍紹滴' } },
  { id: 'takuan', parent: 'g-daitokuji-takuan' },

  // ── Ōbaku (feiyin → ingen is in lineage.js) ──────────
  { id: 'muan', parent: 'ingen' },
  { id: 'jifei', parent: 'ingen' },
  { id: 'tetsugen', parent: 'muan' },
);

ZEN_DATA.lineage.links.push(
  { from: 'daito', to: 'hakuin', kind: 'influence', note: 'ฮากูอินเขียน 槐安國語 อรรถาธิบายบันทึกคำสอนของไดโต' },
  { from: 'ingen', to: 'tetsugen', kind: 'studied-with', note: 'เท็ตสึเก็นฟังธรรมจากอิงเง็นที่นางาซากิ ก่อนเป็นศิษย์และทายาทธรรมของโมกุอัน' },
);
