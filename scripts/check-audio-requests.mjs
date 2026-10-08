import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  japaneseSpeech,
  mapJapaneseTimings,
  completeJapaneseTimings,
} from './japanese-speech.mjs';

const hash = (file) =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = ['src/lib/audio.generated.json', 'src/lib/audio.timings.json'];
const before = files.map(hash);
const receipts = fs.readdirSync('docs/audio/receipts');
const denyNetwork = `data:text/javascript,${encodeURIComponent('globalThis.fetch = () => { throw new Error("Unexpected network request"); };')}`;
const preview = (...args) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--import',
        denyNetwork,
        'scripts/generate-audio-cdn.mjs',
        '--dry-run',
        ...args,
      ],
      { encoding: 'utf8' },
    ),
  );
const walk = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
const words = walk('src/content/words/data/ja')
  .filter((file) => file.endsWith('.json'))
  .flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')).words);
words.push(
  ...JSON.parse(
    fs.readFileSync('src/content/training/data/ja.json', 'utf8'),
  ).flatMap((lesson) => lesson.words),
);
const expected = new Map(
  words
    .filter((word) => /^\p{Script=Han}+$/u.test(word.term))
    .map((word) => [`ja:${word.term}`, word.reading]),
);
const all = preview();
const pronunciation = JSON.parse(
  fs.readFileSync('scripts/japanese-speech.json', 'utf8'),
);
assert.equal(Object.keys(pronunciation).length, 156);
assert.equal(
  all.normalized.length,
  expected.size + Object.keys(pronunciation).length,
);
assert.deepEqual(
  preview('--regenerate-readings').pending.sort(),
  [...expected.keys()].sort(),
);
for (const item of all.normalized) {
  assert.equal(item.key, `ja:${item.text}`);
  assert.equal(
    item.speechText,
    expected.get(item.key) ??
      japaneseSpeech(item.text, pronunciation[item.text]).speechText,
  );
  assert.match(
    item.speechText,
    /^[\p{Script=Hiragana}\p{Script=Katakana}ー\p{P}\p{Zs}]+$/u,
  );
}
const word = preview('--key=ja:仕様', '--limit=1');
assert.deepEqual(word.pending, ['ja:仕様']);
assert.equal(word.request.items[0].text, 'しよう');
const term = '仕様';
let idHash = 0;
for (const character of term)
  idHash = Math.imul(idHash, 31) + character.codePointAt(0);
assert.equal(
  word.request.items[0].item_id,
  `linguadesk-ja-${(idHash >>> 0).toString(36)}`,
);
assert.equal(word.request.common_request.audio_config.enable_subtitle, true);
for (const key of [
  'ja:おはようございます。',
  'en:I chose computer science because I like building useful things.',
]) {
  const result = preview(`--key=${key}`, '--limit=1');
  assert.equal(result.request.items[0].text, key.slice(3));
}
const sentence = preview('--key=ja:私は大学生です。', '--limit=1');
assert.equal(sentence.request.items[0].text, 'わたしはだいがくせいです。');
assert.equal(sentence.request.common_request.explicit_language, undefined);
const intro = japaneseSpeech(
  '私は大学生です。',
  pronunciation['私は大学生です。'],
);
const kanaWords = [...intro.speechText].map((_, i) => [
  i,
  i + 1,
  i / 10,
  (i + 1) / 10,
]);
assert.equal(
  completeJapaneseTimings(
    '私は大学生です。',
    mapJapaneseTimings(intro.units, kanaWords),
  ),
  true,
);
assert.equal(
  completeJapaneseTimings(
    '私は大学生です。',
    mapJapaneseTimings(
      intro.units,
      kanaWords.filter(([from]) => from !== 6),
    ),
  ),
  false,
);
assert.deepEqual(
  mapJapaneseTimings(intro.units, kanaWords).find(
    ([from, to]) => from === 2 && to === 5,
  ),
  [2, 5, 0.4, 1],
);
// 部分读音缺字、只有整句字幕时，不伪造“大学生”的词级时间。
assert.ok(
  !mapJapaneseTimings(
    intro.units,
    kanaWords.filter(([from]) => from !== 6),
  ).some(([from, to]) => from === 2 && to === 5),
);
assert.deepEqual(
  mapJapaneseTimings(intro.units, [[0, intro.speechText.length, 0, 2]]),
  [[0, 8, 0, 2]],
);
assert.throws(() => japaneseSpeech('大学生', '大学生'), /invalid/);
assert.throws(() => japaneseSpeech('私', '大学生[だいがくせい]'), /invalid/);
assert.equal(
  japaneseSpeech(
    'Web開発が得意で、Reactをよく使っています。',
    pronunciation['Web開発が得意で、Reactをよく使っています。'],
  ).speechText,
  'ウェブかいはつがとくいで、リアクトをよくつかっています。',
);
assert.deepEqual(files.map(hash), before);
assert.deepEqual(fs.readdirSync('docs/audio/receipts'), receipts);

