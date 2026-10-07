import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { alignSubtitles, wordTiming } from '../src/lib/audioAlignment.ts';
import {
  findTextRanges,
  tokenizeText,
  rubySegments,
} from '../src/lib/textTokens.ts';
import { LESSONS, validateLessons } from '../src/content/training/index.ts';
import {
  initialTrainingData,
  isTrainingData,
  nextLesson,
  normalizeAnswer,
  reviewResult,
  saveResult,
  saveWord,
  scoreReading,
} from '../src/study/trainingState.ts';

const initial = () => structuredClone(initialTrainingData);
const english = LESSONS.find((lesson) => lesson.id === 'en-my-major');
const japanese = LESSONS.find((lesson) => lesson.id === 'ja-first-intro');
const now = '2026-10-07T02:00:00.000Z';
const correctAnswers = Object.fromEntries(
  english.questions.map((question) => [question.id, question.answer]),
);
const result = (id, answers = correctAnswers) => ({
  id,
  lessonId: english.id,
  lang: 'en',
  skill: 'reading',
  completedAt: now,
  durationMs: 60000,
  answers,
  correct: scoreReading(english, answers),
  total: english.questions.length,
});

test('内容必须完整，引用、语言和答案依据合法', () => {
  assert.equal(LESSONS.length, 12);
  assert.doesNotThrow(() => validateLessons(LESSONS));
  const bad = structuredClone(english);
  bad.questions[0].evidence = 99;
  assert.throws(() => validateLessons([bad]), /依据缺失/);
  assert.throws(() => validateLessons([english, english]), /ID 不合法/);
  assert.throws(
    () => validateLessons([{ ...english, lang: 'ja' }]),
    /ID 不合法/,
  );
});
test('填空忽略大小写、空格和结尾标点，错误答案仍判错', () => {
  assert.equal(normalizeAnswer('  FIVE.  '), 'five');
  assert.equal(
    scoreReading(english, { ...correctAnswers, next: '  FIVE. ' }),
    english.questions.length,
  );
  assert.equal(
    scoreReading(english, { ...correctAnswers, next: 'six' }),
    english.questions.length - 1,
  );
});
test('错题进入复习，重做保留每次结果且不重复加入同题', () => {
  const wrong = { ...correctAnswers, next: 'six' };
  let data = saveResult(initial(), result('attempt-1', wrong));
  data = saveResult(data, result('attempt-2', wrong));
  assert.equal(data.results.length, 2);
  assert.equal(data.reviews.length, 1);
  assert.equal(data.reviews[0].contentId, 'next');
  assert.equal(data.results[1].correct, english.questions.length - 1);
});
test('同一个词重复收藏不产生重复复习，英日保存独立', () => {
  let data = saveWord(initial(), english, english.words[0], now);
  data = saveWord(data, english, english.words[0], now);
  data = saveWord(data, japanese, japanese.words[0], now);
  assert.equal(data.savedWords.length, 2);
  assert.equal(data.reviews.length, 2);
  assert.deepEqual(
    data.savedWords.map((word) => word.lang),
    ['en', 'ja'],
  );
});
test('记住后依次安排一天和两天，忘记后十分钟再练', () => {
  let data = saveWord(initial(), english, english.words[0], now);
  const id = data.reviews[0].id;
  data = reviewResult(data, id, true, new Date(now));
  assert.equal(data.reviews[0].dueAt, '2026-10-08T02:00:00.000Z');
  data = reviewResult(data, id, true, new Date('2026-10-08T02:00:00Z'));
  assert.equal(data.reviews[0].dueAt, '2026-10-10T02:00:00.000Z');
  data = reviewResult(data, id, false, new Date(now));
  assert.equal(data.reviews[0].dueAt, '2026-10-07T02:10:00.000Z');
});
test('课程按阅读与口语完成推进，切换语言不会混用位置', () => {
  let data = saveResult(initial(), result('reading'));
  assert.equal(nextLesson(data).id, english.id);
  data = saveResult(data, {
    id: 'speaking',
    lessonId: english.id,
    lang: 'en',
    skill: 'speaking',
    taskId: english.speaking[1].id,
    recordingId: 'audio-1',
    assessment: 'ready',
    completedAt: now,
    durationMs: 30000,
  });
  assert.equal(nextLesson(data).id, english.id);
  data = saveResult(data, {
    id: 'shadow',
    lessonId: english.id,
    lang: 'en',
    skill: 'speaking',
    taskId: english.speaking[0].id,
    recordingId: 'audio-2',
    assessment: 'ready',
    completedAt: now,
    durationMs: 10000,
  });
  assert.equal(nextLesson(data).id, 'en-study-day');
  assert.equal(nextLesson({ ...data, language: 'ja' }).id, japanese.id);
});
test('导入拒绝串语言、伪造得分、重复结果、负时长和错误预算类型', () => {
  const valid = saveResult(initial(), result('reading'));
  assert.equal(isTrainingData(valid), true);
  assert.equal(isTrainingData({ ...valid, dailyMinutes: '30' }), false);
  for (const changes of [
    { lang: 'ja' },
    { correct: 99 },
    { durationMs: -1 },
    { durationMs: Infinity },
  ]) {
    const bad = structuredClone(valid);
    Object.assign(bad.results[0], changes);
    assert.equal(isTrainingData(bad), false);
  }
  assert.equal(
    isTrainingData({ ...valid, results: [...valid.results, ...valid.results] }),
    false,
  );
  const bad = structuredClone(valid);
  bad.lastLesson.ja = english.id;
  assert.equal(isTrainingData(bad), false);
});

