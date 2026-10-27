# Aiio — Milestone 1 Implementation Plan

*Spec: `docs/superpowers/specs/2026-10-27-aiio-design.md` · 2026-10-27*

**Goal:** a working APK with the full teaching engine and Chapters 1–3 (Introduction to QT, Matrices, Determinants), for the learner to try.

**Approach:**
- Take MN's toolchain and its proven pieces, copied into this repo and adapted. Studre is not touched.
- Build the engine first, test it with one small topic, then fill in the content chapter by chapter.
- Every task ends green on `npm run check`: typecheck, unit tests, content checks, build and e2e.

**Conventions (from MN):**
- TypeScript only, with no runtime dependencies, and relative imports with an explicit `.ts`.
- `src/core` and `src/content` stay pure, with no DOM, so they are unit-testable under `node --test`.
- Every number the app shows comes from code. Hand-written questions give their data, and code computes the answers.

---

## Task 1: Scaffold the repository

**Files:**
- `package.json`: name `aiio`; scripts `typecheck`, `test`, `build`, `serve`, `e2e`, `check`, `android`, `icons`, `content`.
- `tsconfig.json`, `.gitignore`, `playwright.config.ts`: copied from MN.
- `capacitor.config.json`: appId `com.aiio.app`, appName `Aiio`.
- `scripts/build.mjs`, `scripts/serve.mjs`: copied from MN, with the font list and title changed.
- `src/index.html`: copied from MN, with a light/dark theme bootstrap.
- `src/main.ts`: boots to a placeholder Home.
- `README.md`: what the app is, and how to run, test and build it.

**Verify:** `npm run build` writes a single `dist/index.html`; `npm run serve` shows the placeholder at phone size.

## Task 2: Exact numbers and grading

**Files:**
- `src/core/rng.ts`: MN's seeded RNG.
- `src/core/num.ts`:
  - exact rationals (`Frac`: add/sub/mul/div, compare, from a decimal string);
  - `roundTo(x, dp)` with half-up rounding, as students do it;
  - display formatting: Indian digit grouping, a trailing-zero policy, and fraction ↔ decimal.
- `src/core/grade.ts`:
  - `gradeNumber(given, answer, rule)`: the learner's entry, rounded to the stated places, must equal the answer; a shorter entry is accepted when it is exact; intermediate checkpoints allow ±1 in the last place;
  - fraction and decimal equivalence;
  - `gradeMatrix` (cell by cell, with the same rule);
  - `gradeChoice`;
  - `matchSlip(given, slips)`.

**Tests (`test/num.test.ts`, `test/grade.test.ts`):**
- rounding edge cases (2.345 → 2.35, −0.5, 0.005);
- fraction equality;
- the intermediate tolerance;
- a slip never matches the correct answer;
- matrix size mismatch is wrong.

## Task 3: The teaching model and content registry

**Files:**
- `src/teach/types.ts`:
  - MN's `Lesson / Step / Slip / Timed`;
  - the new board types `MatrixBoard`, `DetBoard`, `FormulaBoard`, alongside MN's `TableBoard`.
- `src/content/types.ts`:
  - `Chapter`, `Topic` (with `kind: 'numeric' | 'theory'`, book pages and prerequisite primers), `Card` (title, body, optional formula, book page);
  - `Level = 'basic' | 'exam' | 'tough'`;
  - `Checkpoint` (label, answer, form, rule, slips, step index);
  - `PaperQuestion` (prompt, data, level, checkpoints, `lesson()`, source: `book-example | book-discussion | written | generated`);
  - `Mcq` (stem, answer, options, explanation, level);
  - `ShortAnswer` (prompt, model answer, key points);
  - `Generator` (id, topic, `make(rng, level) → PaperQuestion`, `mcq(rng, level) → Mcq`);
  - `BookNote` (where, printed, correct, page).
- `src/content/index.ts`: the registry of chapters, topics, generators and questions.
- `scripts/check-content.ts`, run in `npm test` and CI:
  - per-topic minimum counts (spec §4.2);
  - every hand-written numeric answer is recomputed by code;
  - every lesson ends by stating the answer, with no `undefined` or `NaN`;
  - board timings fit the steps;
  - no slip equals the answer;
  - MCQ options are distinct;
  - generators are run over 2,000 seeds per level.

**Verify:** the checker passes on one tiny sample topic, and fails loudly on a deliberately broken one (both cases covered in a test).

