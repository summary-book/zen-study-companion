// Bibliography. kind: primary (original text, public domain) | digital (digital edition) |
// translation (modern translation — copyrighted: cite only, never copy) | study (scholarship) | reference.
ZEN_DATA.sources.push(
  // ── Digital editions ──────────────────────────────────────────
  { id: 'cbeta', kind: 'digital', title: 'CBETA 電子佛典集成 (CBETA Online)', author: 'Chinese Buddhist Electronic Text Association', year: 2025, license: 'CC BY-NC-SA 4.0', url: 'https://cbetaonline.dila.edu.tw/', note: 'ตัวบท 漢文 ทั้งหมดในแอปดึงจาก CBETA API (cbdata.dila.edu.tw) ตรวจสัญญาอนุญาตเมื่อ 2026-09-27 ที่ https://cbeta.org/copyright' },
  { id: 'suttacentral-ms', kind: 'digital', title: 'Mahāsaṅgīti Tipiṭaka Buddhavasse 2500 (SuttaCentral)', author: 'SuttaCentral / M.L. Maniratana Bunnag Dhamma Society Fund', license: 'Public Domain Mark 1.0', url: 'https://suttacentral.net/', note: 'ตัวบทบาลีที่ใช้ใน view เทียบเถรวาท' },

  // ── Primary texts (Taishō / Zokuzōkyō numbers as in CBETA) ────
  { id: 'T0251', kind: 'primary', title: '般若波羅蜜多心經', author: '玄奘 譯', year: 649, note: 'Taishō vol. 8 no. 251', url: 'https://cbetaonline.dila.edu.tw/zh/T0251' },
  { id: 'T0235', kind: 'primary', title: '金剛般若波羅蜜經', author: '鳩摩羅什 譯', year: 402, note: 'Taishō vol. 8 no. 235', url: 'https://cbetaonline.dila.edu.tw/zh/T0235' },
  { id: 'T0670', kind: 'primary', title: '楞伽阿跋多羅寶經 (4 卷)', author: '求那跋陀羅 譯', year: 443, note: 'Taishō vol. 16 no. 670', url: 'https://cbetaonline.dila.edu.tw/zh/T0670' },
  { id: 'T2010', kind: 'primary', title: '信心銘', author: '僧璨 (ตามขนบ)', note: 'Taishō vol. 48 no. 2010', url: 'https://cbetaonline.dila.edu.tw/zh/T2010' },
  { id: 'T2008', kind: 'primary', title: '六祖大師法寶壇經 (宗寶本)', author: '宗寶 編', year: 1291, note: 'Taishō vol. 48 no. 2008 — ฉบับที่แพร่หลายที่สุด', url: 'https://cbetaonline.dila.edu.tw/zh/T2008' },
  { id: 'T2007', kind: 'primary', title: '南宗頓教最上大乘摩訶般若波羅蜜經六祖惠能大師於韶州大梵寺施法壇經 (敦煌本)', author: '法海 集記', note: 'Taishō vol. 48 no. 2007 — ฉบับตุนหวง ฉบับเก่าที่สุดที่เหลืออยู่', url: 'https://cbetaonline.dila.edu.tw/zh/T2007' },
  { id: 'T2012A', kind: 'primary', title: '黃檗山斷際禪師傳心法要', author: '裴休 集', year: 857, note: 'Taishō vol. 48 no. 2012A', url: 'https://cbetaonline.dila.edu.tw/zh/T2012A' },
  { id: 'T1985', kind: 'primary', title: '鎮州臨濟慧照禪師語錄', author: '慧然 集', year: 1120, note: 'Taishō vol. 47 no. 1985', url: 'https://cbetaonline.dila.edu.tw/zh/T1985' },
  { id: 'T2005', kind: 'primary', title: '無門關', author: '無門慧開 著 / 彌衍宗紹 編', year: 1228, note: 'Taishō vol. 48 no. 2005', url: 'https://cbetaonline.dila.edu.tw/zh/T2005' },
  { id: 'T2003', kind: 'primary', title: '佛果圜悟禪師碧巖錄', author: '雪竇重顯 頌古 / 圜悟克勤 評唱', year: 1125, note: 'Taishō vol. 48 no. 2003', url: 'https://cbetaonline.dila.edu.tw/zh/T2003' },
  { id: 'T2004', kind: 'primary', title: '萬松老人評唱天童覺和尚頌古從容庵錄', author: '宏智正覺 頌古 / 萬松行秀 評唱', year: 1224, note: 'Taishō vol. 48 no. 2004', url: 'https://cbetaonline.dila.edu.tw/zh/T2004' },
  { id: 'T2076', kind: 'primary', title: '景德傳燈錄', author: '道原 纂', year: 1004, note: 'Taishō vol. 51 no. 2076 — แหล่งหลักของรายชื่อสังฆปริณายกและประวัติอาจารย์เซน', url: 'https://cbetaonline.dila.edu.tw/zh/T2076' },
  { id: 'T2582', kind: 'primary', title: '正法眼藏 (95 卷 · 本山版)', author: '道元', year: 1231, edition: 'SAT', note: 'Taishō vol. 82 no. 2582 · เขียน 1231–1253 · CBETA ไม่มีเล่มนี้ — ข้อความที่แสดงเป็นการยกอ้างจาก SAT DB', url: 'https://21dzk.l.u-tokyo.ac.jp/SAT/ddb-sat2.php?mode=detail&useid=2582_' },
  { id: 'T2580', kind: 'primary', title: '普勸坐禪儀', author: '道元', year: 1227, edition: 'SAT', note: 'Taishō vol. 82 no. 2580 · ร่างแรกยุคคาโรกุ (ราว 1227) ไม่เหลือ · ฉบับลายมือ 天福本 ลงปี 1233 · ฉบับที่แพร่หลาย (流布本) ปรับแก้ภายหลัง — ไทโชพิมพ์ทั้งสองฉบับ · CBETA ไม่มี — ยกอ้างจาก SAT DB', url: 'https://21dzk.l.u-tokyo.ac.jp/SAT/ddb-sat2.php?mode=detail&useid=2580_' },
  { id: 'X1269', kind: 'primary', title: '住鼎州梁山廓庵和尚十牛圖頌', author: '廓庵師遠 頌 / 慈遠 序', note: '卍新纂續藏經 vol. 64 no. 1269', url: 'https://cbetaonline.dila.edu.tw/zh/X1269' },
  { id: 'T1998A', kind: 'primary', title: '大慧普覺禪師語錄', author: '大慧宗杲', note: 'Taishō vol. 47 no. 1998A', url: 'https://cbetaonline.dila.edu.tw/zh/T1998A' },
  { id: 'T2001', kind: 'primary', title: '宏智禪師廣錄', author: '宏智正覺', note: 'Taishō vol. 48 no. 2001 (มี 默照銘)', url: 'https://cbetaonline.dila.edu.tw/zh/T2001' },
  { id: 'T2060', kind: 'primary', title: '續高僧傳', author: '道宣', year: 645, note: 'Taishō vol. 50 no. 2060 — มีประวัติโพธิธรรมและฮุ่ยเข่อที่เก่าที่สุดชิ้นหนึ่ง', url: 'https://cbetaonline.dila.edu.tw/zh/T2060' },
  { id: 'T2837', kind: 'primary', title: '楞伽師資記', author: '淨覺', note: 'Taishō vol. 85 no. 2837 — เอกสารตุนหวงของสายเหนือ', url: 'https://cbetaonline.dila.edu.tw/zh/T2837' },

  // ── Modern translations (copyrighted — cited only) ────────────
  { id: 'redpine-heart', kind: 'translation', title: 'The Heart Sutra: The Womb of Buddhas', author: 'Red Pine', year: 2004, publisher: 'Shoemaker & Hoard' },
  { id: 'nhat-hanh-heart', kind: 'translation', title: 'The Heart of Understanding', author: 'Thich Nhat Hanh', year: 1988, publisher: 'Parallax Press' },
  { id: 'lopez-heart', kind: 'study', title: 'Elaborations on Emptiness: Uses of the Heart Sūtra', author: 'Donald S. Lopez Jr.', year: 1996, publisher: 'Princeton University Press' },
  { id: 'nattier-heart', kind: 'study', title: 'The Heart Sūtra: A Chinese Apocryphal Text?', author: 'Jan Nattier', year: 1992, publisher: 'Journal of the International Association of Buddhist Studies 15(2)' },
  { id: 'shengyen-faith', kind: 'translation', title: 'Faith in Mind: A Guide to Ch\'an Practice', author: 'Master Sheng Yen', year: 1987, publisher: 'Dharma Drum' },
  { id: 'clarke-xinxin', kind: 'translation', title: 'Hsin-Hsin Ming: Verses on the Faith-Mind', author: 'Richard B. Clarke (tr.)', year: 1973, publisher: 'White Pine Press' },
  { id: 'yampolsky-platform', kind: 'translation', title: 'The Platform Sutra of the Sixth Patriarch', author: 'Philip B. Yampolsky', year: 1967, publisher: 'Columbia University Press', note: 'แปลฉบับตุนหวง พร้อมบทศึกษาประวัติศาสตร์' },
  { id: 'mcrae-platform', kind: 'translation', title: 'The Platform Sutra of the Sixth Patriarch (BDK English Tripiṭaka)', author: 'John R. McRae', year: 2000, publisher: 'Numata Center' },
  { id: 'redpine-platform', kind: 'translation', title: 'The Platform Sutra: The Zen Teaching of Hui-neng', author: 'Red Pine', year: 2006, publisher: 'Counterpoint' },
  { id: 'wong-weilang', kind: 'translation', title: 'Sutra Spoken by the Sixth Patriarch, Wei Lang, on the High Seat of the Gem of Law', author: 'Wong Mou-lam', year: 1930, publisher: 'Yu Ching Press', note: 'ต้นทางของชื่อ "Wei Lang / เว่ยหล่าง" ที่แพร่หลายในไทย' },
  { id: 'buddhadasa-weilang', kind: 'translation', title: 'สูตรของเว่ยหล่าง', author: 'พุทธทาสภิกขุ (แปล)', publisher: 'ธรรมทานมูลนิธิ', note: 'แปลจากฉบับอังกฤษของ Wong Mou-lam' },
  { id: 'blofeld-huangpo', kind: 'translation', title: 'The Zen Teaching of Huang Po: On the Transmission of Mind', author: 'John Blofeld', year: 1958, publisher: 'Grove Press' },
  { id: 'buddhadasa-huangpo', kind: 'translation', title: 'คำสอนของฮวงโป', author: 'พุทธทาสภิกขุ (แปล)', publisher: 'ธรรมทานมูลนิธิ', note: 'แปลจากฉบับของ John Blofeld' },
  { id: 'watson-linji', kind: 'translation', title: 'The Zen Teachings of Master Lin-chi', author: 'Burton Watson', year: 1993, publisher: 'Shambhala' },
  { id: 'aitken-gateless', kind: 'translation', title: 'The Gateless Barrier: The Wu-men Kuan (Mumonkan)', author: 'Robert Aitken', year: 1990, publisher: 'North Point Press' },
  { id: 'yamada-gateless', kind: 'translation', title: 'The Gateless Gate: The Classic Book of Zen Koans', author: 'Koun Yamada', year: 2004, publisher: 'Wisdom Publications' },
  { id: 'shibayama-mumonkan', kind: 'translation', title: 'Zen Comments on the Mumonkan', author: 'Zenkei Shibayama', year: 1974, publisher: 'Harper & Row' },
  { id: 'cleary-bluecliff', kind: 'translation', title: 'The Blue Cliff Record', author: 'Thomas Cleary & J.C. Cleary', year: 1977, publisher: 'Shambhala' },
  { id: 'tanahashi-shobogenzo', kind: 'translation', title: 'Treasury of the True Dharma Eye: Zen Master Dogen\'s Shobo Genzo', author: 'Kazuaki Tanahashi (ed.)', year: 2010, publisher: 'Shambhala' },
  { id: 'suzuki-manual', kind: 'translation', title: 'Manual of Zen Buddhism', author: 'D.T. Suzuki', year: 1935, publisher: 'Eastern Buddhist Society', note: 'มีคำแปลภาพฝึกวัวสิบภาพและ 信心銘' },

  // ── Scholarship ───────────────────────────────────────────────
  { id: 'dumoulin-history', kind: 'study', title: 'Zen Buddhism: A History (2 vols.)', author: 'Heinrich Dumoulin', year: 1988, publisher: 'Macmillan / World Wisdom (2005 ed.)' },
  { id: 'mcrae-seeing', kind: 'study', title: 'Seeing through Zen: Encounter, Transformation, and Genealogy in Chinese Chan Buddhism', author: 'John R. McRae', year: 2003, publisher: 'University of California Press' },
  { id: 'mcrae-northern', kind: 'study', title: 'The Northern School and the Formation of Early Ch\'an Buddhism', author: 'John R. McRae', year: 1986, publisher: 'University of Hawaii Press' },
  { id: 'jorgensen-huineng', kind: 'study', title: 'Inventing Hui-neng, the Sixth Patriarch', author: 'John Jorgensen', year: 2005, publisher: 'Brill' },
  { id: 'faure-orthodoxy', kind: 'study', title: 'The Will to Orthodoxy: A Critical Genealogy of Northern Chan Buddhism', author: 'Bernard Faure', year: 1997, publisher: 'Stanford University Press' },
  { id: 'broughton-bodhidharma', kind: 'study', title: 'The Bodhidharma Anthology: The Earliest Records of Zen', author: 'Jeffrey L. Broughton', year: 1999, publisher: 'University of California Press' },
  { id: 'schlutter-howzen', kind: 'study', title: 'How Zen Became Zen: The Dispute over Enlightenment and the Formation of Chan Buddhism in Song-Dynasty China', author: 'Morten Schlütter', year: 2008, publisher: 'University of Hawaii Press' },
  { id: 'heine-koan', kind: 'study', title: 'The Kōan: Texts and Contexts in Zen Buddhism', author: 'Steven Heine & Dale S. Wright (eds.)', year: 2000, publisher: 'Oxford University Press' },
  { id: 'buswell-chinul', kind: 'study', title: 'Tracing Back the Radiance: Chinul\'s Korean Way of Zen', author: 'Robert E. Buswell Jr.', year: 1991, publisher: 'University of Hawaii Press' },
  { id: 'buswell-monastic', kind: 'study', title: 'The Zen Monastic Experience: Buddhist Practice in Contemporary Korea', author: 'Robert E. Buswell Jr.', year: 1992, publisher: 'Princeton University Press' },
  { id: 'nguyen-vietnam', kind: 'study', title: 'Zen in Medieval Vietnam: A Study and Translation of the Thiền Uyển Tập Anh', author: 'Cuong Tu Nguyen', year: 1997, publisher: 'University of Hawaii Press' },
  { id: 'bodiford-soto', kind: 'study', title: 'Sōtō Zen in Medieval Japan', author: 'William M. Bodiford', year: 1993, publisher: 'University of Hawaii Press' },
  { id: 'welter-monks', kind: 'study', title: 'Monks, Rulers, and Literati: The Political Ascendancy of Chan Buddhism', author: 'Albert Welter', year: 2006, publisher: 'Oxford University Press' },
  { id: 'poceski-ordinary', kind: 'study', title: 'Ordinary Mind as the Way: The Hongzhou School and the Growth of Chan Buddhism', author: 'Mario Poceski', year: 2007, publisher: 'Oxford University Press' },
  { id: 'foulk-sung', kind: 'study', title: 'Myth, Ritual, and Monastic Practice in Sung Ch\'an Buddhism (in Religion and Society in T\'ang and Sung China)', author: 'T. Griffith Foulk', year: 1993, publisher: 'University of Hawaii Press' },
  { id: 'sheng-yen-hoofprint', kind: 'study', title: 'Hoofprint of the Ox: Principles of the Chan Buddhist Path', author: 'Master Sheng Yen with Dan Stevenson', year: 2001, publisher: 'Oxford University Press' },
  { id: 'suzuki-shunryu', kind: 'study', title: 'Zen Mind, Beginner\'s Mind', author: 'Shunryu Suzuki', year: 1970, publisher: 'Weatherhill' },
  { id: 'kapleau-pillars', kind: 'study', title: 'The Three Pillars of Zen', author: 'Philip Kapleau', year: 1965, publisher: 'Beacon Press' },
  { id: 'buddhadasa-zen', kind: 'study', title: 'ธรรมะเซน / บรรยายเรื่องเซน (ชุดธรรมโฆษณ์)', author: 'พุทธทาสภิกขุ', publisher: 'ธรรมทานมูลนิธิ', note: 'มุมมองผู้ศึกษาเถรวาทไทยต่อเซน' },

  // ── Theravāda references ─────────────────────────────────────
  { id: 'bodhi-samyutta', kind: 'translation', title: 'The Connected Discourses of the Buddha (Saṃyutta Nikāya)', author: 'Bhikkhu Bodhi', year: 2000, publisher: 'Wisdom Publications' },
  { id: 'nanamoli-majjhima', kind: 'translation', title: 'The Middle Length Discourses of the Buddha (Majjhima Nikāya)', author: 'Bhikkhu Ñāṇamoli & Bhikkhu Bodhi', year: 1995, publisher: 'Wisdom Publications' },
  { id: 'nanamoli-visuddhi', kind: 'translation', title: 'The Path of Purification (Visuddhimagga)', author: 'Bhikkhu Ñāṇamoli', year: 1956, publisher: 'Buddhist Publication Society' },
  { id: 'tipitaka-mcu', kind: 'translation', title: 'พระไตรปิฎกภาษาไทย ฉบับมหาจุฬาลงกรณราชวิทยาลัย', author: 'มหาจุฬาลงกรณราชวิทยาลัย', year: 1996, note: 'อ้างเล่ม/ข้อเท่านั้น — คำแปลมีลิขสิทธิ์ ถอดความในแอปเขียนเอง' },
  { id: 'payutto-dict', kind: 'reference', title: 'พจนานุกรมพุทธศาสน์ ฉบับประมวลธรรม', author: 'พระพรหมคุณาภรณ์ (ป.อ. ปยุตฺโต)', note: 'อ้างอิงศัพท์บาลี' },
  { id: 'payutto-buddhadhamma', kind: 'study', title: 'พุทธธรรม ฉบับปรับขยาย', author: 'พระพรหมคุณาภรณ์ (ป.อ. ปยุตฺโต)', year: 2012, publisher: 'ผลิธัมม์' },
  { id: 'dfb', kind: 'reference', title: 'Digital Dictionary of Buddhism (電子佛教辭典)', author: 'A. Charles Muller (ed.)', url: 'http://www.buddhism-dict.net/ddb/' },
  { id: 'ri-transcription', kind: 'reference', title: 'หลักเกณฑ์การถอดอักษรจีนด้วยเสียงภาษาไทย (ระบบพินอิน)', author: 'สำนักงานราชบัณฑิตยสภา', note: 'ใช้เป็นแนวในการถอดเสียงชื่อจีนกลาง' },
  // Platform Sūtra studies (added with texts/platform-sutra.js)
  { id: 'hushi-shenhui', kind: 'study', title: '神會和尚遺集 (Posthumous Collection of the Venerable Shenhui)', author: '胡適 (Hu Shih)', year: 1930, publisher: '亞東圖書館 (Shanghai)', note: 'ตีพิมพ์งานของเสินฮุ่ยที่พบในต้นฉบับตุนหวง พร้อมข้อเสนอว่าสายเสินฮุ่ยมีบทบาทในการแต่ง 壇經' },
  { id: 'yanagida-shoki', kind: 'study', title: '初期禅宗史書の研究', author: '柳田聖山 (Yanagida Seizan)', year: 1967, publisher: '法藏館' },
  { id: 'schlutter-teiser-platform', kind: 'study', title: 'Readings of the Platform Sūtra', author: 'Morten Schlütter & Stephen F. Teiser (eds.)', year: 2012, publisher: 'Columbia University Press' },
  // ── Added for Heart Sūtra / 信心銘 (texts agent) ─────────────
  { id: 'fukui-heart', kind: 'study', title: '般若心経の歴史的研究', author: '福井文雅 (Fukui Fumimasa)', year: 1987, publisher: '春秋社', note: 'ศึกษาประวัติการใช้หฤทัยสูตรในจีน และการอ่านคำว่า 心 ในเชิงธารณี' },
  { id: 'huifeng-heart', kind: 'study', title: 'Apocryphal Treatment for Conze\'s Heart Problems: Non-attainment, Apprehension and Mental Hanging in the Prajñāpāramitā', author: 'Ven. Huifeng (Matthew Orsborn)', year: 2014, publisher: 'Journal of the Oxford Centre for Buddhist Studies 6' },
  { id: 'attwood-heart', kind: 'study', title: 'Form is (Not) Emptiness: The Enigma at the Heart of the Heart Sutra', author: 'Jayarava Attwood', year: 2017, publisher: 'Journal of the Oxford Centre for Buddhist Studies 13' },
  // ── Theravāda comparison (view 7) ─────────────────────────────
  { id: 'bodhi-anguttara', kind: 'translation', title: 'The Numerical Discourses of the Buddha (Aṅguttara Nikāya)', author: 'Bhikkhu Bodhi', year: 2012, publisher: 'Wisdom Publications' },
  { id: 'walshe-digha', kind: 'translation', title: 'The Long Discourses of the Buddha (Dīgha Nikāya)', author: 'Maurice Walshe', year: 1995, publisher: 'Wisdom Publications' },
  { id: 'norman-suttanipata', kind: 'translation', title: 'The Group of Discourses (Sutta-nipāta), 2nd ed.', author: 'K.R. Norman', year: 2001, publisher: 'Pali Text Society' },
  { id: 'ireland-udana', kind: 'translation', title: 'The Udāna and the Itivuttaka', author: 'John D. Ireland', year: 1997, publisher: 'Buddhist Publication Society' },
  { id: 'gregory-sudden', kind: 'study', title: 'Sudden and Gradual: Approaches to Enlightenment in Chinese Thought', author: 'Peter N. Gregory (ed.)', year: 1987, publisher: 'University of Hawaii Press (Kuroda Institute)' },
  // ── added by practice / ox-herding content ─────────────────────
  { id: 'X1245', kind: 'primary', title: '(重雕補註)禪苑清規', author: '長蘆宗賾', year: 1103, note: '卍新纂續藏經 vol. 63 no. 1245 — 卷八 มี 《坐禪儀》 ต้นแบบของ 普勸坐禪儀', url: 'https://cbetaonline.dila.edu.tw/zh/X1245' },
  { id: 'X1401', kind: 'primary', title: '高峰原妙禪師禪要', author: '高峰原妙', note: '卍新纂續藏經 vol. 70 no. 1401', url: 'https://cbetaonline.dila.edu.tw/zh/X1401' },
);
ZEN_DATA.sources.push(
  { id: 'sekida-twozen', kind: 'translation', title: 'Two Zen Classics: Mumonkan and Hekiganroku', author: 'Katsuki Sekida (tr.), A.V. Grimstone (ed.)', year: 1977, publisher: 'Weatherhill' },
  { id: 'guogu-gateless', kind: 'translation', title: 'Passing Through the Gateless Barrier: Kōan Practice for Real Life', author: 'Guo Gu', year: 2016, publisher: 'Shambhala' },
);
// ── Diamond Sūtra (added with texts/diamond-sutra.js) ─────────
ZEN_DATA.sources.push(
  { id: 'redpine-diamond', kind: 'translation', title: 'The Diamond Sutra: The Perfection of Wisdom', author: 'Red Pine', year: 2001, publisher: 'Counterpoint', note: 'แปลจากฉบับสันสกฤตพร้อมอรรถาธิบายที่รวบรวมคำอธิบายจีนหลายสำนัก' },
  { id: 'conze-wisdom', kind: 'translation', title: 'Buddhist Wisdom Books: The Diamond Sutra and The Heart Sutra', author: 'Edward Conze', year: 1958, publisher: 'George Allen & Unwin' },
  { id: 'harrison-vajra', kind: 'study', title: 'Vajracchedikā Prajñāpāramitā: A New English Translation of the Sanskrit Text Based on Two Manuscripts from Greater Gandhāra', author: 'Paul Harrison', year: 2006, publisher: 'Buddhist Manuscripts in the Schøyen Collection vol. III (Hermes Publishing, Oslo)' },
  { id: 'wood-diamond', kind: 'study', title: "The Diamond Sutra: The Story of the World's Earliest Dated Printed Book", author: 'Frances Wood & Mark Barnard', year: 2010, publisher: 'The British Library' },
  { id: 'suzuki-kongokyo', kind: 'study', title: '金剛経の禅', author: '鈴木大拙 (D.T. Suzuki)', year: 1944, publisher: '大東出版社', note: 'เสนอ "ตรรกะแห่ง 即非" (sokuhi no ronri) เป็นกุญแจอ่านวัชรสูตร' },
  { id: 'musoeng-diamond', kind: 'study', title: 'The Diamond Sutra: Transforming the Way We Perceive the World', author: 'Mu Soeng', year: 2000, publisher: 'Wisdom Publications' },
);
// ── added by lankavatara (Phase 3) ─────────────────────────────
ZEN_DATA.sources.push(
  { id: 'suzuki-lanka', kind: 'translation', title: 'The Lankavatara Sutra: A Mahayana Text', author: 'D.T. Suzuki (tr.)', year: 1932, publisher: 'Routledge & Kegan Paul', note: 'แปลจากต้นฉบับสันสกฤต (ไม่ใช่ฉบับคุณภัทร)' },
  { id: 'suzuki-lanka-studies', kind: 'study', title: 'Studies in the Lankavatara Sutra', author: 'D.T. Suzuki', year: 1930, publisher: 'Routledge & Kegan Paul' },
  { id: 'redpine-lanka', kind: 'translation', title: 'The Lankavatara Sutra: Translation and Commentary', author: 'Red Pine', year: 2012, publisher: 'Counterpoint', note: 'แปลจากฉบับคุณภัทร 4 ผูก (T670)' },
);
ZEN_DATA.sources.push(
  { id: 'welter-linji', kind: 'study', title: 'The Linji lu and the Creation of Chan Orthodoxy: The Development of Chan\'s Records of Sayings Literature', author: 'Albert Welter', year: 2008, publisher: 'Oxford University Press', note: 'ศึกษาการเรียบเรียงและปรับแก้ 臨濟錄 สมัยซ่ง' },
);
ZEN_DATA.sources.push(
  { id: 'iriya-hekigan', kind: 'translation', title: '碧巌録 (上・中・下) 岩波文庫', author: '入矢義高・溝口雄三・末木文美士・伊藤文生 訳注', year: 1992, publisher: '岩波書店', note: 'ฉบับแปลและอรรถาธิบายภาษาญี่ปุ่นที่ใช้กันแพร่หลาย (1992–1996) — อ้างอิงเท่านั้น' },
);
