// Content container. Every other file in src/data only pushes plain data into these arrays.
// See src/data/README.md for the schema. No logic here.
window.ZEN_DATA = {
  meta: {
    app: 'Zen Study Companion',
    phase: 6,
    updated: '2026-09-28',
    // Content planned for later phases (shown as "coming" in lists)
    upcoming: [],
  },
  sources: [],
  schools: [],
  people: [],
  lineage: { root: 'shakyamuni', nodes: [], links: [] },
  timeline: [],
  texts: [],
  chapters: [], // chapters of long texts kept in their own files ({ text: '<textId>', … }), merged into texts[].chapters at load
  collections: [],
  koans: [],
  practice: [],
  oxherding: [],
  glossary: [],
  theravada: [],
  quiz: [],
  bios: {}, // extra full profiles by person id, merged into people at load (see people-bios.js)
  svg: {}, // filled by build.mjs from src/svg/**
  gen: { pinyin: {} }, // filled by build.mjs (pinyin generated with pinyin-pro)
};
