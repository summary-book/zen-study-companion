// Lineage nodes for 碧巖錄 figures (Phase 4, TASKS P4-03). Only teacher → heir relations that are standard in
// 景德傳燈錄 (T2076 heir lists) and whose teacher is already a node (or a well-attested new node added here).
// Figures with teachers not modelled in the tree (e.g. 大隋 ← 長慶大安, 資福 ← 西塔光穆, 禾山 ← 九峰道虔,
// 明招 ← 羅山道閑, 大龍 ← 白兆志圓, 天平 ← 清谿洪進, 西院 ← 寶壽) are intentionally left out.
ZEN_DATA.lineage.nodes.push(
  // Mazu (Hongzhou) line
  { id: 'magu', parent: 'mazu' },
  { id: 'zhangjing', parent: 'mazu' },
  { id: 'panshan', parent: 'mazu' },
  { id: 'yanguan', parent: 'mazu' },
  { id: 'guizong', parent: 'mazu' },
  { id: 'jinniu', parent: 'mazu' },
  { id: 'wujiu', parent: 'mazu' },
  { id: 'pang-yun', parent: 'mazu', note: 'ฆราวาส · ศึกษากับสือโถวก่อนรู้แจ้งกับหม่าจู่' },
  { id: 'wufeng', parent: 'baizhang' },
  { id: 'lu-gen', parent: 'nanquan', note: 'ฆราวาส' },
  { id: 'zihu', parent: 'nanquan' },
  { id: 'chen-cao', parent: 'muzhou', note: 'ฆราวาส' },
  { id: 'tongfeng', parent: 'linji' },
  { id: 'wuzhuo', parent: 'yangshan' },
  // Shitou line
  { id: 'danxia-tianran', parent: 'shitou' },
  { id: 'cuiwei', parent: 'danxia-tianran' },
  { id: 'touzi', parent: 'cuiwei' },
  { id: 'daowu', parent: 'yaoshan' },
  { id: 'shishuang-qingzhu', parent: 'daowu' },
  { id: 'jianyuan', parent: 'daowu' },
  { id: 'daguang', parent: 'shishuang-qingzhu' },
  { id: 'longya', parent: 'dongshan' },
  { id: 'qinshan', parent: 'dongshan' },
  // Xuefeng's heirs and later
  { id: 'changqing', parent: 'xuefeng' },
  { id: 'baofu', parent: 'xuefeng' },
  { id: 'jingqing', parent: 'xuefeng' },
  { id: 'cuiyan', parent: 'xuefeng' },
  { id: 'taiyuan-fu', parent: 'xuefeng' },
  { id: 'baling', parent: 'yunmen' },
  { id: 'guizong-cezhen', parent: 'fayan' },
);

ZEN_DATA.lineage.links.push(
  { from: 'shitou', to: 'pang-yun', kind: 'studied-with', note: 'ผางอวิ้นพบสือโถวก่อนไปรู้แจ้งกับหม่าจู่' },
  { from: 'mazu', to: 'danxia-tianran', kind: 'studied-with', note: 'ตานเสียพบหม่าจู่ทั้งก่อนและหลังบวชกับสือโถว และได้ชื่อ 天然 จากหม่าจู่' },
  { from: 'baizhang', to: 'yunyan', kind: 'studied-with', note: 'หยุนเหยียนอยู่กับไป่จ้างราวยี่สิบปีก่อนไปหาเย่าซาน (碧巖錄 กรณีที่ 70, 72)' },
  { from: 'deshan', to: 'qinshan', kind: 'studied-with', note: 'ชินซานศึกษากับเต๋อซานพร้อมเหยียนโถวและเสวี่ยเฟิง ก่อนรับการรับรองจากต้งซาน' },
);
