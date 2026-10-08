import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildVocabulary,
  findVocabulary,
} from '../src/content/vocabularyIndex.ts';
import { LESSONS } from '../src/content/training/index.ts';
import { tokenizeText } from '../src/lib/textTokens.ts';
import {
  initialTrainingData,
  isTrainingData,
  reviewLanguage,
  saveVocabularyWord,
  saveWord,
  reviewResult,
} from '../src/study/trainingState.ts';
import { todayPlan } from '../src/study/trainingPlan.ts';

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
const decks = walk('src/content/words/data')
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
const notes = JSON.parse(
  fs.readFileSync('src/content/vocabulary-notes.json', 'utf8'),
);
const words = buildVocabulary(decks, LESSONS, notes);
assert.equal(new Set(words.map((word) => word.key)).size, words.length);
for (const key of Object.keys(notes))
  assert.ok(
    words.some((word) => word.key === key),
    `Unused note: ${key}`,
  );
const station = findVocabulary(words, '駅', 'ja');
assert.equal(station.reading, 'えき');
assert.equal(station.partOfSpeech, '名词');
assert.ok(station.example);
assert.ok(station.exampleZh);
assert.equal(findVocabulary(words, '修正しました', 'ja').lemma, '修正する');
assert.equal(findVocabulary(words, '起きる', 'ja').term, '起きます');
assert.equal(findVocabulary(words, 'FINISH', 'en').term, 'finish');
assert.equal(findVocabulary(words, '駅', 'en'), undefined);
const text = '大学で勉強しています。';
const tokens = tokenizeText(
  text,
  'ja',
  words
    .filter((word) => word.lang === 'ja')
    .flatMap((word) =>
      [word.term, word.lemma, ...(word.forms ?? [])].filter(Boolean),
    ),
);
assert.equal(tokens.map((token) => token.text).join(''), text);
assert.ok(tokens.some((token) => token.text === '勉強しています'));

const now = '2026-10-08T09:00:00.000Z';
const initial = () => structuredClone(initialTrainingData);
const standalone = findVocabulary(words, '仕様', 'ja');
assert.equal(standalone.lessonId, undefined);
let data = saveVocabularyWord(
  { ...initial(), language: 'ja' },
  standalone,
  now,
);
data = saveVocabularyWord(data, standalone, now);
assert.equal(data.savedWords.length, 1);
assert.equal(data.reviews.length, 1);
assert.equal(data.savedWords[0].lessonId, undefined);
assert.equal(reviewLanguage(data.reviews[0]), 'ja');
assert.equal(isTrainingData(data), true);
assert.equal(todayPlan(data, Date.parse(now)).tasks[0].kind, 'review');
data = reviewResult(data, data.reviews[0].id, true, new Date(now));
assert.equal(isTrainingData(JSON.parse(JSON.stringify(data))), true);
assert.equal(data.reviews[0].dueAt, '2026-10-09T09:00:00.000Z');
for (const mutate of [
  (bad) => {
    bad.reviews[0].lang = 'en';
  },
  (bad) => {
    bad.savedWords[0].key = 'en:仕様';
  },
  (bad) => {
    bad.savedWords[0].forms = [null];
  },
  (bad) => {
    bad.reviews[0].kind = 'question';
  },
  (bad) => {
    bad.savedWords[0].lessonId = 'ja-first-intro';
    bad.reviews[0].lessonId = 'ja-first-intro';
    bad.reviews[0].contentId = bad.savedWords[0].id;
  },
]) {
  const bad = structuredClone(data);
  mutate(bad);
  assert.equal(isTrainingData(bad), false);
}
const first = LESSONS[0];
const legacy = saveWord(initial(), first, first.words[0], now);
assert.equal(isTrainingData(legacy), true);
assert.equal(reviewLanguage(legacy.reviews[0]), 'en');
assert.equal(
  saveVocabularyWord(
    legacy,
    findVocabulary(words, first.words[0].term, 'en'),
    now,
  ).savedWords.length,
  1,
);
for (const id of ['en-project-update', 'ja-room-visit']) {
  const lesson = LESSONS.find((lesson) => lesson.id === id);
  assert.equal(lesson.questions.length, 5);
  assert.equal(lesson.speaking.filter((task) => !task.optional).length, 2);
  assert.equal(lesson.version, 1);
}
console.log(
  `Vocabulary passed: ${words.length} unique entries, cross-source lookup, curated forms, standalone review/backup validation and legacy compatibility.`,
);
