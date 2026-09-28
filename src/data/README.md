# Data authoring guide (schema)

All content lives in plain JS files under `src/data/`. Each file only pushes object literals, e.g.

```js
ZEN_DATA.people.push({ ... }, { ... });
```

No functions, no logic. `tests/data/*.test.mjs` validate everything below — run `npm test`.

## Rich text ("Block")
Anywhere a field is typed `Block[]`, each item is one of:
- **string** — a Thai paragraph. Inline syntax:
  - `**bold**`
  - `[[type:id]]` or `[[type:id|label]]` — cross-reference link. types:
    `person:<personId>`, `text:<textId>`, `chapter:<textId>/<chapterId>`, `koan:<collection>-<no>`,
    `term:<termId>`, `practice:<topicId>`, `theravada:<topicId>`, `source:<sourceId>` (renders as citation).
    Every reference is checked by tests — the id must exist.
  - a string starting with `## ` is a sub-heading.
- `{ list: [string, ...] }` — bullet list (items support inline syntax)
- `{ note: string }` — highlighted callout
- a **Passage** object (see below) — an original-language quotation

## Passage (original-language text, multi-layer)
```js
{
  id: 'hs-p1',                 // globally unique
  layer: 'source',             // 'source' (default) | 'commentary' (traditional commentary inside the work: 無門曰, 評唱, 垂示…)
  zh: '觀自在菩薩…',            // Classical Chinese exactly as in the source (keep CBETA punctuation)
  ja: '…',                     // for Japanese originals (正法眼藏) instead of zh — Taishō orthography as in SAT (katakana, no
                               // dakuten), collation markers ＊ dropped
  pinyin: '…',                 // optional — generated at build if missing (override only when needed)
  romaji: '…',                 // optional, hand-written. on'yomi chanting reading for sutras/verses, kakikudashi for prose
  romajiKind: 'on' | 'kundoku' | 'wabun',   // wabun = modern reading of Japanese prose (with the voicing the kana omit)
  th: '…',                     // OUR OWN Thai paraphrase (ถอดความ). Never copy a modern translation.
  label: 'โศลกเสินซิ่ว',        // optional small caption
  speaker: 'huineng',          // optional personId
  src: 'T2010:T48n2010_p0376b20', // work id + line id where the passage starts: CBETA ids (T48n2010_p0376b20) for tools/raw,
                               // bare Taishō ids (0023b27) for SAT works cached in tools/raw-private
  verify: 'checked' | 'draft', // 'checked' = copied verbatim from tools/raw(-private)/<work>.json (tests enforce the match)
  notesOmitted: true,          // optional: small inline notes (著語) removed — verified against the raw text with notes stripped
}
```

## Interpretation (มุมตีความ) — always separate, always sourced
`{ by: 'ชื่อผู้ตีความ', sourceId: '<sourceId>', th: 'สรุปแนวคิดด้วยคำของเราเอง' }` — never quote copyrighted text.

## Collections
| key | fields |
|---|---|
| `sources` | `{ id, kind: 'primary'|'digital'|'translation'|'study'|'reference', title, author?, year?, publisher?, note?, license?, url?, edition?: 'SAT' }` — `edition` marks works quoted from SAT instead of CBETA |
| `schools` | `{ id, zh, th, ja?, ko?, vi?, country, founder?: personId, parent?: schoolId, house?: true (one of 5 houses), line?: true (one of the 7), summary }` |
| `people` | `{ id, names: { zh, zhS?, pinyin?, th, thCommon?: [..], ja?, romaji?, ko?, rr?, vi?, sa?, pali?, en? }, dates: { b?, d?, approx?, note? }, country: 'india'|'china'|'japan'|'korea'|'vietnam'|'west', schools: [schoolId], historicity: 'traditional'|'historical'|'disputed', summary: string, bio?: Block[], refs?: [sourceId], patriarch?: { india?: n, china?: n } }` |
| `bios` | `ZEN_DATA.bios[personId] = { bio: Block[], refs: [...] }` — full profiles kept in separate files, merged into the person by id at load |
| `lineage.nodes` | `{ id, parent, kind?: 'group', label?: { th, zh? }, note? }` — person nodes use the person id; group nodes stand for several generations |
| `lineage.links` | `{ from, to, kind: 'studied-with'|'secondary'|'influence', note? }` |
| `timeline` | `{ id, year, yearEnd?, approx?, region: 'india'|'china'|'japan'|'korea'|'vietnam'|'west', th, ref?: 'person:id' | 'text:id' | … }` |
| `chapters` | chapters of a long text kept in separate files: `{ text: '<textId>', id, no, title, summary, passages }` — merged into `texts[].chapters` (sorted by `no`) at load |
| `texts` | `{ id, short, titles: { zh, th, ja?, romaji?, sa?, en? }, sourceId, lang: 'lzh'|'ja', phase, category, about: { history: Block[], author: Block[] }, people: [personId], chapters: [{ id, no, title: { zh?, th }, summary: Block[], passages: Passage[] }], keyPassages: [passageId], furtherReading: [{ sourceId, note? }] }` |
| `collections` | koan collections: `{ id, short, titles, compiler, year, count, layerOrder: [...], layerLabels: {key:{zh,th}}, about: Block[], sourceId }` |
| `koans` | `{ id: '<collection>-<no>', collection, no, title: { zh, th }, people: [personId], layers: { intro?, case, commentary?, verse, commentary2? }: Passage[], summaries?: { commentary?: Block[], commentary2?: Block[] } (Thai summary of a long traditional commentary — editorial), notes?: Block[], interpretations: Interpretation[], related?: [koanId], terms?: [termId] }` |
| `practice` | `{ id, order, title: { th, zh?, ja? }, summary, body: Block[] }` |
| `oxherding` | `{ no, title: { zh, th }, svg: 'ox-01', preface: Passage, verse: Passage, explain: Block[] }` |
| `glossary` | `{ id, zh, zhS?, pinyin, romaji?, ko?, rr?, vi?, th, sa?, pali?, en?, cat, meaning: Block[], related?: [termId] }` |
| `theravada` | `{ id, title: { th, zh?, pali? }, zen: { summary: Block[], refs: ['term:x', 'chapter:y/z'] }, theravada: { pali?: [{ text, th, ref }], summary: Block[], refs: [{ sourceId, loc }] }, same: [string], diff: [string], caution: [string] }` |
| `quiz` | `{ id, scope: 'text:<id>'|'lineage'|'collection:<id>'|'region:japan|korea|vietnam|west', type: 'mcq'|'tf'|'match', q, choices?: [..], answer: index|boolean, pairs?: [[left,right],..], explain, ref: 'person:id' | 'chapter:text/ch' | … }` |

## Copyright rules
- `zh` / `ja` originals: public domain, copied from CBETA (CC BY-NC-SA 4.0 digital edition) → keep `src`.
- Dōgen's Japanese works (T2582, T2580) come from the SAT database, whose terms allow **quotation only** (no redistribution):
  show short key passages inside our own Thai explanation — never whole fascicles. Tests cap each passage at 160 characters
  and each fascicle at 25 % quoted; the raw SAT text stays in the git-ignored `tools/raw-private/`.
- `th`, summaries, bios, quiz, explanations: **our own writing**. Modern translations may be *cited* in `sources` and `furtherReading`, never copied.
- Theravāda Pāli from SuttaCentral Mahāsaṅgīti (Public Domain Mark). Thai translations of the Tipiṭaka are copyrighted → cite volume/section, paraphrase ourselves.
