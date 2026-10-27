// Content checks for the whole course (spec §10). Fails the build on any problem.
//   node scripts/check-content.ts [--seeds N]
import { CHAPTERS } from '../src/content/index.ts';
import { checkCourse } from '../src/content/check.ts';

const i = process.argv.indexOf('--seeds');
const seeds = i > 0 ? Number(process.argv[i + 1]) : 2000;
const t0 = performance.now();
const problems = checkCourse(CHAPTERS, seeds);
const topics = CHAPTERS.flatMap((c) => c.topics);
const qs = topics.reduce((n, t) => n + t.examples.length + t.paper.length, 0);
const mcqs = topics.reduce((n, t) => n + t.mcqs.length, 0);
console.log(`${CHAPTERS.length} chapters · ${topics.length} topics · ${qs} questions · ${mcqs} MCQs · ${seeds} seeds/level (${((performance.now() - t0) / 1000).toFixed(1)} s)`);
if (problems.length) {
  for (const p of problems.slice(0, 40)) console.log(`✗ ${p.where}: ${p.issue}`);
  console.log(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log('content OK');
