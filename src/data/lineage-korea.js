// Lineage nodes — Korean Sŏn (Phase 6, TASKS P6-02). Existing Korean nodes (doui, g-kusan, jinul, taego, g-joseon, seosan,
// g-late-joseon, gyeongheo) live in lineage.js. Group nodes stand for teachers who have no person entry (Buswell, Mu Soeng).
ZEN_DATA.lineage.nodes.push(
  // ── Silla: Nine Mountains founders under Mazu's heirs ─
  { id: 'muyeom', parent: 'magu', note: 'ต้นสำนักภูเขาซองจู (聖住山)' },
  { id: 'beomil', parent: 'yanguan', note: 'ต้นสำนักภูเขาซากุล (闍崛山) — สายที่ชินุลบวชในวัยเด็ก' },

  // ── Goryeo ───────────────────────────────────────────
  { id: 'hyesim', parent: 'jinul', note: 'ผู้สืบตำแหน่งที่ซูซอนซา (ซงกวังซา)' },
  { id: 'g-pingshan', parent: 'jian-zongxin', kind: 'group', label: { th: 'ผิงซาน ชู่หลิน — ศิษย์จี๋อาน จงซิ่น รุ่นเดียวกับสืออู ชิงก่ง', zh: '平山處林' } },
  { id: 'naong', parent: 'g-pingshan', note: 'ได้รับการรับรองจากพระอินเดียจื่อคง (指空) ด้วย' },
  { id: 'muhak', parent: 'naong' },
  { id: 'hamheo', parent: 'muhak' },

  // ── Joseon ───────────────────────────────────────────
  { id: 'samyeong', parent: 'seosan' },

  // ── Modern ───────────────────────────────────────────
  { id: 'mangong', parent: 'gyeongheo' },
  { id: 'hanam', parent: 'gyeongheo' },
  { id: 'g-kobong', parent: 'mangong', kind: 'group', label: { th: 'โคบง คยองอุก', zh: '古峰景昱' }, note: 'ศิษย์มันกง อาจารย์ผู้รับรองซึงซาน (1949)' },
  { id: 'seung-sahn', parent: 'g-kobong' },
  { id: 'g-yongseong', parent: 'g-late-joseon', kind: 'group', label: { th: 'ยงซอง ชินจง → ทงซาน ฮเยอิล', zh: '龍城震鍾 → 東山慧日' }, note: 'สายของอาจารย์ร่วมสมัยกับคยองฮอ' },
  { id: 'seongcheol', parent: 'g-yongseong' },
  { id: 'g-hyobong', parent: 'g-late-joseon', kind: 'group', label: { th: 'ซอกดู โพแท็ก → ฮโยบง ฮักนุล', zh: '石頭寶澤 → 曉峰學訥' } },
  { id: 'kusan-suryeon', parent: 'g-hyobong' },
);

ZEN_DATA.lineage.links.push(
  { from: 'naong', to: 'seosan', kind: 'secondary', note: 'เอกสารต้นศตวรรษที่ 17 บางชิ้นโยงสายของซอซันมาที่นาอง ก่อน "สายแทโก" จะกลายเป็นมาตรฐาน' },
  { from: 'jinul', to: 'seosan', kind: 'influence', note: 'แนวทางซอนกับคัมภีร์และการพิจารณาฮวาดูใน 禪家龜鑑 สืบจากชินุล' },
  { from: 'jinul', to: 'kusan-suryeon', kind: 'influence', note: 'คูซานฟื้นสมาคมของชินุลที่ซงกวังซาเป็นชงนิม (1969)' },
);