## Task 4: The maths renderer

**Files:**
- `src/ui/math.ts`: a tiny markup that becomes HTML/CSS, with no dependencies. Supported:
  - `a/b` as a stacked fraction (`{…}/{…}` for grouped parts);
  - `^` and `_` for powers and subscripts;
  - `sqrt{}`;
  - `sum_{i=1}^{n}`;
  - `|x|`;
  - `[[a,b],[c,d]]` as a matrix with brackets, and `|[a,b],[c,d]|` as a determinant with bars;
  - `≥ ≤ ≠ ± × − ·`.
- `src/styles/math.css`.

**Tests (`test/math.test.ts`):** each construct's HTML structure, nesting (a fraction inside a determinant), and escaping.

**Visual check:** a debug page `?debug&math` renders every construct. Screenshots go into the Task 12 review.

## Task 5: Boards

**Files (`src/ui/boards/`):**
- `table.ts`: ported from MN's table board (highlights, tones, side notes).
- `matrix.ts`: one or two matrices; highlight a row and a column; cells appear at a step; a linking line between corresponding cells (addition); a result cell built from row × column.
- `det.ts`:
  - 2 × 2 with the two diagonals drawn on;
  - 3 × 3 first-row expansion: the deleted row and column greyed out, the minor shown, and the + − + sign row;
  - row and column operation annotations (for example "R1 → R1 − 7R2") for the properties topic.
- `formula.ts`: a formula whose symbols are replaced by values, one at a time, as the steps go.
- `index.ts`: `boardHtml(board)` and `setBoardStep(el, step)`, the same contract as MN.

**Tests:** structure and step-timing of each board, on fixtures.

## Task 6: Save and progress

**Files:**
- `src/storage/save.ts`: MN's versioned save with primary and backup keys, reduced to one learner. It holds settings (theme, text size, read-aloud), topic progress, the mistake bank and test history.
- `src/core/progress.ts`:
  - topic stage (learn → example → paper → check);
  - the Exam-level streak and mastery (3 in a row with no revealed step);
  - quick check pass (4/5);
  - Tough unlock and the Tough ✓ badge;
  - per-level practice history;
  - "continue where you left off".
- `src/core/mistakes.ts`: add an item with its slip label; clear it after 2 correct answers on different days; regenerate it from (generator, level, new seed).

**Tests:**
- the streak resets on a wrong or revealed step;
- mastery unlocks Tough;
- the mistake bank's day rule, with a fake clock;
- a damaged primary save loads the backup.

## Task 7: Screens

**Files (`src/ui/`):**
- `app.ts`: router and back stack, copied from MN's app shell and simplified.
- `theme.css`: tokens for light and dark, the text-size scale and a single accent colour.
- `home.ts`: the "Continue" card, chapter cards with mastery counts, and Revision (formula sheets only in M1).
- `chapter.ts`, `topic.ts`: topic list, stage pills and badges.
- `learn.ts`: the cards, swiped or tapped through, with the "Before you start" primer link and the book page.
- `sheet.ts`: the "Let's learn how" sheet, ported from MN's `lesson.ts`:
  - "You said / Answer" chips and the slip note;
  - the board, and steps revealed one at a time with "Try this step on paper";
  - **Got it** and **Try a similar one**;
  - optional read-aloud.
- `paper.ts`: question, level tag, "Solve on paper", checkpoint entry (number pad / matrix grid / choice), **Show this step**, the summary and the full solution.
- `keypad.ts`: number pad (digits, `.`, `−`, `/`, backspace, OK) and the matrix grid.
- `mcq.ts`: the quick check, 5 questions, with an explanation after each answer.
- `short.ts`: short-answer flow (write on paper → model answer → tick key points).
- `formulas.ts`: the chapter formula sheet.
- `settings.ts`, `first.ts`.

**Verify:** e2e on the sample topic: learn → example → a wrong checkpoint opens the sheet → mastery → quick check.

## Task 8: Unit 2, Matrices

**Topics:** what a matrix is and its order · types (a)–(l) and the transpose · addition and subtraction · scalar multiplication · multiplication.

**Content:**
- Cards that cover every type, with the book's examples redrawn as proper matrices. Book note: triangular definitions (spec §11).
- **Generators**, with slips:
  - order (m × n);
  - identify the type;
  - transpose;
  - A ± B;
  - kA;
  - AB, including "does AB exist?".
  - Slips for the product: element-wise product, row × row, wrong order of the result.
