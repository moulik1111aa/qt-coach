// The course registry: chapters in order, and lookups by id.

import type { Chapter, Generator, Mcq, PaperQuestion, Topic } from './types.ts';
import { ch02 } from './ch02/index.ts';
import { ch03 } from './ch03/index.ts';

export const CHAPTERS: Chapter[] = [ch02, ch03];

const topics = new Map<string, Topic>();
const gens = new Map<string, Generator>();
const questions = new Map<string, PaperQuestion>();
const mcqs = new Map<string, Mcq>();
for (const ch of CHAPTERS) {
  for (const t of ch.topics) {
    topics.set(t.id, t);
    for (const g of t.gens) gens.set(g.id, g);
    for (const q of [...t.examples, ...t.paper]) questions.set(q.id, q);
    for (const m of t.mcqs) mcqs.set(m.id, m);
  }
}

export const topicById = (id: string): Topic | undefined => topics.get(id);
export const genById = (id: string): Generator | undefined => gens.get(id);
export const questionById = (id: string): PaperQuestion | undefined => questions.get(id);
export const mcqById = (id: string): Mcq | undefined => mcqs.get(id);
export const chapterOf = (t: Topic): Chapter => CHAPTERS.find((c) => c.topics.includes(t))!;
export const allTopics = (): Topic[] => CHAPTERS.flatMap((c) => c.topics);
