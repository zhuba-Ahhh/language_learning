import assert from 'node:assert/strict';
import { LESSONS } from '../src/content/training/index.ts';
import { GRAMMAR } from '../src/content/training/grammar.ts';
import { todayPlan } from '../src/study/trainingPlan.ts';
import {
  initialTrainingData,
  isTrainingData,
  lessonCompleted,
  lessonMastered,
  lessonsForTarget,
  saveResult,
  saveDrillResult,
  reviewResult,
} from '../src/study/trainingState.ts';

const now = '2026-10-08T04:00:00.000Z';
const time = Date.parse(now);
const initial = () => structuredClone(initialTrainingData);
const english = LESSONS[0];

for (const lesson of LESSONS) {
  const note = GRAMMAR[lesson.id];
  assert.equal(
    note.chunks.map((chunk) => chunk.text).join(''),
    lesson.pattern.example,
  );
  assert.equal(note.questions.length, 2);
  assert.equal(new Set(note.questions.map((question) => question.id)).size, 2);
  for (const question of note.questions) {
    assert.ok(
      question.kind === 'choice'
        ? question.options.includes(question.answer)
        : lesson.pattern.example.includes(question.answer),
    );
  }
  let data = saveDrillResult(initial(), {
    id: `grammar-${lesson.id}`,
    lessonId: lesson.id,
    lang: lesson.lang,
    kind: 'grammar',
    completedAt: now,
    durationMs: 1000,
    assisted: false,
    answers: Object.fromEntries(note.questions.map((q) => [q.id, q.answer])),
  });
  assert.equal(data.drillResults[0].correct, 2);
  assert.equal(isTrainingData(data), true);
  data = saveDrillResult(data, {
    id: `listening-${lesson.id}`,
    lessonId: lesson.id,
    lang: lesson.lang,
    kind: 'listening',
    completedAt: now,
    durationMs: 1000,
    assisted: true,
    answers: { sentence: lesson.pattern.example },
  });
  assert.equal(data.drillResults[0].correct, 1);
  assert.equal(data.reviews[0].kind, 'listening');
  assert.equal(isTrainingData(data), true);
  const bad = structuredClone(data);
  bad.drillResults[0].correct = 99;
  assert.equal(isTrainingData(bad), false);
  bad.drillResults[0].correct = 1;
  bad.drillResults[0].questionSnapshot = [null];
  assert.equal(isTrainingData(bad), false);
}

const plans = [15, 30, 45].map((dailyMinutes) =>
  todayPlan({ ...initial(), dailyMinutes }, time),
);
assert.ok(plans[0].tasks.length < plans[1].tasks.length);
for (const [index, plan] of plans.entries()) {
  assert.ok(plan.minutes <= [15, 30, 45][index]);
  assert.equal(
    plan.minutes,
    plan.tasks.reduce((sum, task) => sum + task.minutes, 0),
  );
}
const tech = {
  ...initial(),
  targets: { en: '技术阅读与面试', ja: '日本生活交流' },
};
assert.ok(
  lessonsForTarget(tech).every((lesson) =>
    ['foundation', 'tech'].includes(lesson.track),
  ),
);
assert.ok(
  lessonsForTarget({ ...tech, language: 'ja' }).every((lesson) =>
    ['foundation', 'life'].includes(lesson.track),
  ),
);
assert.equal(
  todayPlan({ ...initial(), language: 'ja' }, time).tasks[0].kind,
  'kana',
);

let data = saveResult(initial(), {
  id: 'reading',
  lessonId: english.id,
  lang: 'en',
  skill: 'reading',
  completedAt: now,
  durationMs: 1000,
  correct: 6,
  total: 7,
  answers: Object.fromEntries(
    english.questions.map((q, index) => [q.id, index ? q.answer : 'wrong']),
  ),
});
for (const task of english.speaking.filter((task) => !task.optional)) {
  data = saveResult(data, {
    id: task.id,
    lessonId: english.id,
    lang: 'en',
    skill: 'speaking',
    completedAt: now,
    durationMs: 1000,
    recordingId: `audio-${task.id}`,
    taskId: task.id,
    assessment: 'ready',
    selfChecks: ['pause', 'message'],
  });
}
assert.equal(lessonCompleted(data, english), true);
assert.equal(lessonMastered(data, english), true);
assert.equal(todayPlan(data, time).lesson.id, english.id);
assert.equal(
  todayPlan(data, time).tasks.find((task) => task.kind === 'reading').done,
  true,
);
assert.equal(todayPlan(data, time + 86400000).lesson.id, 'en-study-day');
const old = structuredClone(data);
old.results.find((result) => result.skill === 'reading').contentVersion = 1;
assert.equal(lessonCompleted(old, english), true);
assert.equal(lessonMastered(old, english), false);
const again = saveResult(data, {
  ...data.results[0],
  id: 'again',
  assessment: 'again',
  completedAt: '2026-10-08T04:00:01.000Z',
});
assert.equal(lessonMastered(again, english), false);
assert.equal(isTrainingData(again), true);
const bad = structuredClone(data);
bad.results[0].selfChecks = ['automatic-score'];
assert.equal(isTrainingData(bad), false);

const wrong = saveDrillResult(initial(), {
  id: 'wrong',
  lessonId: english.id,
  lang: 'en',
  kind: 'grammar',
  completedAt: now,
  durationMs: 1000,
  answers: {},
  assisted: false,
});
assert.equal(wrong.reviews.length, 2);
assert.equal(isTrainingData(wrong), true);
const reviewed = reviewResult(wrong, wrong.reviews[0].id, true, new Date(now));
assert.equal(reviewed.reviews[0].lastReviewedAt, now);
assert.equal(isTrainingData(reviewed), true);
assert.equal(isTrainingData(initial()), true);
console.log(
  'P0 workflow passed: 12 grammar units, budget/target routing, 80% mastery, local drill records and review, legacy compatibility.',
);
