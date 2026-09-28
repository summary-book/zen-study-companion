# Reserved ids (Phase 1)

Content files may link (`[[type:id]]`, quiz `ref`, theravada `zen.refs`) ONLY to ids that exist. The ids below are
reserved for Phase 1 so that files can be written in parallel. People ids: see `src/data/people/*.js`.

## texts (`text:` / `chapter:<text>/<chapter>`)
- `heart-sutra` — chapters `c1`…`cN` (N decided by author)
- `xinxinming` — chapters `c1`…`cN`
- `platform-sutra` — chapters `c1`…`c10` = 行由第一 般若第二 疑問第三 定慧第四 坐禪第五 懺悔第六 機緣第七 頓漸第八 宣詔第九 付囑第十

## koans / collections
- collections: `mumonkan`, `hekiganroku`, `shoyoroku`
- koans in Phase 1: `mumonkan-1` (趙州狗子) only

## glossary (`term:`) — all of these must exist
chan, satori, kensho, mu, koan, huatou, zazen, shikantaza, prajna, sunyata, buddha-nature, honrai-menmoku,
furyu-monji, kyoge-betsuden, jikishi-ninshin, kensho-jobutsu, tongo, zengo, ishin-denshin, shobogenzo,
mushin, munen, muso, muju, jo-e, heijoshin, funi, shinjin, bodhi, tathata, enso, hassu, inka, ehatsu,
sesshin, roshi, zenji, kyosaku, kinhin, dokusan, teisho, mondo, katsu, daigi, mokusho, kanna, goi, unsui

## practice (`practice:`)
zazen, shikantaza, kanhua, mokusho, oxherding (gallery of the Ten Ox-herding Pictures)

## theravada (`theravada:`)
emptiness, skandhas, sudden-gradual, meditation, buddha-nature, awakening, koan, transmission, oxherding

## quiz scopes
`text:heart-sutra`, `text:xinxinming`, `text:platform-sutra`, `lineage`

## Phase 2 additions
- koans: `mumonkan-1` … `mumonkan-48`
- glossary (reserved — will be written in Phase 2): kan (關), tengo (轉語), furaku-fumai (不落因果/不昧因果), hishin-hibutsu (非心非佛), wada (話墮), kanto-shinpo (百尺竿頭進一步), honsoku (本則), ju (頌), hyosho (評唱), jakugo (著語)
- existing glossary also usable: sokushin-sokubutsu (即心即佛), jisho (自性), susokukan
- people added: damei, nanyang, danyuan, yantou, ruiyan, dongshan-shouchu, changsha, qianfeng, hualin, bajiao, xingyang, qingshui, huoan, yuean, doushuai, manjusri, wangming
- quiz scope: `collection:mumonkan`

## Phase 3 additions
- texts: `chuanxin` (傳心法要, T2012A), `linji-lu` (臨濟錄, T1985), `diamond-sutra` (金剛經, T0235), `lankavatara` (楞伽經, T0670) — chapter ids `c1`…`cN`
- people added: peixiu, zongmi, gunabhadra, subhuti, mahamati, puhua, dayu, sansheng, ding, wang-changshi (existing: huangbo, linji, kumarajiva, bodhidharma, huike, shenxiu, muzhou, zhaozhou, xinghua …)
- glossary reserved (each text agent writes ONLY its own list, in its own file `src/data/glossary-<text>.js`):
  - chuanxin → isshin (一心), honshin (本心), musho-toku (無所得)
  - linji-lu → mui-shinjin (無位真人), zuisho-saju (隨處作主), shiryoken (四料揀), sangen-sanyo (三玄三要), buji (無事), hinju (賓主)
  - diamond-sutra → omushoju (應無所住而生其心), shiso (四相), sokuhi (即非)
  - lankavatara → nyoraizo (如來藏), araya (阿賴耶識), jikaku-shochi (自覺聖智), shutsu-settsu (宗通說通)
- quiz scopes: `text:chuanxin`, `text:linji-lu`, `text:diamond-sutra`, `text:lankavatara`

## Phase 4 additions (碧巖錄)
- koans: `hekiganroku-1` … `hekiganroku-100` · layers intro (垂示) / case (本則) / commentary (評唱 on case) / verse (頌) / commentary2 (評唱 on verse)
- raw split per case: `tools/raw/T2003-cases.json` (fields `text` = with 著語, `clean` = without)
- people map (written by the people agent): `tools/raw/T2003-people.json` → `{ "1": ["bodhidharma", …], … }`
- glossary reserved (written in P4-09): suiji (垂示), juko (頌古), katto (葛藤), sotaku (啐啄同時), muhoto (無縫塔), nichinichi-koujitsu (日日是好日), kakunen-musho (廓然無聖), nichimen-butsu (日面佛月面佛)
- quiz scope: `collection:hekiganroku`

