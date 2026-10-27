// End-to-end: the real app in Chromium at phone size. Debug builds (?debug) put the current
// checkpoint's answer on its row (data-answer) and mark the right MCQ option (data-right), so the
// tests can solve questions the way a learner would: through the keypad.

import { test, expect, type Page } from 'playwright/test';

async function start(page: Page): Promise<void> {
  await page.goto('/?debug');
  await page.click('[data-go]');
  await expect(page.locator('.home')).toBeVisible();
}

async function openTopic(page: Page, chapter: number, topic: number): Promise<void> {
  await page.click(`[data-ch="${chapter}"]`);
  await page.click(`[data-t="${topic}"]`);
}

/** Type a value on the keypad with the keyboard, then press Check. */
async function typeValue(page: Page, kind: string, value: string): Promise<void> {
  await page.click('[data-entry]');
  await expect(page.locator('.kp')).toBeVisible();
  const cells = kind === 'matrix' ? value.split(';').flatMap((r) => r.split(',')) : [value];
  for (const [i, cell] of cells.entries()) {
    for (const ch of cell.replace(/−/g, '-')) await page.keyboard.press(ch === '-' ? 'Minus' : ch === '/' ? 'Slash' : ch === '.' ? 'Period' : ch);
    if (kind === 'matrix' && i < cells.length - 1) await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Enter');
}

/** Answer the current checkpoint correctly. */
async function answerRight(page: Page): Promise<void> {
  const row = page.locator('li.cp.now');
  const kind = (await row.getAttribute('data-kind'))!;
  const ans = (await row.getAttribute('data-answer'))!;
  if (kind === 'choice') await row.locator(`[data-choice="${ans}"]`).click();
  else await typeValue(page, kind, ans);
}

/** Solve the whole current question correctly. */
async function solveClean(page: Page): Promise<void> {
  while (await page.locator('li.cp.now').count()) await answerRight(page);
  await expect(page.locator('.summary')).toBeVisible();
}

test('first run, contents, and a topic from Learn to worked examples', async ({ page }) => {
  await start(page);
  await expect(page.locator('.toc')).toHaveCount(9);
  await openTopic(page, 2, 2); // Matrices · addition and subtraction
  await expect(page.locator('.topic h1')).toHaveText('Addition and subtraction');
  await page.click('[data-stage="learn"]');
  for (let i = 0; i < 3; i++) await page.click('.learn-foot >> text=Next');
  await page.click('.learn-foot >> text=Done: on to worked examples');
  await expect(page.locator('.stage').first()).toHaveClass(/done/);
  await page.click('[data-stage="examples"]');
  await page.click('[data-e="0"]');
  for (;;) {
    const show = page.locator('.sheet-foot >> text=/^Show step/');
    if (!(await show.count())) break;
    await show.click();
  }
  await page.click('.sheet-foot >> text=Got it');
  await expect(page.locator('.ex').first().locator('.st.done')).toBeVisible();
});

test('a wrong checkpoint opens the sheet, then work carries on', async ({ page }) => {
  await start(page);
  await openTopic(page, 3, 0); // Determinants · 2 × 2
  await page.click('[data-stage="paper"]');
  // First checkpoint: enter something wrong.
  const row = page.locator('li.cp.now');
  const kind = (await row.getAttribute('data-kind'))!;
  const ans = (await row.getAttribute('data-answer'))!;
  if (kind === 'choice') {
    const other = row.locator('[data-choice]').filter({ hasNotText: ans }).first();
    await other.click();
  } else {
    await typeValue(page, kind, String(Number(ans.replace('−', '-')) + 1));
  }
  await expect(page.locator('.sheet')).toBeVisible();
  await expect(page.locator('.chip.said')).toBeVisible();
  await page.click('.sheet-foot >> text=Got it, carry on');
  await expect(page.locator('li.cp.done.fixed')).toHaveCount(1);
  await solveClean(page);
  await expect(page.locator('.summary h2')).toHaveText('Solved with help');
  // The slip is in the mistake bank.
  await page.click('.bar [data-back]');
  await page.click('.bar [data-back]');
  await page.click('.bar [data-back]');
  await expect(page.locator('[data-rev="mistakes"]')).toContainText('1 to revise');
});

test('mastery: two clean Basics, three clean Exams, then the Tough set opens', async ({ page }) => {
  await start(page);
  await openTopic(page, 2, 0); // What a matrix is
  await page.click('[data-stage="paper"]');
  for (let i = 0; i < 5; i++) {
    await solveClean(page);
    if (i < 4) await page.click('.summary >> text=Next question');
  }
  await expect(page.locator('.mastered')).toBeVisible();
  await page.click('.bar [data-back]');
  await expect(page.locator('.tough-box')).not.toHaveClass(/locked/);
  await page.click('[data-tough]');
  await expect(page.locator('.lvl.tough').first()).toBeVisible();
});

test('quick check and short answers on a theory topic', async ({ page }) => {
  await start(page);
  await openTopic(page, 1, 0);
  await page.click('[data-stage="check"]');
  for (let i = 0; i < 5; i++) {
    await page.click('.opt[data-right]');
    await page.click('.mcq-after .btn');
  }
  await expect(page.locator('.score-n')).toContainText('5');
  await page.click('text=Done');
  await page.click('[data-stage="paper"]');
  await page.click('[data-s="0"]');
  await page.click('text=Show the model answer');
  for (const box of await page.locator('.pt input').all()) await box.check();
  await page.click('text=Save');
  await expect(page.locator('.ex').first().locator('.st.done')).toBeVisible();
});

test('progress survives a reload', async ({ page }) => {
  await start(page);
  await openTopic(page, 2, 2);
  await page.click('[data-stage="learn"]');
  for (let i = 0; i < 3; i++) await page.click('.learn-foot >> text=Next');
  await page.click('.learn-foot >> text=Done: on to worked examples');
  await page.reload();
  await expect(page.locator('.home')).toBeVisible();
  await expect(page.locator('.continue')).toContainText('Addition and subtraction');
  await page.click('.continue');
  await expect(page.locator('.stage').first()).toHaveClass(/done/);
});
