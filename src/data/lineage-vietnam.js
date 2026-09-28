// Lineage nodes — Vietnamese Thiền (TASKS P6-03). Existing nodes (vinitaruci, vo-ngon-thong, g-vnt → tue-trung → tran-nhan-tong,
// thao-duong, g-vn-linji, nguyen-thieu, lieu-quan, nhat-hanh) live in lineage.js. Early generations follow the 禪苑集英 (traditional).
ZEN_DATA.lineage.nodes.push(
  // ── Vinītaruci line (traditional) ────────────────────
  { id: 'g-vn-vinitaruci', parent: 'vinitaruci', kind: 'group', label: { th: 'หลายรุ่นในสายวินีตารุจิ (ฝ่าปเหียน … เทียนอง)', zh: '法賢 … 禪翁' }, note: 'ตามขนบ 禪苑集英' },
  { id: 'van-hanh', parent: 'g-vn-vinitaruci', note: 'รุ่นที่ 12 ตามขนบ' },

  // ── Vô Ngôn Thông line (traditional) ─────────────────
  { id: 'g-vn-vnt-early', parent: 'vo-ngon-thong', kind: 'group', label: { th: 'ก๋ามแถ่ง → เทียนโห่ย → เวินฟอง', zh: '感誠 → 善會 → 雲峰' }, note: 'ตามขนบ 禪苑集英' },
  { id: 'khuong-viet', parent: 'g-vn-vnt-early', note: 'รุ่นที่ 4 ตามขนบ' },
  { id: 'g-vn-vnt-mid', parent: 'khuong-viet', kind: 'group', label: { th: 'รุ่นที่ 5–7 ในสายหวอหงอนทง (ด่าบ๋าว … กว๋างจี๊)', zh: '多寶 … 廣智' }, note: 'ตามขนบ' },
  { id: 'man-giac', parent: 'g-vn-vnt-mid', note: 'รุ่นที่ 8 ตามขนบ' },

  // ── Trần dynasty and Trúc Lâm ────────────────────────
  { id: 'g-vn-phu-van', parent: 'g-vnt', kind: 'group', label: { th: 'ราชครูฝู่วันแห่งเอียนตื๋อ', zh: '浮雲國師' }, note: 'ตำแหน่งในสายไม่ชัดเจน — วางไว้ในสายหวอหงอนทงที่สำนักจุกเลิมอ้าง' },
  { id: 'tran-thai-tong', parent: 'g-vn-phu-van', note: 'ได้รับคำชี้แนะบนเอียนตื๋อ (1236) ไม่ใช่การมอบธรรมอย่างเป็นทางการ' },
  { id: 'phap-loa', parent: 'tran-nhan-tong', note: 'สังฆปริณายกจุกเลิมองค์ที่ 2 (1308)' },
  { id: 'huyen-quang', parent: 'phap-loa', note: 'สังฆปริณายกจุกเลิมองค์ที่ 3 (1330)' },
  { id: 'g-vn-truc-lam-later', parent: 'huyen-quang', kind: 'group', label: { th: 'จุกเลิมรุ่นหลัง (สืบทางอุดมการณ์ สายตรงขาดตอน)', zh: '竹林 (後代)' } },
  { id: 'huong-hai', parent: 'g-vn-truc-lam-later', note: 'อาจารย์ในภาคกลางของท่านระบุไม่ตรงกันในแต่ละแหล่ง' },

  // ── Later Lâm Tế lines ───────────────────────────────
  { id: 'g-vn-chuyet-cong', parent: 'g-ming-linji', kind: 'group', label: { th: 'สายหลินจี้ภาคเหนือ: จ๊วตกง → มิญเลือง', zh: '拙公 → 明良' } },
  { id: 'chan-nguyen', parent: 'g-vn-chuyet-cong' },
  { id: 'g-vn-thien-hoa', parent: 'g-vn-linji', kind: 'group', label: { th: 'หลายรุ่นในสายลัมเต๊ภาคใต้ (ถึงเทียนฮหวา)', zh: '臨濟 … 善華' } },
  { id: 'thanh-tu', parent: 'g-vn-thien-hoa', note: 'บวชกับเทียนฮหวา แต่ประกาศฟื้นสำนักจุกเลิม' },
);

ZEN_DATA.lineage.links.push(
  { from: 'tran-thai-tong', to: 'tran-nhan-tong', kind: 'influence', note: 'พระอัยกา; ผู้บุกเบิกเทียนของราชสำนักเจิ่นบนเอียนตื๋อ' },
  { from: 'huyen-quang', to: 'chan-nguyen', kind: 'influence', note: 'เจินเงวียนจัดพิมพ์งานสมัยเจิ่นใหม่และฟื้นอัตลักษณ์จุกเลิม' },
  { from: 'huong-hai', to: 'thanh-tu', kind: 'influence', note: 'ทัญตื่อใช้ข้อเขียนของเฮืองฮ้ายในการสอน' },
  { from: 'tran-nhan-tong', to: 'thanh-tu', kind: 'influence', note: 'การฟื้นฟูสำนักจุกเลิมในศตวรรษที่ 20' },
);