## Phase 5 additions (從容錄 · 正法眼藏 · Japan)
Data plumbing added in Phase 5: `ZEN_DATA.chapters` (chapters of a long text in their own files, `{ text: '<textId>', id, no, … }`,
merged into `texts[].chapters` at load) · source field `edition: 'SAT'` · passage `romajiKind: 'wabun'` (reading of Japanese
prose) · quiz scope `region:japan`.

### 從容錄 (`collection:shoyoroku`)
- koans: `shoyoroku-1` … `shoyoroku-100` · passage ids `sy<no>-<n>` · files `src/data/koans/shoyoroku-001-002.js` … `-099-100.js`
- raw split per case: `tools/raw/T2004-cases.json` (`title` = heading in the source, `text` with 著語, `clean` without)
- people map (people agent): `tools/raw/T2004-people.json` → `{ "1": ["shakyamuni", …], … }` · new figures in
  `src/data/people/shoyoroku-figures-1.js` / `-2.js`, tree nodes in `src/data/lineage-shoyoroku.js`
- collection intro, prefaces (passages `syp-<n>`), glossary, quiz, timeline: the 從容錄 hub agent (edits only the `shoyoroku`
  entry of `koans/collections.js`) · glossary reserved: jishu (示眾), ego (回互), kugo-izen (空劫以前), sanjin (三身)
- quiz scope `collection:shoyoroku` (files `src/data/quiz/shoyoroku-1.js` … `-3.js`)

### 正法眼藏 (`text:shobogenzo`, lang `ja`, source T2582 via SAT — quotation only, see SPEC §4.1)
- text shell `src/data/texts/shobogenzo.js` (about, people, furtherReading, keyPassages) · chapters pushed to `ZEN_DATA.chapters`
  from `src/data/texts/shobogenzo-<chapter>.js` (one fascicle per file)
- private raw text: `tools/raw-private/T2582.json`, selected fascicles `tools/raw-private/T2582-chapters.json` (git-ignored)

| no | chapter id | Taishō title | passage prefix | agent |
|---|---|---|---|---|
| 1 | bendowa | 辨道話 | sbg-bdw- | S1 |
| 2 | maka-hannya | 摩訶般若波羅蜜 | sbg-mhh- | S1 |
| 3 | genjokoan | 現成公案 | sbg-gjk- | S1 |
| 4 | ikka-myoju | 一顆明珠 | sbg-ikm- | S1 |
| 5 | sokushin-zebutsu | 即心是佛 | sbg-szb- | S1 |
| 6 | uji | 有時 | sbg-uji- | S2 |
| 7 | sansuikyo | 山水經 | sbg-ssk- | S2 |
| 8 | bussho | 佛性 | sbg-bsh- | S2 |
| 9 | zazenshin | 坐禪箴 | sbg-zzs- | S2 |
| 10 | zenki | 全機 | sbg-znk- | S2 |
| 11 | katto | 葛藤 | sbg-ktt- | S3 |
| 12 | zazengi | 坐禪儀 | sbg-zzg- | S3 |
| 13 | shoji | 生死 | sbg-shj- | S3 |
| 14 | hachidainingaku | 八大人覺 | sbg-hdn- | S3 |

