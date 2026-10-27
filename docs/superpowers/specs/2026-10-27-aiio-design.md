# Aiio — Design Spec

*Status: written for review · 2026-10-27*

**Aiio** is an Android app that teaches the book *Quantitative Techniques for Managers* to an adult beginner: someone who knows basic maths and is comfortable with commerce, preparing for the UPES MBA end-term exam. The app teaches every part of the book step by step, has the learner solve questions on paper, and checks the work stage by stage.

## 1. Intent

**What the user asked for:**
- An app that teaches this subject to a **beginner who knows basic maths and is well aware of commerce**.
- It explains the content **without skipping anything**, and **sticks to the book's content**.
- Every question is solved **step by step with illustrated examples**, using MN's "Let's learn how" sheet as the reference.
- The app **teaches first**. It doesn't rely on wrong answers to teach.
- The learner **solves questions on paper**, and the app **checks them**.
- Work goes **chapter by chapter**: about **half the book in Build 1** and the rest in Build 2.
- We write **our own exam-level questions** with **difficulty levels**, including **tough questions**.
- The exam is the **UPES (Dehradun) MBA** paper: **online proctored MCQs plus subjective questions**.
- Paper work is checked by **step checkpoints** (no photo marking).
- Practice questions are a **mix** of generated and hand-written.
- It's a **separate app in its own repository**. The MN (Studre) repository is **not changed**.

**Assumed from the conversation:**
- The app is **APK-only on Android**, built on the **same toolchain as MN**.
- It works **fully offline**, with no accounts and no servers.
- **One learner per phone.**
- The app uses an **adult, professional tone**: no mascot and no rewards. Progress is shown as mastery and test scores.
- **Book errors** are taught correctly, with a short **Book note** wherever the printed book differs (see §11).

**Success looks like:**
- A learner who has finished Build 1 can do every numerical type in Units 1–6 and 8–10 on paper, in the book's method, at UPES exam standard.
- Every worked answer in the app has been **computed by code**, never typed by hand.
- Every book example the app reproduces has been **re-checked by code**, and any differences are shown as Book notes.

## 2. Scope

### 2.1 Build 1 (this spec)

