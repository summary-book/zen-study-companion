// Lineage nodes for Western Zen teachers (Phase 6, TASKS P6-04b · M2 West). Parents yasutani / yamada-koun / maezumi come from
// lineage-modern-asia.js (M1). Watts and Blyth are lay writers outside any teaching line and have no node. Source: Fields; Sharf.
ZEN_DATA.lineage.nodes.push(
  { id: 'aitken', parent: 'yamada-koun', note: 'ได้รับการรับรองให้สอนจากยามาดะ โคอุนในทศวรรษ 1970 และรับรองเต็มราวกลางทศวรรษ 1980 — ไดมอนด์สังฆะภายหลังแยกเป็นอิสระจากซัมโบเคียวดัน' },
  { id: 'kapleau', parent: 'yasutani', note: 'ได้รับอนุญาตให้สอนจากยาซุทานิ แต่ไม่ได้รับการสืบทอดธรรมเต็มรูปแบบ และแยกทางกับอาจารย์ราวปี 1967' },
  { id: 'g-koho', parent: 'g-soto-edo', kind: 'group', label: { th: 'โคโฮ เคโด ชิซัน เจ้าอาวาสวัดโซจิจิ (และสายโซโตยุคใหม่ก่อนหน้าท่าน)', zh: '孤峰智璨' }, note: 'ไม่ได้แสดงรุ่นระหว่างสายโซโตสมัยเอโดะกับศตวรรษที่ 20 ทีละรุ่น' },
  { id: 'jiyu-kennett', parent: 'g-koho' },
  { id: 'loori', parent: 'maezumi' },
  { id: 'joko-beck', parent: 'maezumi' },
  { id: 'glassman', parent: 'maezumi', note: 'ศิษย์ผู้สืบทอดธรรมคนแรกของมาเอซูมิ (1976)' },
);

ZEN_DATA.lineage.links.push(
  { from: 'yasutani', to: 'aitken', kind: 'studied-with', note: 'เอตเคนฝึกโกอานกับยาซุทานิก่อนฝึกต่อกับยามาดะ โคอุน' },
  { from: 'harada-sogaku', to: 'kapleau', kind: 'studied-with', note: 'แคปโลเริ่มฝึกที่วัดฮตสึชินจิกับฮาราดะ (1953)' },
  { from: 'yasutani', to: 'joko-beck', kind: 'studied-with', note: 'เบ็คร่วมเซ็สชินกับยาซุทานิระหว่างที่ท่านมาสอนในอเมริกา' },
);