- about passages `sbg-about-<n>` (S1) · 普勸坐禪儀 (T2580) passages `fkz-<n>` (Sōtō agent, in Dōgen's bio)
- glossary reserved: S1 → genjokoan (現成公案), shusho-itto (修證一等), jijuyu-zanmai (自受用三昧), honsho-myoshu (本證妙修) ·
  S2 → uji (有時), hishiryo (非思量), zenki (全機), shitsuu-bussho (悉有佛性) · S3 → shoji (生死), hachidainingaku (八大人覺)
- quiz scope `text:shobogenzo` — each S agent writes its own file `src/data/quiz/shobogenzo-<1|2|3>.js`

### Japan (Sōtō · Rinzai · Ōbaku) — people agents J1–J3
| agent | full bios for existing | new people ids | own files |
|---|---|---|---|
| J1 Sōtō | dogen, ejo, gikai, keizan | jakuen, gasan-joseki, meiho, gesshu, manzan, menzan, gento, kokusen, ryokan, shosan | `people/japan-soto.js`, `people-bios-japan-soto-1…5.js`, `lineage-japan-soto.js`, `timeline-japan-soto.js`, `glossary-japan-soto.js`, `quiz/japan-soto.js` |
| J2 Rinzai (Kamakura–Muromachi) | eisai, enni, kakushin, nanpo, daito, kanzan | lanxi, wuxue, yishan, koho, muso, bassui, kaso, ikkyu | `people/japan-rinzai.js`, `people-bios-japan-rinzai-1…5.js` (wuxue already existed in `people/china-houses.js`), `lineage-japan-rinzai.js`, `timeline-japan-rinzai.js`, `glossary-japan-rinzai.js`, `quiz/japan-rinzai.js` |
| J3 Edo Rinzai + Ōbaku | hakuin, ingen | takuan, gudo, shido-bunan, shoju, bankei, torei, gasan-jito, inzan, takuju, sengai, muan, jifei, tetsugen | `people/japan-edo.js`, `people-bios-japan-edo-1…6.js`, `lineage-japan-edo.js`, `timeline-japan-edo.js`, `glossary-japan-edo.js`, `quiz/japan-edo.js` |

- glossary reserved: J1 → shinjin-datsuraku (身心脫落), ganno-bichoku (眼橫鼻直) · J2 → gozan (五山), otokan (應燈關) ·
  J3 → sekishu (隻手音聲), fusho (不生), koan-taikei (公案體系), naikan (內觀), nenbutsu-zen (念佛禪)
- only J3 may edit `lineage.js`, and only the `g-otokan` / `hakuin` lines (the Ōtōkan chain gudo → shido-bunan → shoju → hakuin)
- only J1 may edit `practice.js`, and only the `zazen` / `shikantaza` entries (links to Dōgen and 坐禪儀)
- quiz scope `region:japan` (label "เซนญี่ปุ่น")
- new sources for the whole phase are pre-created in `src/data/sources-phase5.js` — agents cite those ids; if a book is missing, list
  it in the final report instead of adding it

## Phase 6 additions (Korea · Vietnam · modern teachers)
Sources for the phase: `src/data/sources-phase6.js` (pre-created). Raw texts: `tools/raw/T2020.json` (修心訣), `tools/raw/X1255.json` (禪家龜鑑).

| agent | writes | ids |
|---|---|---|
| T1 修心訣 | `texts/susimgyeol.js` (whole text, chapters c1…cN, passages `ssg-<n>`), `glossary-susimgyeol.js`, `quiz/susimgyeol.js` | text `susimgyeol`; terms dono-jeomsu (頓悟漸修), jeonghye-ssangsu (定慧雙修), gongjeok-yeongji (空寂靈知); quiz `text:susimgyeol` |
| T2 禪家龜鑑 | `texts/seonga-gwigam.js` (+ `texts/seonga-gwigam-<n>.js` chapter files via `ZEN_DATA.chapters`), `glossary-seonga-gwigam.js`, `quiz/seonga-gwigam.js` | text `seonga-gwigam`, passages `sgg-<n>`; terms ilmul (一物), seon-gyo (禪敎); quiz `text:seonga-gwigam` |
| K Korea | `people/korea.js`, `people-bios-korea-<n>.js`, `lineage-korea.js`, `timeline-korea.js`, `quiz/korea.js`, `schools-korea.js` | full bios: doui, jinul, taego, seosan, gyeongheo · new: muyeom, beomil, hyesim, naong, muhak, hamheo, samyeong, mangong, hanam, seongcheol, kusan-suryeon, seung-sahn · quiz `region:korea` |
| V Vietnam | `people/vietnam.js`, `people-bios-vietnam-<n>.js`, `lineage-vietnam.js`, `timeline-vietnam.js`, `glossary-vietnam.js`, `quiz/vietnam.js` | full bios: vinitaruci, vo-ngon-thong, thao-duong, tue-trung, tran-nhan-tong, nguyen-thieu, lieu-quan, nhat-hanh · new: khuong-viet, van-hanh, man-giac, tran-thai-tong, phap-loa, huyen-quang, chan-nguyen, huong-hai, thanh-tu · terms cu-tran-lac-dao (居塵樂道), engaged-buddhism (入世佛教) · quiz `region:vietnam` |
| M1 modern Asia | `people/modern-asia.js`, `people-bios-modern-asia-<n>.js`, `lineage-modern-asia.js`, `timeline-modern-asia.js`, `glossary-modern-asia.js`, `quiz/modern-asia.js`, `schools-modern.js` | dt-suzuki, shunryu-suzuki, sawaki, uchiyama, harada-sogaku, yasutani, yamada-koun, maezumi, xuyun, sheng-yen · term shoshin (初心) · school sanbo-kyodan · quiz `region:west` (label "เซนยุคใหม่") |
| M2 West | `people/modern-west.js`, `people-bios-modern-west-<n>.js`, `lineage-modern-west.js`, `timeline-modern-west.js`, `glossary-modern-west.js`, `quiz/modern-west.js` | aitken, kapleau, jiyu-kennett, loori, joko-beck, glassman, watts, blyth (country 'west') · term jukai (受戒) · quiz `region:west` |

Rules: modern people are public figures — biography facts only, no private life beyond what standard sources state; no living persons as new entries. Existing timeline ids to keep: tl-suzuki, tl-wong, tl-jogye, tl-plum, tl-yampolsky, tl-nhat-hanh-death and the older Korea/Vietnam events.