| # | Book unit | Topics |
|---|---|---|
| 1 | Quantitative Techniques — An Introduction | Meaning and importance of QT · Classification: mathematical, statistical, programming · Role of QT in business and industry |
| 2 | Matrix and its Operation | What a matrix is, and its order (m × n) · Types of matrices (a)–(l) and the transpose · Addition and subtraction · Scalar multiplication · Matrix multiplication (conformability, row × column) |
| 3 | Determinants | 2 × 2 determinant and solving a pair of equations (Cramer's rule) · 3 × 3 expansion, minors and cofactors · The 8 properties of determinants · Higher-order determinants via properties · Management applications: machine mix (ONGC example), brand switching (matrix × vector) |
| 4 | Functions | Variable, constant, parameter · Types: linear, absolute value, step, quadratic, polynomial · Evaluating a function, intercepts, slope · Graph of a function (bicycle and ball-height examples) |
| 5 | Equations | Linear equations and their root · Quadratic equations and roots (formula, discriminant) |
| 6 | Progression | Sequence and series · AP: nth term and sum · GP: nth term, sum, sum to infinity · HP · AM, GM, HM and their relationship |
| 8 | Data and Graphical Representation | Bar graphs (vertical and horizontal) · Pie charts · Line graphs |
| 9 | Measures of Central Tendency | Primary and secondary data, collection methods, questionnaire design, pre-testing, editing, precautions with secondary data, census vs sample · Qualitative and quantitative data, discrete and continuous · Frequency distribution: number of classes, class width, tally, cumulative frequency · Mean, median and mode for ungrouped and grouped data |
| 10 | Measures of Dispersion | Mean deviation · Variance · Standard deviation · Coefficient of variation · Comparing two series, and combined mean |

### 2.2 Build 2 (later, with its own spec addendum)

Unit 7 Forecasting · 11 Introduction to OR · 12 Linear programming (graphical) · 13 Transportation · 14 Decision theory · 15 Game theory · 16 Simulation.

The engine in Build 1 must already support what Build 2 needs: graphs with shaded regions, and payoff and transportation grids. Build 2 then adds content, not machinery.

## 3. How a chapter teaches

### 3.1 Topics and stages

Each chapter is split into **topics** (the list in §2.1). Each topic runs through four stages, in order:

1. **Learn.** Short cards that carry the book's content in plain language:
   - Each card has one idea, one formula or one definition.
   - Every term is explained the first time it appears.
   - A commerce example is added where it helps (for example, a sales price list as a matrix).
   - Definitions and formulas keep the book's wording and notation, so the learner recognises them in the exam.
   - If the topic needs a skill the book assumes but never teaches, a **"Before you start" primer** comes first (§4.3).
2. **Worked examples.** Every example is a "Let's learn how" sheet (§5), revealed one step at a time:
   - First the **book's own example(s)**, kept as printed.
   - Then **at least 3 extra worked examples at rising difficulty**: one Basic, one Exam and one Tough. Each one teaches something new (a different setting, a sign trap, an edge case), not just new numbers.
   - Before each step, the sheet says: *"Try this step on paper, then tap to check."*
   - A **Book note** appears wherever the book's printed working or answer is wrong.
   - Topics with no example in the book still get the 3 extra examples.
3. **Solve on paper.** Practice questions climbing from **Basic** to **Exam** level:
   - The learner works on paper and types the **checkpoint values** as they go (§5.2).
   - A wrong value opens the sheet for that step, with the note for that mistake.
4. **Quick check.** 5 MCQs mixing concept and numerical questions. The wrong options are built from the typical mistakes (§4.2). Passing needs **4 out of 5**.

**Theory-only topics** (most of Unit 1, data collection in Unit 9, the graph types in Unit 8) replace stage 3 with **short-answer practice**:
- The learner writes the answer on paper.
- The app then shows a **model answer** with its key points.
- The learner ticks which points they covered. The app counts it as done when they covered at least 70% of the points.

### 3.2 Difficulty

Every question carries one of three levels:

| Level | What it looks like |
|---|---|
| **Basic** | One method, clean numbers. For example, a 2 × 2 determinant, or the mean of 6 values. |
| **Exam** | UPES paper standard. Full working, realistic numbers, a commerce setting. |
| **Tough** | Multi-step, or combining topics, or an edge case an examiner likes to set. |

Examples of Tough questions in Build 1:
- A singular coefficient matrix, where Cramer's rule fails and the learner has to say why.
- A product AB that exists while BA doesn't.
- Using properties of determinants to evaluate a 4 × 4 without expanding it.
- A quadratic with no real roots.
- An AP or GP with the unknowns hidden in a word problem.
- A grouped median where the median class is the first class (F = 0).
- A grouped mode where the modal class is the first or last class.
- A combined mean and combined SD of two firms.
- A CV comparison where the series with the higher SD turns out to be *less* variable.

**Rules:**
- Solve on paper climbs from Basic to Exam.
- **Mastery:** a topic is mastered after **3 Exam-level paper questions in a row** are solved correctly, with no step revealed. A wrong checkpoint or a revealed step resets the streak.
- **The Tough set** is a separate challenge in each topic, unlocked once the topic is mastered. It has at least 3 questions per topic, each with a full sheet. Finishing it earns the topic a **Tough ✓** badge.
- **Chapter tests and the mock exam** are mostly Exam level, with 1–2 Tough questions.
- **Every question shows its level as a tag.** Practice can be filtered by level.

### 3.3 At the end of each chapter

- **Formula sheet:** every formula in the chapter, with its symbols explained, when to use it, and a one-line example.
- **Chapter test:**
  - 15 MCQs, with a timer of 1.5 minutes per question.
  - 2 subjective questions, checked by checkpoints, with no timer.
  - It ends with a score and a list of **weak topics**, with links to revisit them.

### 3.4 Across the build

- **Mock exam** in the UPES style, covering every chapter in Build 1:
  - 30 MCQs in 45 minutes.
  - 3 subjective questions with checkpoints.
  - The counts and timings live in one config file, so they can match the real paper once its pattern is known.
- **Mistake bank:** every checkpoint or MCQ the learner gets wrong is saved with its topic and the mistake made.
  - Revising it brings back a **fresh generated version** of the same question (or the same hand-written question, if it has no generator).
  - An item leaves the bank after it is solved correctly **twice, on different days**.

## 4. Content

### 4.1 Faithfulness to the book

- Learn cards follow the book's order and coverage. **Nothing the book teaches is left out**, including the theory lists such as the questionnaire design rules and the OR-style application lists.
- The app keeps the **book's method**, even where another method is quicker. For example, variance uses n − 1, exactly as the book does (§11).
- Where the book's explanation is unclear or garbled, the card says the same thing correctly in plain language and keeps the book's terms.
- Each card records its **book page**, so the learner can cross-check with the printed book.

### 4.2 Question types

| Type | Source | Used in |
|---|---|---|
| **Paper numerical with checkpoints** | Generated (most numerical topics) and hand-written (book examples, book discussion questions, Exam and Tough sets) | Solve on paper, Tough set, chapter test, mock exam |
| **Numerical MCQ** | Generated: the answer comes from the same generator, and the wrong options come from its slips | Quick check, tests |
| **Concept MCQ** | Hand-written | Quick check, tests |
| **Short answer** | Hand-written, with a model answer and key points | Theory topics, tests |

**Book discussion questions** ("Questions for Discussion") are all included as hand-written paper questions, with full solutions in the book's method. The book gives no answers for these, so every solution is computed and checked by code (§10).

**Minimum content per topic:**
- The book's example(s), plus 3 extra worked examples (Basic, Exam, Tough).
- 10 concept MCQs (theory topics: 15).
- 3 hand-written Exam-level paper questions.
- 3 Tough questions.
- 1 generator (numerical topics), covering Basic to Exam.

### 4.3 "Before you start" primers

Short lessons, each with its own quick practice, for skills the book uses without teaching:
- **Solving a simple linear equation** (Units 3, 5).
- **Plotting points and drawing a straight line** (Units 4, 8).
- **Powers, square roots and the order of operations** (Units 5, 6, 10).
- **Σ notation and working with columns in a table** (Units 9, 10).
- **Percentages, fractions of a whole and angles for a pie chart** (Unit 8).
- **Rounding and significant figures** (every unit). This primer also explains the app's rounding rule (§6).

### 4.4 Slips: the typical mistakes

Each generator and hand-written question lists **slips**: likely wrong answers, each with a one-line note that names the mistake.

Examples:

| Topic | Wrong answer | Note |
|---|---|---|
| 2 × 2 determinant | ad + bc | "The cross term is subtracted: ad − bc." |
| 3 × 3 expansion | sign of the middle term not flipped | "Signs alternate + − + along the first row." |
| Matrix multiplication | element-by-element product | "Multiply row by column, then add." |
| Grouped median | used the class mid-point as L | "L is the lower limit of the median class." |
| Grouped median | F taken as the CF *of* the median class | "F is the CF of the class before it." |
| Mode (grouped) | D2 taken as the following class's frequency | "D2 = f(modal) − f(next class)." |
| Variance | divided by n | "The book divides by n − 1." |
| GP sum to infinity | used when \|r\| ≥ 1 | "S∞ exists only when −1 < r < 1." |

Slips power three things:
- the checkpoint notes;
- the MCQ wrong options;
- the mistake bank's labels.

## 5. The "Let's learn how" sheet and checkpoints

### 5.1 The sheet (adapted from MN)

The parts, top to bottom:
- **Title:** "Let's learn how", followed by the question.
- **Chips:** "You said **x**" and "Answer **y**". These are shown only when the sheet opens from a wrong checkpoint.
- **Note:** the matching slip's note, when there is one.
- **Board:** a picture that builds up as the steps go (§7).
- **Steps:** each has one short sentence, a line of working underneath, and an optional "after" line. The last step states the answer in green.
- **Buttons:** **Got it** and **Try a similar one**. The second generates a fresh question of the same kind.
- **Read aloud:** optional, using text-to-speech.

The same sheet is used three ways:
- **Worked example:** shown before practice, one step at a time.
- **Checkpoint help:** shown up to the checkpoint that was missed.
- **Full solution:** shown after a test.

### 5.2 Checkpoints

A paper question holds an ordered list of checkpoints. Each one has:
- a label, such as "D", "Dx", "x", "Median class", "L", "Σfx" or "Mean";
- the answer and its **rounding rule**;
- the answer form: number, fraction, matrix, interval or choice;
- its slips;
- the lesson step it belongs to.

**The flow:**
1. The question appears with **"Solve on paper"**. A first checkpoint field is ready.
2. The learner enters a value.
   - **Correct:** a tick, and the next checkpoint appears.
   - **Wrong:** the sheet opens at that step, with "You said / Answer", the slip note and the board. After **Got it**, the correct value is filled in and the learner carries on from there.
3. **Show this step** is always available. It reveals the step without the learner entering anything, but it counts as a revealed step for mastery.
4. After the last checkpoint, a summary shows each checkpoint as ✓ / ✗ / revealed. **Full solution** opens the whole sheet.

**Checkpoint choice rules:**
- Checkpoints are placed where examiners give step marks. That means formula values (L, F, f, c), intermediate totals (Σf, Σfx), and the final answer.
- There are no more than 6 checkpoints per question, so entering values never becomes a chore.

## 6. Answer entry and grading

**Keypads:**
- A number pad with decimal point, minus, fraction bar and backspace.
- A **grid** for matrices: its size comes from the checkpoint, and each cell is a number.
- **Choice buttons** for MCQs and for choice checkpoints, such as "Which class is the median class?"

**Rounding:**
- Every numerical checkpoint states its rounding, for example "to 2 decimals".
- A value is correct when the learner's entry, rounded to the stated places, equals the answer. An entry with fewer decimals than stated is also accepted when it is exact.
- **Intermediate checkpoints** accept a wider tolerance than the final answer: ±1 in the last stated place. That way, rounding earlier in a long working isn't marked wrong.
- Fractions and decimals are interchangeable unless the question asks for a particular form.

**Calculator:** the learner uses their own calculator with paper, as in the exam. The app has no built-in calculator.

## 7. Boards (pictures in the sheet)

These are reused from MN:
- **Table:** for frequency tables, cumulative frequency, fx columns, deviation tables, AP terms and the like.
- **Bars:** for proportions.

These are new for this app:
- **Matrix:** brackets, with cells that can be highlighted. It shows the row and column used for a product cell, and a pair of matrices with corresponding cells linked.
- **Determinant:** vertical bars, with the cross-multiplication diagonals for 2 × 2, and a first-row expansion that greys out the deleted row and column to show the minor. It also marks the sign pattern + − +.
- **Graph:** axes with a scale, plotted points, lines and curves (linear, quadratic, absolute value, step), intercepts and a slope triangle. Build 2 adds shaded regions to the same board.
- **Chart:** a bar chart, pie chart (with angle labels) and line graph, drawn from a table, for Unit 8.
- **Formula:** a formula with its symbols filled in one by one as the steps go. For example, Median = L + [(N/2 − F)/f] × c becomes 335.15 + [(10 − 8)/5] × 4.9.

All boards are SVG and step-timed, the same way MN's boards are (`at`, `until`, `hl`).

**Maths display:** a small renderer with no dependencies. It handles stacked fractions, roots, powers and subscripts, Σ with limits, |x|, matrices with brackets, determinants with bars, and ≥ ≤ ≠ ±.

## 8. Screens

- **Home:**
  - a "Continue where you left off" card;
  - the Build 1 chapters, each with progress (topics mastered, for example 4/6) and a Tough count;
  - entry points to **Revision** and the **Mock exam**.
- **Chapter:**
  - a list of topics, each showing its stage (Learn → Worked example → Paper → Check) and its badges;
  - the chapter test;
  - the formula sheet.
- **Topic:** the four stages in order, plus the Tough set once the topic is mastered. Each stage can be reopened at any time.
- **Practice:** a question, the checkpoint entry and the sheet. It has a level filter (Basic / Exam / Tough).
- **Revision:** formula sheets for every chapter, and the mistake bank grouped by topic.
- **Test / Mock:** a timer, MCQs, then the subjective questions. The result screen shows the score, a breakdown by topic and links to weak topics.
- **Settings:** light / dark / system theme, text size, read aloud on or off, and reset progress (with confirmation).
- **First run:**
  - a one-screen introduction (what the app does, and paper and calculator ready);
  - an optional "Where are you starting?" choice: start from Chapter 1, or jump to a chapter.

**Look:** clean and professional. A calm neutral palette with one accent colour, generous spacing and large maths. Motion is quiet: the step reveals and board builds stay, and the game effects are dropped.

## 9. Architecture

**Toolchain:** the same as MN, in a **new, separate repository** with its own app id (`com.aiio.app`) and signing key. The repository is `moulik1111aa/qt-coach`.
- TypeScript, with no runtime dependencies, bundled by a project script into a single HTML file.
- Wrapped with **Capacitor 8**.
- GitHub Actions builds, signs and publishes the APK as a GitHub Release.

**Copied from MN** (copied and adapted, not shared, with Studre unchanged):
- the bundler, dev server and Android project scripts;
- the native plugin: back button, save mirror, text-to-speech, keep screen on;
- the APK workflow;
- the lesson sheet and the step-timed board approach;
- the versioned save with primary and backup keys.

```
src/
  core/
    rng.ts            seeded random numbers
    num.ts            exact arithmetic helpers (fractions, rounding rules)
    grade.ts          checkpoint and MCQ grading
    progress.ts       topic stages, mastery streaks, Tough badges, mistake bank
    tests.ts          chapter test and mock exam assembly
    config.ts         exam counts and timings
  teach/
    types.ts          Lesson, Step, Slip, Board (MN's model plus the new boards)
    boards/*.ts       matrix, determinant, graph, chart, formula, table, bars
  content/
    ch01-intro/ … ch10-dispersion/
      cards.ts        Learn cards (with book page refs)
      examples.ts     worked examples (book's own, plus "Extra example")
      questions.ts    hand-written paper, MCQ and short-answer questions
      gen/*.ts        generators: (rng, level) → question + checkpoints + lesson + slips
      formulas.ts     formula sheet
      booknotes.ts    book error notes for the chapter
    primers/          "Before you start" lessons
  ui/                 screens (§8), sheet, keypads, math renderer
  storage/            versioned save + native mirror
  platform/           native bridge, speech
scripts/              build, serve, android, content checks
test/  e2e/           unit tests, content checks, browser tests
native/android/       MainActivity + plugin, resources
```

**Saving:**
- One learner: topic stages, mastery streaks, Tough progress, quick-check scores, test history, the mistake bank and settings.
- The save is versioned, with a primary and a backup copy, and mirrored natively.
- Questions themselves aren't saved: generated questions are stored as (generator id, seed, level).

**Errors:**
- A damaged save loads the backup copy.
- If a generator throws, the app moves to the next seed and logs the error.
- If text-to-speech is unavailable, read-aloud is hidden.

## 10. Testing

**Generators**, run across 2,000 seeds per level:
- every checkpoint value equals a **separate reference calculation**;
- the numbers are "exam-clean" for the level (Basic gives whole-number or 1-decimal answers);
- no slip equals the correct answer, and MCQ options are distinct;
- the last lesson step states the final answer, and no text contains `undefined` or `NaN`;
- board timings fit the steps.

**Hand-written content:**
- every numerical answer and checkpoint is **recomputed by code** from the question's data, and the build fails on a mismatch;
- every topic meets the minimum counts in §4.2;
- every book example the app reproduces is recomputed, and each difference must have a Book note.

**Core logic:** grading and rounding, mastery streaks, unlocks, test assembly, and mistake bank entry and exit.

**Browser tests (Playwright):**
- first run;
- a topic from Learn through to Quick check;
- a wrong checkpoint opening the sheet;
- mastery;
- unlocking the Tough set;
- a chapter test;
- the mistake bank;
- save and reload.

**Emulator smoke test** on every release: launch, open a topic, answer a checkpoint, back button.

**Visual review:** screenshots of every board type and screen, at phone size, in both themes, before each milestone.

## 11. Book notes (Build 1)

Each one is shown as a Book note next to the content it concerns. The list below is what's known now. Content authoring adds to it, because every book number is recomputed by code (§10).

| Unit | Where | Printed | Correct |
|---|---|---|---|
| 1 | Classification: Correlation and Regression | Text is a copy of "Collection of Data" | Explain correlation and regression in a sentence each |
| 2 | Types of matrices (h), (i) | Upper and lower triangular both say "elements above the diagonal are zero" | Upper: zeros *below* the diagonal; lower: zeros *above* |
| 2 | Matrix multiplication, general form | Second row printed cw + cy, dx + dz | cw + dy, cx + dz |
| 2 | Matrix multiplication, numeric example | Top-right entry 3 × 9 + 5 × 7 = **52**; the sign between the matrices is printed as "−" | 27 + 35 = **62**; the matrices are multiplied |
| 2 | Row × column example | (4 3) × (3 2)ᵀ = (4 × 3   3 × 2) = (18) | (4 × 3 **+** 3 × 2) = (12 + 6) = (18) |
| 2 | Transpose example | A printed as (a b c / r e a), but A′ = (a f / b e / c d) | A = (a b c / f e d), so A′ = (a f / b e / c d) |
| 5 | Linear equation y = a + bx | "a should not be equal to zero" | b ≠ 0, since the root is x = −a/b |
| 5 | Discussion Q2: 4x² + 5x + 47 | No guidance | b² − 4ac < 0, so there are no real roots. The app teaches this case |
| 6 | Example 9.2 (bouncing ball) | First rebound a = 100/3; working gives 100 + 2(100) | a = 200/3, so S = 100 + 2 × (200/3)/(1/3) = 100 + 400 = **500 m** (the printed final answer is right) |
| 9 | Table 16.2 | Column "F" repeats f | F is the cumulative frequency: 1, 3, 8, 13, 19, 20 |
| 9 | Grouped mean | 337.6 × 5 = 1668; Σfx = 6712.4; mean = 335.62 | 337.6 × 5 = **1688**; Σfx = **6732.4**; mean = **336.62** |
| 9 | Grouped mode formula | "Mode = 1 + …" | Mode = **L** + [D1/(D1 + D2)] × c |
| 10 | Variance | Divides by n − 1 (the sample variance) | Kept as printed (the app follows the book). A note says that some papers divide by n, and every question states which divisor to use |

## 12. Delivery

1. **Milestone 1: the engine, plus Chapters 1–3.**
   - The engine: app shell, Learn cards, the sheet, paper checkpoints, MCQs, mastery, the save, the maths renderer, and the table, matrix, determinant and formula boards.
   - Content: Unit 1 (theory), Unit 2 Matrices, Unit 3 Determinants, with the primers they need.
   - The first APK, for the learner to try and give feedback on.
2. **Milestone 2: Chapters 4–6.** The graph board, plus Functions, Equations and Progression.
3. **Milestone 3: Chapters 8–10, and the build-wide features.**
   - The chart board, plus Data and Graphs, Central Tendency and Dispersion.
   - Chapter tests, formula sheets, the mistake bank and the mock exam across Build 1.
4. **Build 2** follows with its own spec addendum.

**What the user needs to do before Milestone 1 can be pushed:**
- The repository `moulik1111aa/qt-coach` exists.
- Give the Claude GitHub app access to it, so this session can push.
- Add the `AIIO_SIGNING_PASSWORD` repository secret for the new release key (I'll provide its value).

## 13. Out of scope (for now)

- Photo marking of handwritten work.
- Accounts, cloud sync, multiple learners, ads and in-app purchases.
- Languages other than English.
- Topics that aren't in the book (for example, the matrix inverse, correlation calculations or index numbers). The exception is the primers in §4.3.
