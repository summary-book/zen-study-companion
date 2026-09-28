// Lineage — Japanese Rinzai, Kamakura–Muromachi (Phase 5, TASKS P5-11). Teacher → heir as in the standard biographies (Collcutt,
// Dumoulin, Kraft, Kirchner, Braverman, Arntzen). Reuses existing nodes (songyuan, mian, wuxue ← wuzhun, daito, kakushin);
// group nodes stand for teachers not modelled as people. Does not touch the g-otokan → hakuin chain (lineage.js, J3).
ZEN_DATA.lineage.nodes.push(
  // 松源崇嶽 → 無明慧性 → 蘭溪道隆
  { id: 'g-wuming-huixing', parent: 'songyuan', kind: 'group', label: { th: 'อู๋หมิง ฮุ่ยซิ่ง', zh: '無明慧性' } },
  { id: 'lanxi', parent: 'g-wuming-huixing', note: 'พระจีน เดินทางถึงญี่ปุ่นปี 1246' },
  // 密庵咸傑 → 曹源道生 → 癡絕道冲 → 頑極行彌 → 一山一寧
  { id: 'g-caoyuan-wanji', parent: 'mian', kind: 'group', label: { th: 'เฉาหยวน เต้าเซิง → ชือเจวี๋ย เต้าชง → หวานจี๋ สิงหมี', zh: '曹源道生 → 癡絕道冲 → 頑極行彌' } },
  { id: 'yishan', parent: 'g-caoyuan-wanji', note: 'พระจีน ทูตราชวงศ์หยวน เดินทางถึงญี่ปุ่นปี 1299' },
  // 無學祖元 (node in lineage.js) → 高峰顯日 → 夢窓疎石
  { id: 'koho', parent: 'wuxue' },
  { id: 'muso', parent: 'koho' },
  // 宗峰妙超 (大燈) → 徹翁義亨 → 言外宗忠 → 華叟宗曇 → 一休宗純
  { id: 'g-tetto-gongai', parent: 'daito', kind: 'group', label: { th: 'เท็ตโต กิโก → กงไก โซชู', zh: '徹翁義亨 → 言外宗忠' } },
  { id: 'kaso', parent: 'g-tetto-gongai' },
  { id: 'ikkyu', parent: 'kaso' },
  // 法燈派: 心地覺心 → 孤峰覺明 → 拔隊得勝
  { id: 'g-koho-kakumyo', parent: 'kakushin', kind: 'group', label: { th: 'โคโฮ คากุเมียว (สายโฮตโต)', zh: '孤峰覺明' } },
  { id: 'bassui', parent: 'g-koho-kakumyo' },
);

ZEN_DATA.lineage.links.push(
  { from: 'wuzhun', to: 'lanxi', kind: 'studied-with', note: 'หลานซีศึกษากับอู๋จุ่นที่ภูเขาจิ้งซาน ก่อนรับการสืบธรรมจากอู๋หมิง ฮุ่ยซิ่ง' },
  { from: 'lanxi', to: 'nanpo', kind: 'studied-with', note: 'นัมโปศึกษากับหลานซีที่เค็นโชจิก่อนไปจีน' },
  { from: 'enni', to: 'koho', kind: 'studied-with', note: 'โคโฮออกบวชกับเอ็นนิที่โทฟุกุจิ' },
  { from: 'yishan', to: 'muso', kind: 'studied-with', note: 'มุโซศึกษากับอีซานที่เค็นโชจิ ก่อนไปหาโคโฮ' },
  { from: 'koho', to: 'daito', kind: 'studied-with', note: 'ไดโตศึกษากับโคโฮที่คามาคุระ ก่อนไปหานัมโป' },
  { from: 'nanpo', to: 'kanzan', kind: 'studied-with', note: 'คันซันเริ่มฝึกกับนัมโปที่เค็นโชจิ ก่อนรับการสืบธรรมจากไดโต' },
  { from: 'eisai', to: 'enni', kind: 'influence', note: 'เอ็นนิศึกษาเซนกับเอโช ศิษย์ของเอไซ ก่อนไปจีน' },
  { from: 'eisai', to: 'kakushin', kind: 'influence', note: 'คากุชินศึกษากับเกียวยู ศิษย์ของเอไซ' },
);
