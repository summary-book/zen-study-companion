// Lineage nodes for modern teachers from Asia (Phase 6, TASKS P6-04a · M1). Group nodes stand for the many Edo–Meiji generations
// that are not modelled one by one (sources: Dumoulin; Chadwick; Okumura; Kapleau; Sharf; Luk; Sheng Yen).
ZEN_DATA.lineage.nodes.push(
  // Rinzai: Hakuin → Gasan → Inzan → … → Engakuji
  { id: 'g-ma-engakuji', parent: 'inzan', kind: 'group', label: { th: 'หลายรุ่นในสายอินซันถึงวัดเอ็งกากุจิ: อิมากิตะ โคเซ็น → ชากุ โซเอ็น', zh: '… 今北洪川 → 釋宗演' }, note: 'จัดกลุ่มเพื่อแสดงที่มาของสายเอ็งกากุจิยุคเมจิ ไม่ได้แสดงทุกรุ่น' },
  { id: 'dt-suzuki', parent: 'g-ma-engakuji', note: 'ฆราวาส ฝึกกับอิมากิตะ โคเซ็นแล้วชากุ โซเอ็น — ไม่ได้เป็นผู้สืบทอดธรรม (嗣法) ในฐานะอาจารย์' },
  // Sōtō: modern generations
  { id: 'g-ma-soto-modern', parent: 'g-soto-edo', kind: 'group', label: { th: 'หลายรุ่นในสายโซโตยุคเมจิ–โชวะ', zh: '近代曹洞' } },
  { id: 'g-ma-sawada', parent: 'g-ma-soto-modern', kind: 'group', label: { th: 'ซาวาดะ โคโฮ', zh: '澤田興法' } },
  { id: 'sawaki', parent: 'g-ma-sawada' },
  { id: 'uchiyama', parent: 'sawaki' },
  { id: 'g-ma-gyokujun', parent: 'g-ma-soto-modern', kind: 'group', label: { th: 'เกียวคุจุน โซอน', zh: '玉潤祖温' } },
  { id: 'shunryu-suzuki', parent: 'g-ma-gyokujun' },
  { id: 'harada-sogaku', parent: 'g-ma-soto-modern', note: 'พระโซโต ได้รับการรับรองการฝึกโกอานจากโดกุตัน โซซัน (獨湛宗潭) สายรินไซด้วย' },
  { id: 'yasutani', parent: 'harada-sogaku', note: 'ตั้งซัมโบเคียวดัน (三宝教団) ปี 1954' },
  { id: 'yamada-koun', parent: 'yasutani', note: 'ฆราวาส ผู้นำซัมโบเคียวดันรุ่นที่สอง' },
  { id: 'g-ma-kuroda', parent: 'g-ma-soto-modern', kind: 'group', label: { th: 'คุโรดะ ฮากุจุน (บิดาของมาเอซูมิ)' } },
  { id: 'maezumi', parent: 'g-ma-kuroda', note: 'สืบทอดสายโซโตจากบิดา (1955) และได้รับอินกะจากยาซูตานิ (1970) กับโอซากะ โคริว (1973)' },
  // China: Linji line of the Qing period
  { id: 'g-ma-qing-linji', parent: 'g-ming-linji', kind: 'group', label: { th: 'หลายรุ่นในสายหลินจี้สมัยชิง (สายวัดกู่ซาน)', zh: '清代臨濟 · 鼓山' } },
  { id: 'xuyun', parent: 'g-ma-qing-linji', note: 'ขนบถือว่ารับสืบทอดครบทั้งห้าสำนัก' },
  { id: 'g-ma-lingyuan', parent: 'xuyun', kind: 'group', label: { th: 'หลิงหยวน หงเหมี่ยว', zh: '靈源宏妙' } },
  { id: 'sheng-yen', parent: 'g-ma-lingyuan', note: 'สายหลินจี้จากหลิงหยวน · สายเฉาต้งจากตงชู (東初)' },
);

ZEN_DATA.lineage.links.push(
  { from: 'yasutani', to: 'maezumi', kind: 'secondary', note: 'อินกะในการฝึกโกอาน ปี 1970' },
  { from: 'harada-sogaku', to: 'maezumi', kind: 'influence', note: 'สายการฝึกแบบฮตชินจิผ่านยาซูตานิ' },
  { from: 'dogen', to: 'sawaki', kind: 'influence', note: 'ซาวากิถือคำสอนเรื่องการนั่งของโดเก็นเป็นเกณฑ์' },
  { from: 'hakuin', to: 'harada-sogaku', kind: 'influence', note: 'หลักสูตรโกอานที่ฮาราดะรับมาจากวัดรินไซสืบจากสายฮากูอิน' },
);
