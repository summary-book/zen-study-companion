// Lineage nodes for 從容錄 figures (Phase 5, TASKS P5-03). Only teacher → heir relations that are standard in 景德傳燈錄
// (T2076 heir lists / chapter placement; 瑯琊慧覺 ← 汾陽 from 萬松's 評唱, case 100) and whose teacher is a node (or added here).
// Also places four existing people whose teachers are added here: 大隋 ← 長慶大安, 明招 ← 羅山道閑, 禾山 ← 九峯道虔,
// 天平 ← 清谿洪進 (left out in lineage-hekiganroku.js because those teachers were missing).
// 大陽警玄 is placed in lineage.js (the Song Caodong group was split for him); his heir 興陽清剖 is added here.
// Left out: 會和尚 (南泉 heir per 萬松 only, not in the T2076 list); 子昭 (長慶's assembly, later 法眼,
// no standard heir entry); 廓侍者, 彥從, 覺上座, 德上座, 小塘長老 (no standard heir relation); 帝釋, 彌勒, 後唐莊宗.
ZEN_DATA.lineage.nodes.push(
  { id: 'xingyang-qingpou', parent: 'dayang' },
  // Mazu (Hongzhou) line
  { id: 'luzu', parent: 'mazu' },
  { id: 'zhongyi', parent: 'mazu' },
  { id: 'changqing-daan', parent: 'baizhang', note: 'สืบตำแหน่งเจ้าอาวาสภูเขาเหวยซานต่อจากเหวยซาน หลิงโยว่' },
  { id: 'dasui', parent: 'changqing-daan' },
  { id: 'yunji-shizu', parent: 'nanquan' },
  { id: 'mihu', parent: 'guishan' },
  { id: 'yanyang', parent: 'zhaozhou' },
  // Shitou line: Yaoshan → Chuanzi → Jiashan
  { id: 'g-chuanzi', parent: 'yaoshan', kind: 'group', label: { th: 'ฉวนจื่อ เต๋อเฉิง', zh: '船子德誠' } },
  { id: 'jiashan', parent: 'g-chuanzi', note: 'ว่านซงบันทึกว่า 擊節 ของหยวนอู้ระบุว่าเดิมท่านสืบจากสือโหลว (石樓)' },
  { id: 'luopu', parent: 'jiashan' },
  // Yunyan / Dongshan (Caodong)
  { id: 'shenshan', parent: 'yunyan' },
  { id: 'qinglin', parent: 'dongshan' },
  { id: 'shushan', parent: 'dongshan' },
  { id: 'huguo', parent: 'shushan' },
  // Daowu → Shishuang Qingzhu
  { id: 'jiufeng', parent: 'shishuang-qingzhu' },
  { id: 'heshan', parent: 'jiufeng' },
  // Deshan → Yantou
  { id: 'luoshan', parent: 'yantou' },
  { id: 'mingzhao', parent: 'luoshan' },
  // Xuansha → Luohan (Dizang)
  { id: 'longji', parent: 'luohan' },
  { id: 'qingxi', parent: 'luohan' },
  { id: 'tianping', parent: 'qingxi' },
  // Yunmen
  { id: 'deshan-yuanmi', parent: 'yunmen' },
  // Linji line
  { id: 'langye', parent: 'fenyang' },
);

ZEN_DATA.lineage.links.push(
  { from: 'linji', to: 'luopu', kind: 'studied-with', note: 'ลั่วผู่เคยเป็นผู้ติดตามของหลินจี้ก่อนไปหาเจียซาน (景德傳燈錄 卷16; 從容錄 評唱 กรณีที่ 35)' },
);
