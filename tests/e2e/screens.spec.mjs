import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const FILE = pathToFileURL(join(process.cwd(), 'dist/zen-study.html')).href;
const ROUTES = [
  ['home', '#/'], ['lineage', '#/lineage'], ['timeline', '#/lineage/timeline'], ['texts', '#/texts'],
  ['text-platform', '#/texts/platform-sutra'], ['chapter-heart', '#/texts/heart-sutra/c2'], ['chapter-platform', '#/texts/platform-sutra/c1'],
  ['chapter-chuanxin', '#/texts/chuanxin/c2'], ['chapter-linji', '#/texts/linji-lu/c5'], ['text-diamond', '#/texts/diamond-sutra'], ['chapter-lanka', '#/texts/lankavatara/c3'],
  ['koans', '#/koans'], ['collection-mumonkan', '#/koans/mumonkan'], ['collection-hekigan', '#/koans/hekiganroku'], ['koan-bcr-1', '#/koans/hekiganroku/1'], ['koan-mu', '#/koans/mumonkan/1'], ['koan-28', '#/koans/mumonkan/28'], ['person-nanquan', '#/people/nanquan'], ['people', '#/people'], ['person-huineng', '#/people/huineng'],
  ['practice', '#/practice'], ['oxherding', '#/practice/oxherding?n=6'], ['glossary', '#/glossary'], ['term-mu', '#/glossary/mu'],
  ['theravada', '#/theravada/emptiness'], ['quiz', '#/quiz/lineage'], ['search', '#/search?q=%E7%84%A1'], ['progress', '#/progress'], ['notes', '#/notes'],
  // Phase 5
  ['text-shobogenzo', '#/texts/shobogenzo'], ['chapter-genjokoan', '#/texts/shobogenzo/genjokoan'], ['chapter-bussho', '#/texts/shobogenzo/bussho'],
  ['collection-shoyo', '#/koans/shoyoroku'], ['koan-sy-1', '#/koans/shoyoroku/1'], ['koan-sy-18', '#/koans/shoyoroku/18'],
  ['person-dogen', '#/people/dogen'], ['person-hakuin', '#/people/hakuin'], ['quiz-japan', '#/quiz/region:japan'],
  // Phase 6
  ['text-susim', '#/texts/susimgyeol'], ['chapter-susim', '#/texts/susimgyeol/c1'], ['text-gwigam', '#/texts/seonga-gwigam'],
  ['person-jinul', '#/people/jinul'], ['person-nhat-hanh', '#/people/nhat-hanh'], ['person-aitken', '#/people/aitken'], ['quiz-west', '#/quiz/region:west'],
];

test('all main views: no page errors, no external requests, screenshots', async ({ page }, info) => {
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', (r) => { const u = r.url(); if (!/^(file|data|blob|about):/.test(u)) external.push(u); });
  const dir = join('dist/screenshots', info.project.name);
  mkdirSync(dir, { recursive: true });
  await page.goto(FILE + '#/');
  await page.waitForSelector('#main h1');
  for (const [name, hash] of ROUTES) {
    await page.evaluate((h) => { location.hash = h; }, hash);
    await page.waitForTimeout(150);
    await expect(page.locator('#main h1')).toBeVisible();
    await expect(page.locator('#main')).not.toContainText('เกิดข้อผิดพลาดในการแสดงผล');
    if (info.project.name === 'mobile') {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow on ${name}`).toBeLessThanOrEqual(0);
    }
    await page.screenshot({ path: join(dir, `${name}.png`), fullPage: false });
  }
  if (info.project.name === 'mobile') {
    await page.evaluate(() => { location.hash = '#/texts/heart-sutra/c1'; });
    await page.getByRole('tab', { name: /โน้ต/ }).click();
    await expect(page.locator('#notes-pane')).toBeVisible();
    await page.screenshot({ path: join(dir, 'notes-tab.png') });
  } else {
    await page.evaluate(() => { document.documentElement.classList.add('dark'); location.hash = '#/texts/heart-sutra/c2'; });
    await page.waitForTimeout(150);
    await page.screenshot({ path: join(dir, 'chapter-heart-dark.png') });
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
