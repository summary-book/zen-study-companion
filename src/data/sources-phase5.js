// Sources for Phase 5 (從容錄 · 正法眼藏 · Japanese Zen). Pre-created before the content work so every file cites the
// same ids (see src/data/IDS.md). Modern translations/studies are cited only — never copied.
ZEN_DATA.sources.push(
  // ── Digital edition ──────────────────────────────────────────
  { id: 'sat', kind: 'digital', title: 'SAT大正新脩大藏經テキストデータベース (SAT Daizōkyō Text Database)', author: 'SAT大藏經テキストデータベース研究会 (The University of Tokyo)', url: 'https://21dzk.l.u-tokyo.ac.jp/SAT/', license: 'เงื่อนไขการใช้งาน SAT (ฉบับ 2008-04-01): ใช้เพื่อการศึกษา/ไม่แสวงหากำไร · ยกอ้างได้โดยระบุที่มา · ห้ามแจกจ่ายข้อมูลซ้ำ', note: 'ใช้สำหรับคัมภีร์ญี่ปุ่นในไทโชเล่ม 82 ที่ CBETA ไม่มี (正法眼藏 T2582, 普勸坐禪儀 T2580) — แอปแสดงเฉพาะข้อความที่ยกอ้าง ตรวจเงื่อนไขเมื่อ 2026-09-28 ที่ https://21dzk.l.u-tokyo.ac.jp/SAT/termsofuse.html' },

  // ── Primary texts cited by the 正法眼藏 fascicles (CBETA) ─────
  { id: 'T0389', kind: 'primary', title: '佛垂般涅槃略說教誡經 (遺教經)', author: '鳩摩羅什 譯', note: 'Taishō vol. 12 no. 389 — ที่มาของรายการ "สำนึกแปดประการของมหาบุรุษ" ที่โดเก็นใช้ใน 八大人覺', url: 'https://cbetaonline.dila.edu.tw/zh/T0389' },
  { id: 'T0779', kind: 'primary', title: '佛說八大人覺經', author: '安世高 譯 (ตามขนบ)', note: 'Taishō vol. 17 no. 779 — พระสูตรสั้นอีกฉบับที่มีชื่อ "八大人覺" แต่รายการต่างจาก 遺教經', url: 'https://cbetaonline.dila.edu.tw/zh/T0779' },

  // ── 從容錄 ───────────────────────────────────────────────────
  { id: 'cleary-serenity', kind: 'translation', title: 'Book of Serenity: One Hundred Zen Dialogues', author: 'Thomas Cleary (tr.)', year: 1990, publisher: 'Lindisfarne Press' },
  { id: 'wick-equanimity', kind: 'translation', title: 'The Book of Equanimity: Illuminating Classic Zen Koans', author: 'Gerry Shishin Wick', year: 2005, publisher: 'Wisdom Publications' },
  { id: 'leighton-emptyfield', kind: 'translation', title: 'Cultivating the Empty Field: The Silent Illumination of Zen Master Hongzhi (rev. ed.)', author: 'Taigen Dan Leighton with Yi Wu (tr.)', year: 2000, publisher: 'Tuttle', note: 'พิมพ์ครั้งแรก 1991 (North Point Press)' },
  { id: 'loori-truedharma', kind: 'translation', title: "The True Dharma Eye: Zen Master Dōgen's Three Hundred Kōans", author: 'John Daido Loori (commentary), Kazuaki Tanahashi (tr.)', year: 2005, publisher: 'Shambhala', note: 'ชุดโกอาน 300 กรณีที่โดเก็นรวบรวมเป็นภาษาจีน (真字正法眼藏) — หลายกรณีซ้ำกับ 從容錄' },
  { id: 'rachewiltz-yelu', kind: 'study', title: "Yeh-lü Ch'u-ts'ai (1189–1243): Buddhist Idealist and Confucian Statesman", author: 'Igor de Rachewiltz', year: 1962, publisher: 'in A.F. Wright & D. Twitchett (eds.), Confucian Personalities, Stanford University Press' },

  // ── 正法眼藏 / Dōgen ─────────────────────────────────────────
  { id: 'nishijima-cross', kind: 'translation', title: "Master Dogen's Shobogenzo (4 vols.)", author: 'Gudo Nishijima & Chodo Cross (tr.)', year: 1994, publisher: 'Windbell Publications', note: 'ตีพิมพ์ 1994–1999' },
  { id: 'waddell-abe-dogen', kind: 'translation', title: "The Heart of Dōgen's Shōbōgenzō", author: 'Norman Waddell & Masao Abe (tr.)', year: 2002, publisher: 'State University of New York Press' },
  { id: 'sztp-shobogenzo', kind: 'translation', title: "Treasury of the True Dharma Eye: Dōgen's Shōbōgenzō (3 vols.)", author: 'Sōtō Zen Text Project (Carl Bielefeldt et al., tr.)', year: 2023, publisher: 'Sōtōshū Shūmuchō' },
  { id: 'mizuno-shobogenzo', kind: 'reference', title: '正法眼蔵 (一)〜(四) 岩波文庫', author: '水野弥穂子 校注', year: 1990, publisher: '岩波書店', note: 'ฉบับตรวจชำระพร้อมเชิงอรรถภาษาญี่ปุ่น (1990–1993) — อ้างชื่อเท่านั้น แอปไม่ได้ใช้ตัวบทจากฉบับนี้' },
  { id: 'kim-dogen', kind: 'study', title: 'Eihei Dōgen: Mystical Realist (3rd ed.)', author: 'Hee-Jin Kim', year: 2004, publisher: 'Wisdom Publications', note: 'พิมพ์ครั้งแรก 1975 (University of Arizona Press)' },
  { id: 'okumura-genjokoan', kind: 'study', title: "Realizing Genjokoan: The Key to Dogen's Shobogenzo", author: 'Shohaku Okumura', year: 2010, publisher: 'Wisdom Publications' },
  { id: 'bielefeldt-manuals', kind: 'study', title: "Dōgen's Manuals of Zen Meditation", author: 'Carl Bielefeldt', year: 1988, publisher: 'University of California Press' },
  { id: 'heine-dogen-china', kind: 'study', title: 'Did Dōgen Go to China? What He Wrote and When He Wrote It', author: 'Steven Heine', year: 2006, publisher: 'Oxford University Press' },
  { id: 'heine-dogen-koan', kind: 'study', title: 'Dōgen and the Kōan Tradition: A Tale of Two Shōbōgenzō Texts', author: 'Steven Heine', year: 1994, publisher: 'State University of New York Press' },
  { id: 'heine-time', kind: 'study', title: 'Existential and Ontological Dimensions of Time in Heidegger and Dōgen', author: 'Steven Heine', year: 1985, publisher: 'State University of New York Press' },
  { id: 'leighton-okumura-eihei', kind: 'translation', title: "Dōgen's Extensive Record: A Translation of the Eihei Kōroku", author: 'Taigen Dan Leighton & Shohaku Okumura (tr.)', year: 2004, publisher: 'Wisdom Publications' },
  { id: 'kodera-dogen', kind: 'study', title: "Dogen's Formative Years in China: An Historical Study and Annotated Translation of the Hōkyō-ki", author: 'Takashi James Kodera', year: 1980, publisher: 'Prajñā Press' },
  { id: 'watsuji-dogen', kind: 'study', title: '沙門道元 (ใน 日本精神史研究)', author: '和辻哲郎 (Watsuji Tetsurō)', year: 1926, publisher: '岩波書店', note: 'ตีพิมพ์เป็นตอน ๆ ราว 1920–1923 ก่อนรวมเล่ม' },
  { id: 'hubbard-swanson', kind: 'study', title: 'Pruning the Bodhi Tree: The Storm over Critical Buddhism', author: 'Jamie Hubbard & Paul L. Swanson (eds.)', year: 1997, publisher: 'University of Hawaii Press' },
  { id: 'lafleur-dogen', kind: 'study', title: 'Dōgen Studies', author: 'William R. LaFleur (ed.)', year: 1985, publisher: 'University of Hawaii Press' },

  // ── Japanese Zen: Sōtō ───────────────────────────────────────
  { id: 'cook-denkoroku', kind: 'translation', title: "The Record of Transmitting the Light: Zen Master Keizan's Denkoroku", author: 'Francis Dojun Cook (tr.)', year: 2003, publisher: 'Wisdom Publications', note: 'พิมพ์ครั้งแรก 1991' },
  { id: 'faure-visions', kind: 'study', title: 'Visions of Power: Imagining Medieval Japanese Buddhism', author: 'Bernard Faure', year: 1996, publisher: 'Princeton University Press' },
  { id: 'williams-soto', kind: 'study', title: 'The Other Side of Zen: A Social History of Sōtō Zen Buddhism in Tokugawa Japan', author: 'Duncan Ryūken Williams', year: 2005, publisher: 'Princeton University Press' },
  { id: 'riggs-menzan', kind: 'study', title: 'The Rekindling of a Tradition: Menzan Zuihō and the Reform of Japanese Sōtō Zen in the Tokugawa Era', author: 'David E. Riggs', year: 2002, publisher: 'PhD dissertation, University of California, Los Angeles' },
  { id: 'abe-haskel-ryokan', kind: 'translation', title: 'Great Fool: Zen Master Ryōkan — Poems, Letters, and Other Writings', author: 'Ryūichi Abé & Peter Haskel', year: 1996, publisher: 'University of Hawaii Press' },
  { id: 'tyler-shosan', kind: 'translation', title: 'Selected Writings of Suzuki Shōsan', author: 'Royall Tyler (tr.)', year: 1977, publisher: 'Cornell University East Asia Papers' },

  // ── Japanese Zen: Rinzai (Kamakura–Muromachi) ────────────────
  { id: 'collcutt-five', kind: 'study', title: 'Five Mountains: The Rinzai Zen Monastic Institution in Medieval Japan', author: 'Martin Collcutt', year: 1981, publisher: 'Harvard University Press' },
  { id: 'kraft-daito', kind: 'study', title: 'Eloquent Zen: Daitō and Early Japanese Zen', author: 'Kenneth Kraft', year: 1992, publisher: 'University of Hawaii Press' },
  { id: 'bdk-zentexts', kind: 'translation', title: 'Zen Texts (BDK English Tripiṭaka)', author: 'Numata Center for Buddhist Translation and Research', year: 2005, publisher: 'Numata Center', note: 'มีคำแปล 興禪護國論 ของเอไซ (A Treatise on Letting Zen Flourish to Protect the State) โดย Gishin Tokiwa' },
  { id: 'merwin-muso', kind: 'translation', title: 'Sun at Midnight: Poems and Sermons by Musō Soseki', author: 'W.S. Merwin & Sōiku Shigematsu (tr.)', year: 1989, publisher: 'North Point Press' },
  { id: 'kirchner-muso', kind: 'translation', title: 'Dialogues in a Dream: The Life and Zen Teachings of Musō Soseki', author: 'Thomas Yūhō Kirchner (tr.)', year: 2010, publisher: 'Tenryu-ji Institute for Philosophy and Religion' },
  { id: 'braverman-bassui', kind: 'translation', title: 'Mud and Water: A Collection of Talks by the Zen Master Bassui', author: 'Arthur Braverman (tr.)', year: 1989, publisher: 'North Point Press' },
  { id: 'arntzen-ikkyu', kind: 'study', title: 'Ikkyū and the Crazy Cloud Anthology: A Zen Poet of Medieval Japan', author: 'Sonja Arntzen', year: 1986, publisher: 'University of Tokyo Press' },
  { id: 'stevens-three', kind: 'study', title: 'Three Zen Masters: Ikkyū, Hakuin, Ryōkan', author: 'John Stevens', year: 1993, publisher: 'Kodansha International' },

  // ── Japanese Zen: Edo Rinzai, Ōbaku ──────────────────────────
  { id: 'waddell-wild-ivy', kind: 'translation', title: 'Wild Ivy: The Spiritual Autobiography of Zen Master Hakuin', author: 'Norman Waddell (tr.)', year: 1999, publisher: 'Shambhala' },
  { id: 'waddell-hakuin-essential', kind: 'translation', title: 'The Essential Teachings of Zen Master Hakuin', author: 'Norman Waddell (tr.)', year: 1994, publisher: 'Shambhala' },
  { id: 'yampolsky-hakuin', kind: 'translation', title: 'The Zen Master Hakuin: Selected Writings', author: 'Philip B. Yampolsky (tr.)', year: 1971, publisher: 'Columbia University Press' },
  { id: 'hori-zensand', kind: 'study', title: 'Zen Sand: The Book of Capping Phrases for Kōan Practice', author: 'Victor Sōgen Hori', year: 2003, publisher: 'University of Hawaii Press' },
  { id: 'waddell-bankei', kind: 'translation', title: 'The Unborn: The Life and Teachings of Zen Master Bankei, 1622–1693', author: 'Norman Waddell (tr.)', year: 1984, publisher: 'North Point Press' },
  { id: 'haskel-bankei', kind: 'translation', title: 'Bankei Zen: Translations from the Record of Bankei', author: 'Peter Haskel (tr.)', year: 1984, publisher: 'Grove Press' },
  { id: 'wilson-takuan', kind: 'translation', title: 'The Unfettered Mind: Writings of the Zen Master to the Sword Master', author: 'Takuan Sōhō, William Scott Wilson (tr.)', year: 1986, publisher: 'Kodansha International' },
  { id: 'suzuki-sengai', kind: 'study', title: 'Sengai: The Zen Master', author: 'D.T. Suzuki', year: 1971, publisher: 'Faber and Faber' },
  { id: 'baroni-obaku', kind: 'study', title: 'Obaku Zen: The Emergence of the Third Sect of Zen in Tokugawa Japan', author: 'Helen J. Baroni', year: 2000, publisher: 'University of Hawaii Press' },
  { id: 'baroni-tetsugen', kind: 'study', title: 'Iron Eyes: The Life and Teachings of the Ōbaku Zen Master Tetsugen Dōkō', author: 'Helen J. Baroni', year: 2006, publisher: 'State University of New York Press' },
  { id: 'wu-rising-sun', kind: 'study', title: 'Leaving for the Rising Sun: Chinese Zen Master Yinyuan and the Authenticity Crisis in Early Modern East Asia', author: 'Jiang Wu', year: 2015, publisher: 'Oxford University Press' },
);