// 模拟生成仅写临时副本；保留副本便于失败时检查，不触碰项目资产。
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'lingua-audio-check-'));
for (const file of [
  'src/content/words/data',
  'src/content/training/data',
  'src/content/speaking.ts',
  'src/content/reading.ts',
  'src/content/kana.ts',
  'src/lib/audioAlignment.ts',
  'scripts/japanese-speech.json',
  ...files,
]) {
  const target = path.join(fixture, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(file, target, { recursive: true });
}
const mock = `data:text/javascript,${encodeURIComponent(`
  import assert from 'node:assert/strict';
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://douyin-game-ai.bytedance.net/webcast/game/role_agents/generate_avg_text_to_speech_audio');
    const request = JSON.parse(options.body);
    assert.equal(request.items.length, 1);
    const text = request.items[0].text;
    assert.ok(['しよう', 'わたしはだいがくせいです。'].includes(text));
    return {ok: true, json: async () => ({base_resp: {status_code: 0}, items: [{
      item_id: request.items[0].item_id, text, status_code: 0,
      audio_url: 'https://test.invalid/voice.mp3', duration: text.length / 10,
      subtitle_json: JSON.stringify([{words: [...text].map((word, i) => ({word, startTime: i / 10, endTime: (i + 1) / 10}))}]),
    }]})};
  };
`)}`;
const runFixture = (...args) =>
  execFileSync(
    process.execPath,
    ['--import', mock, path.resolve('scripts/generate-audio-cdn.mjs'), ...args],
    { cwd: fixture, encoding: 'utf8' },
  );
runFixture('--key=ja:仕様', '--limit=1');
const output = JSON.parse(
  fs.readFileSync(path.join(fixture, files[0]), 'utf8'),
);
const timingFile = path.join(fixture, files[1]);
const timings = JSON.parse(fs.readFileSync(timingFile, 'utf8'));
assert.equal(output['ja:仕様'], 'https://test.invalid/voice.mp3');
assert.equal(timings['ja:仕様'], undefined);
const receiptFiles = fs.readdirSync(path.join(fixture, 'docs/audio/receipts'));
assert.equal(receiptFiles.length, 1);
const receipt = JSON.parse(
  fs.readFileSync(
    path.join(fixture, 'docs/audio/receipts', receiptFiles[0]),
    'utf8',
  ),
);
assert.deepEqual(receipt.keys, ['ja:仕様']);
assert.equal(receipt.spoken_texts['ja:仕様'], 'しよう');
timings['ja:仕様'] = {
  url: output['ja:仕様'],
  duration: 1,
  words: [[0, 2, 0, 1]],
};
fs.writeFileSync(timingFile, JSON.stringify(timings));
runFixture('--refresh-timings', '--limit=0');
assert.equal(
  JSON.parse(fs.readFileSync(timingFile, 'utf8'))['ja:仕様'],
  undefined,
);
runFixture('--key=ja:私は大学生です。', '--limit=1');
const sentenceTimings = JSON.parse(fs.readFileSync(timingFile, 'utf8'))[
  'ja:私は大学生です。'
];
assert.deepEqual(
  sentenceTimings.words.find(([from, to]) => from === 2 && to === 5),
  [2, 5, 0.4, 1],
);
runFixture('--refresh-timings', '--limit=0');
assert.deepEqual(
  JSON.parse(fs.readFileSync(timingFile, 'utf8'))['ja:私は大学生です。'],
  sentenceTimings,
);
assert.ok(
  !JSON.parse(
    execFileSync(
      process.execPath,
      [
        path.resolve('scripts/generate-audio-cdn.mjs'),
        '--dry-run',
        '--regenerate-japanese',
      ],
      { cwd: fixture, encoding: 'utf8' },
    ),
  ).pending.includes('ja:私は大学生です。'),
);
const fixtureBeforeFailure = files.map((file) =>
  hash(path.join(fixture, file)),
);
const incompleteMock = `data:text/javascript,${encodeURIComponent(`
  globalThis.fetch = async (_, options) => {
    const item = JSON.parse(options.body).items[0];
    return {ok: true, json: async () => ({base_resp: {status_code: 0}, items: [{
      item_id: item.item_id, status_code: 0, audio_url: 'https://test.invalid/incomplete.mp3', duration: 1,
      subtitle_json: JSON.stringify([{words: [{word: item.text[0], startTime: 0, endTime: 1}]}]),
    }]})};
  };
`)}`;
const runIncomplete = (mockModule) =>
  execFileSync(
    process.execPath,
    [
      '--import',
      mockModule,
      path.resolve('scripts/generate-audio-cdn.mjs'),
      '--key=ja:これは本です。',
    ],
    { cwd: fixture, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
assert.throws(
  () => runIncomplete(incompleteMock),
  (error) => error.stderr.toString().includes('Incomplete Japanese subtitles'),
);
assert.deepEqual(
  files.map((file) => hash(path.join(fixture, file))),
  fixtureBeforeFailure,
);
assert.throws(
  () => runIncomplete(denyNetwork),
  (error) =>
    error.stderr.toString().includes('Previous matching result not published'),
);
assert.deepEqual(files.map(hash), before);
assert.deepEqual(fs.readdirSync('docs/audio/receipts'), receipts);
console.log(
  `Audio request check passed: ${expected.size} words and 156 Japanese texts, stable keys/IDs, unchanged English, read-only preview, mock replacement, mapped phonetic timings and safe resumption. Fixture: ${fixture}`,
);
