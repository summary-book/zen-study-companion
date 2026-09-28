// Lineage nodes for Japanese Sōtō (Phase 5, TASKS P5-11 · J1 Sōtō). Existing chain in lineage.js: rujing → dogen → ejo → gikai → keizan.
// Group nodes stand for generations that are not modelled one by one (sources: Bodiford, Sōtō Zen in Medieval Japan; Riggs; Dumoulin).
ZEN_DATA.lineage.nodes.push(
  { id: 'jakuen', parent: 'rujing', note: 'ศิษย์ชาวจีนของหรูจิ้ง ตามมาญี่ปุ่นศึกษาต่อกับโดเก็น และขนบโซโตนับว่ารับการสืบทอดธรรมจากเอโจ — สายโฮเกียวจิ → กิอุน (義雲)' },
  { id: 'gasan-joseki', parent: 'keizan' },
  { id: 'meiho', parent: 'keizan' },
  { id: 'g-soto-edo', parent: 'keizan', kind: 'group', label: { th: 'หลายรุ่นในสายโซโตหลังเคซัน (ศตวรรษที่ 14–18 ส่วนใหญ่สืบผ่านศิษย์ของกาซันและเมโฮ)', zh: '瑩山門下 … 江戶曹洞' } },
  { id: 'gesshu', parent: 'g-soto-edo' },
  { id: 'manzan', parent: 'gesshu' },
  { id: 'g-sonno', parent: 'g-soto-edo', kind: 'group', label: { th: 'ซนโอ โซเอกิ', zh: '損翁宗益' } },
  { id: 'menzan', parent: 'g-sonno' },
  { id: 'gento', parent: 'g-soto-edo', note: 'เจ้าอาวาสลำดับที่ 50 ของเอเฮจิ — ไม่ได้แสดงอาจารย์โดยตรงในแผนผังนี้' },
  { id: 'kokusen', parent: 'g-soto-edo' },
  { id: 'ryokan', parent: 'kokusen' },
  { id: 'g-shosan', parent: 'g-soto-edo', kind: 'group', label: { th: 'อาจารย์หลายท่านทั้งโซโตและรินไซที่โชซันไปศึกษาด้วย', zh: '諸師' }, note: 'จัดกลุ่มเพื่อให้มีที่ในแผนผังเท่านั้น ไม่ใช่สายสืบทอดอย่างเป็นทางการ' },
  { id: 'shosan', parent: 'g-shosan', note: 'บวชเองเมื่ออายุ 42 (1620) นับเป็นพระโซโต แต่ไม่ได้รับการสืบทอดธรรม (嗣法) จากอาจารย์ใดอย่างเป็นทางการ' },
);

ZEN_DATA.lineage.links.push(
  { from: 'dogen', to: 'jakuen', kind: 'studied-with', note: 'จากุเอ็นติดตามโดเก็นมาญี่ปุ่นและอยู่ในชุมชนจนโดเก็นมรณภาพ' },
  { from: 'ejo', to: 'jakuen', kind: 'secondary', note: 'ขนบโซโตนับว่าจากุเอ็นรับการสืบทอดธรรมจากเอโจ — กิอุนศิษย์ของท่านลงนามว่าเป็น "เหลน" (曾孫) ของโดเก็น' },
  { from: 'jakuen', to: 'keizan', kind: 'studied-with', note: 'เคซันในวัยหนุ่มไปฝึกกับจากุเอ็นที่วัดโฮเกียวจิ' },
  { from: 'kakushin', to: 'keizan', kind: 'studied-with', note: 'เคซันไปพบชินจิ คากุชิน (สายรินไซ) ระหว่างจาริกศึกษา' },
  { from: 'dogen', to: 'menzan', kind: 'influence', note: 'เมนซันใช้งานเขียนของโดเก็นเป็นเกณฑ์ของการปฏิรูป ("กลับไปหาโดเก็น")' },
  { from: 'menzan', to: 'gento', kind: 'influence', note: 'ระเบียบวัดแบบเมนซันถูกนำมาใช้ที่เอเฮจิในสมัยเก็นโต' },
);