test('新单元的朗读文本和扩展假名全部有预生成音频', () => {
  const audio = JSON.parse(
    fs.readFileSync(
      new URL('../src/lib/audio.generated.json', import.meta.url),
      'utf8',
    ),
  );
  const kana = JSON.parse(
    fs.readFileSync(
      new URL('../src/content/training/data/kana.json', import.meta.url),
      'utf8',
    ),
  );
  const texts = LESSONS.flatMap((lesson) =>
    [
      ...lesson.paragraphs.map((p) => p.text),
      ...lesson.words.map((w) => w.term),
      ...lesson.speaking.map((task) => task.sample),
      lesson.pattern.example,
    ].map((text) => `${lesson.lang}:${text}`),
  );
  texts.push(
    ...kana.flatMap((group) => group.cells.map((cell) => `ja:${cell.kana[0]}`)),
  );
  assert.deepEqual(
    [...new Set(texts)].filter((text) => !audio[text]),
    [],
  );
});

test('字幕保留真实秒数，支持零起点、重复词、大小写与标点', () => {
  const words = alignSubtitles('Go, go! I’m ready.', [
    {
      words: [
        { word: 'go,', endTime: 0.3 },
        { word: 'GO!', startTime: 0.5, endTime: 0.8 },
        { word: "I'm", startTime: 1, endTime: 1.4 },
        { word: 'ready.', startTime: 1.5, endTime: 2 },
      ],
    },
  ]);
  assert.deepEqual(words, [
    [0, 2, 0, 0.3],
    [4, 6, 0.5, 0.8],
    [8, 11, 1, 1.4],
    [12, 17, 1.5, 2],
  ]);
  assert.deepEqual(wordTiming(words, 4, 6), { start: 0.5, end: 0.8 });
});

test('句级或不完整字幕不能伪装成词级定位，非法时间被忽略', () => {
  assert.equal(wordTiming([[0, 12, 0, 2]], 0, 5), undefined);
  assert.equal(wordTiming([[0, 3, 0, 1]], 0, 5), undefined);
  assert.equal(wordTiming([], 0, 5), undefined);
  assert.deepEqual(
    alignSubtitles('hello', [
      {
        words: [
          { word: 'hello', startTime: -1, endTime: 2 },
          { word: 'hello', startTime: 1, endTime: 0.5 },
          { word: 'hello', startTime: Infinity, endTime: 2 },
        ],
      },
    ]),
    [],
  );
});

test('分词保留原文与日语词汇边界，划线不会命中单词内部', () => {
  const en = tokenizeText("I'm planning long-term care.", 'en');
  assert.equal(
    en.map((token) => token.text).join(''),
    "I'm planning long-term care.",
  );
  assert.ok(en.some((token) => token.text === 'long-term' && token.isWord));
  const ja = tokenizeText('私は大学生です。日本語の本です。', 'ja', [
    '私',
    '大学生',
    '日本語',
    '本',
  ]);
  assert.ok(ja.some((token) => token.text === '大学生'));
  assert.ok(
    tokenizeText('おはようございます。', 'ja').some(
      (token) => token.text === 'ございます',
    ),
  );
  assert.equal(findTextRanges('日本語の本です。', '本', 'ja').length, 1);
  assert.equal(findTextRanges('subjects, subject.', 'subject', 'en').length, 1);
  assert.equal(
    rubySegments('私は大学生[だいがくせい]です。')
      .map((part) => part.text)
      .join(''),
    '私は大学生です。',
  );
});

test('61 段训练文本的时间轴绑定当前 CDN；所有词边界均可定位', () => {
  const urls = JSON.parse(
    fs.readFileSync(
      new URL('../src/lib/audio.generated.json', import.meta.url),
      'utf8',
    ),
  );
  const timings = JSON.parse(
    fs.readFileSync(
      new URL('../src/lib/audio.timings.json', import.meta.url),
      'utf8',
    ),
  );
  const keys = new Set();
  for (const lesson of LESSONS) {
    for (const text of [
      ...lesson.paragraphs.map((p) => p.text),
      ...lesson.speaking.map((t) => t.sample),
      lesson.pattern.example,
    ]) {
      const key = `${lesson.lang}:${text}`;
      keys.add(key);
      const entry = timings[key];
      assert.equal(entry.url, urls[key], key);
      assert.ok(entry.duration > 0 && entry.words.length > 0, key);
      let cursor = 0;
      for (const [from, to, start, end] of entry.words) {
        assert.ok(from >= cursor && to > from && to <= text.length, key);
        assert.ok(
          start >= 0 && end > start && end <= entry.duration + 0.05,
          key,
        );
        cursor = to;
      }
      const terms = [
        ...lesson.words.map((word) => word.term),
        ...(lesson.lang === 'ja'
          ? entry.words
              .map(([from, to]) => text.slice(from, to))
              .filter((term) => term.length > 1)
          : []),
      ];
      for (const token of tokenizeText(text, lesson.lang, terms).filter(
        (token) => token.isWord,
      )) {
        assert.ok(
          wordTiming(entry.words, token.from, token.to),
          `${key} / ${token.text}`,
        );
      }
    }
  }
  assert.equal(keys.size, 61);
  assert.ok(Object.values(urls).every((url) => url.startsWith('https://')));
});

test('运行时配音模块没有生成请求或系统朗读兜底', () => {
  const source = fs.readFileSync(
    new URL('../src/lib/speech.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(
    source,
    /\bfetch\s*\(|generate_avg_text_to_speech_audio|\bSpeechSynthesisUtterance\b|window\.speechSynthesis/,
  );
});