- **Hand-written questions:**
  - the book's multiplication example, and its row × column example (4 3)(3 2)ᵀ;
  - Exam: a price × quantity bill matrix for 3 shops;
  - Tough: AB ≠ BA with both products existing; finding x, y from A + B = C.
- MCQs (≥10 per topic) and the formula sheet.

## Task 9: Unit 3, Determinants

**Topics:** 2 × 2 and Cramer's rule for 2 unknowns · 3 × 3 expansion, minors and cofactors · properties 1–8 · higher order via properties · applications.

**Content:**
- Cards covering the book's derivation of x = |h b| / |a b|, and every property, each with a 2 × 2 or 3 × 3 illustration.
- **Generators:**
  - 2 × 2 value;
  - Cramer 2 × 2 (checkpoints D, Dx, Dy, x, y);
  - 3 × 3 expansion (checkpoints: the three minors, the cofactor signs, the value);
  - Cramer 3 × 3 (D, Dx, Dy, Dz, x, y, z);
  - "use a property": spot a zero determinant, or take out a common factor.
- **The book's worked examples, recomputed by code:**
  - the property 8 reductions;
  - the ONGC machine mix: denominator 225, Type A = 11. Types B, C and D are solved as "solve it yourself" Exam questions;
  - brand switching: the week 1 and week 2 vectors (25.5, 37.0, 37.5) and (18.325, 29.775, 51.9).
- **Tough:**
  - a singular system (D = 0), with "why Cramer fails";
  - a 4 × 4 by properties;
  - a 3-product machine-capacity word problem.
- MCQs, the formula sheet and Book notes as found.

## Task 10: Unit 1, Introduction, and the primers

**Unit 1 (theory topics):**
- meaning and importance;
- classification, with each technique's one-line meaning (the Correlation and Regression Book note);
- role in business: the product A/B example and the functional areas.
- Each topic gets ≥15 MCQs and 4–6 short-answer questions with model answers.

**Primers:**
- solving a linear equation;
- powers, roots and the order of operations;
- rounding and significant figures (this one also explains the app's rounding rule);
- reading a matrix's rows and columns.

Each primer has its own mini practice.

## Task 11: Android shell, icons and CI

**Native code and scripts:**
- `native/android/java/com/aiio/app/`: `MainActivity` and `AiioPlugin`, cut down from `StudyHardPlugin` to the back button, save mirror, text-to-speech and keep-screen-on. MN's widgets and reminders are dropped.
- `scripts/android.mjs`: adapted from MN (env `AIIO_VERSION_CODE`, the Aiio manifest patches).
- `scripts/icons.mjs` and an Aiio icon: a simple, original monogram.
- A new release keystore, generated here and encrypted as `native/android/aiio-release.jks.gpg`. The password goes to the user privately, for the `AIIO_SIGNING_PASSWORD` secret.

**The workflow `.github/workflows/build-apk.yml`:**
- Copied from MN, with the Aiio names and certificate digest.
- It builds, signs, verifies and publishes `Aiio.apk` as the latest GitHub Release.
- It has an optional emulator smoke job.

**Verify:** the first green CI run, and the APK installs over itself on a second run (same key).

## Task 12: Review and handover

- `npm run check` is fully green.
- E2E covers: first run · topic flow · a wrong checkpoint → sheet → continue · mastery → Tough unlock · short answer · save and reload.
- Screenshots of every screen and board in light and dark, at phone size, checked by eye. Anything off is fixed before release.
- A content audit: every Unit 2–3 book example and discussion question appears in the app, with an answer computed by code.
- Hand the user the APK link, plus a one-page "what to try" note for the learner.

---

## Dependencies

1 → 2 → 3 → (4, 5, 6 in any order) → 7 → (8, 9, 10) → 11 → 12.

Task 11 can start any time after Task 1. It needs push access to `moulik1111aa/qt-coach` and the `AIIO_SIGNING_PASSWORD` secret before CI can publish.

## Risks

- **Push access:** this session can read the repo but not push yet. Until the Claude GitHub app is given access, work is committed locally and previewed here.
- **Book pages that are hard to read:** a few scanned pages (the matrix types, the property 8 examples) are low resolution. Every number taken from them is recomputed, and an unreadable value is flagged to the user rather than guessed.
