import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {
  japaneseSpeech,
  mapJapaneseTimings,
  completeJapaneseTimings,
} from './japanese-speech.mjs';

const ENDPOINT =
  'https://douyin-game-ai.bytedance.net/webcast/game/role_agents/generate_avg_text_to_speech_audio';
const SPEAKER = 'S_olwRWVfN1';
const OUTPUT = 'src/lib/audio.generated.json';
const TIMING_OUTPUT = 'src/lib/audio.timings.json';
const BATCH_SIZE = 10;
const pronunciation = JSON.parse(
  fs.readFileSync('scripts/japanese-speech.json', 'utf8'),
);

function walk(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
}

async function loadDataModule(file) {
  const source = fs.readFileSync(file, 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const encoded = Buffer.from(javascript).toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

function itemId(lang, text) {
  let hash = 0;
  for (const character of text) {
    hash = Math.imul(hash, 31) + character.codePointAt(0);
  }
  return `linguadesk-${lang}-${(hash >>> 0).toString(36)}`;
}

function save(urls) {
  const sorted = Object.fromEntries(
    Object.entries(urls).sort(([left], [right]) => left.localeCompare(right)),
  );
  fs.writeFileSync(OUTPUT, `${JSON.stringify(sorted, null, 2)}\n`);
}

function saveTimings(timings) {
  fs.writeFileSync(TIMING_OUTPUT, `${JSON.stringify(timings, null, 2)}\n`);
}

async function collectTexts(urls) {
  const texts = new Map();
  const readings = new Map();
  const add = (lang, text, audioUrl, aligned = false) => {
    const key = `${lang}:${text}`;
    texts.set(key, {
      key,
      lang,
      text,
      aligned: aligned || texts.get(key)?.aligned,
    });
    if (audioUrl) urls[key] = audioUrl;
  };

  const wordFiles = walk('src/content/words/data').filter((file) =>
    file.endsWith('.json'),
  );
  for (const file of wordFiles) {
    const deck = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const word of deck.words) {
      if (deck.lang === 'ja') readings.set(word.term, word.reading);
      add(deck.lang, word.term, word.audioUrl);
      add(deck.lang, word.example);
    }
  }

  const { SCENARIOS } = await loadDataModule('src/content/speaking.ts');
  for (const scenario of SCENARIOS) {
    for (const sentence of scenario.sentences) {
      add(scenario.lang, sentence.text);
    }
  }

  const { READING_GROUPS } = await loadDataModule('src/content/reading.ts');
  for (const group of READING_GROUPS) {
    for (const resource of group.resources) {
      for (const paragraph of resource.paragraphs) {
        add(group.lang, paragraph);
      }
    }
  }

  const { ALL_KANA } = await loadDataModule('src/content/kana.ts');
  for (const cell of ALL_KANA) add('ja', cell.kana[0]);

  for (const language of ['en', 'ja']) {
    const lessons = JSON.parse(
      fs.readFileSync(`src/content/training/data/${language}.json`, 'utf8'),
    );
    for (const lesson of lessons) {
      for (const paragraph of lesson.paragraphs)
        add(language, paragraph.text, undefined, true);
      for (const word of lesson.words) {
        if (language === 'ja') readings.set(word.term, word.reading);
        add(language, word.term);
        if (word.example) add(language, word.example);
      }
      for (const task of lesson.speaking)
        add(language, task.sample, undefined, true);
      add(language, lesson.pattern.example, undefined, true);
    }
  }
  const kanaGroups = JSON.parse(
    fs.readFileSync('src/content/training/data/kana.json', 'utf8'),
  );
  for (const group of kanaGroups)
    for (const cell of group.cells) add('ja', cell.kana[0]);

  return [...texts.values()].map((entry) => {
    let speechText = entry.text;
    let speechRuby;
    // ponytail: BAM 1.0.171 的 AVG 入口没有语种字段；统一使用已维护的日语读音。
    if (
      entry.lang === 'ja' &&
      !entry.aligned &&
      /^\p{Script=Han}+$/u.test(entry.text)
    ) {
      const reading = readings.get(entry.text)?.trim();
      if (
        !reading ||
        !/^[\p{Script=Hiragana}\p{Script=Katakana}ー\s]+$/u.test(reading)
      )
        throw new Error(`Missing or invalid Japanese reading: ${entry.key}`);
      speechText = reading;
    } else if (
      entry.lang === 'ja' &&
      /[\p{Script=Han}\p{Script=Latin}\p{N}○]/u.test(entry.text)
    ) {
      speechRuby = pronunciation[entry.text];
      if (!speechRuby)
        throw new Error(`Missing Japanese pronunciation: ${entry.key}`);
      speechText = japaneseSpeech(entry.text, speechRuby).speechText;
    }
    return { ...entry, speechText, speechRuby };
  });
}

function buildRequest(batch) {
  return {
    items: batch.map(({ lang, text, speechText }) => ({
      item_id: itemId(lang, text),
      text: speechText,
    })),
    common_request: {
      speaker: SPEAKER,
      audio_config: {
        format: 'mp3',
        sample_rate: 24000,
        speech_rate: 0,
        pitch: 0,
        enable_subtitle: true,
      },
    },
  };
}

async function generate(batch) {
  const receipt = `docs/audio/receipts/${new Date().toISOString().replaceAll(':', '-')}.json`;
  fs.mkdirSync(path.dirname(receipt), { recursive: true });
  const requestRecord = {
    speaker: SPEAKER,
    keys: batch.map(({ key }) => key),
    spoken_texts: Object.fromEntries(
      batch.map(({ key, speechText }) => [key, speechText]),
    ),
    spoken_ruby: Object.fromEntries(
      batch
        .filter(({ speechRuby }) => speechRuby)
        .map(({ key, speechRuby }) => [key, speechRuby]),
    ),
    status: 'submitted',
  };
  fs.writeFileSync(receipt, `${JSON.stringify(requestRecord, null, 2)}\n`);
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      origin: 'https://pcg-demo.gf.bytedance.net',
      referer: 'https://pcg-demo.gf.bytedance.net/',
      'x-tt-env': 'ppe_voice',
      'x-use-ppe': '1',
    },
    body: JSON.stringify(buildRequest(batch)),
  });

  if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);
  const result = await response.json();
  fs.writeFileSync(
    receipt,
    `${JSON.stringify({ ...requestRecord, status: 'received', result }, null, 2)}\n`,
  );
  if (result.base_resp?.status_code !== 0) {
    throw new Error(result.base_resp?.status_message || 'TTS request failed');
  }

  const byId = new Map(result.items?.map((item) => [item.item_id, item]));
  return batch.map(({ key, lang, text, speechText, speechRuby }) => {
    const item = byId.get(itemId(lang, text));
    if (item?.status_code !== 0 || !item.audio_url) {
      throw new Error(item?.status_text || `Missing audio URL for ${key}`);
    }
    if (
      speechRuby &&
      !completeJapaneseTimings(
        text,
        makeTimings(key, item, speechText, speechRuby)?.words ?? [],
      )
    )
      throw new Error(
        `Incomplete Japanese subtitles; CDN not published. Inspect receipt before retrying: ${key}`,
      );
    return [key, item, speechText, speechRuby];
  });
}

function makeTimings(key, item, speechText, speechRuby) {
  const currentRuby = pronunciation[key.slice(3)];
  if (
    speechRuby &&
    currentRuby &&
    japaneseSpeech(key.slice(3), currentRuby).speechText === speechText
  )
    speechRuby = currentRuby;
  if (!item.subtitle_json || (speechText !== key.slice(3) && !speechRuby))
    return undefined;
  const words = alignSubtitles(speechText, JSON.parse(item.subtitle_json));
  return {
    url: item.audio_url,
    duration: item.duration,
    words: speechRuby
      ? mapJapaneseTimings(
          japaneseSpeech(key.slice(3), speechRuby).units,
          words,
        )
      : words,
  };
}

const limitArgument = process.argv.find((argument) =>
  argument.startsWith('--limit='),
);
const limit = limitArgument
  ? Number.parseInt(limitArgument.slice('--limit='.length), 10)
  : Number.POSITIVE_INFINITY;
const urls = fs.existsSync(OUTPUT)
  ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8'))
  : {};
const timings = JSON.parse(fs.readFileSync(TIMING_OUTPUT, 'utf8'));
const { alignSubtitles } = await loadDataModule('src/lib/audioAlignment.ts');
const receipts = (
  fs.existsSync('docs/audio/receipts') ? walk('docs/audio/receipts') : []
)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({ file, ...JSON.parse(fs.readFileSync(file, 'utf8')) }));
if (process.argv.includes('--refresh-timings')) {
  for (const receipt of receipts) {
    for (const item of receipt.result?.items ?? []) {
      const key = receipt.keys.find(
        (key) => itemId(key.slice(0, 2), key.slice(3)) === item.item_id,
      );
      if (!key || item.audio_url !== urls[key]) continue;
      const timing = makeTimings(
        key,
        item,
        receipt.spoken_texts?.[key] ?? key.slice(3),
        receipt.spoken_ruby?.[key],
      );
      if (timing) timings[key] = timing;
      else if (
        receipt.spoken_texts?.[key] !== undefined &&
        receipt.spoken_texts[key] !== key.slice(3)
      )
        delete timings[key];
    }
  }
}
for (const [key, entry] of Object.entries(timings)) {
  if (entry.subtitles) {
    entry.words = alignSubtitles(key.slice(3), entry.subtitles);
    delete entry.subtitles;
  }
}
const align = process.argv.includes('--align');
const regenerateReadings = process.argv.includes('--regenerate-readings');
const regenerateJapanese = process.argv.includes('--regenerate-japanese');
const texts = await collectTexts(urls);
const targetKey = process.argv
  .find((argument) => argument.startsWith('--key='))
  ?.slice(6);
if (targetKey && !texts.some(({ key }) => key === targetKey))
  throw new Error('Unknown audio key');
const pending = texts
  .filter(({ key, aligned, text, speechText, speechRuby }) =>
    targetKey
      ? key === targetKey
      : regenerateJapanese
        ? speechRuby &&
          !receipts.some(
            (receipt) =>
              receipt.spoken_ruby?.[key] &&
              receipt.spoken_texts?.[key] === speechText &&
              receipt.result?.items?.some(
                (item) =>
                  item.audio_url === urls[key] &&
                  item.item_id === itemId('ja', text) &&
                  item.status_code === 0,
              ),
          )
        : regenerateReadings
          ? text !== speechText && !speechRuby
          : !urls[key] || (align && aligned && timings[key]?.url !== urls[key]),
  )
  .slice(0, limit);

if (process.argv.includes('--dry-run')) {
  await new Promise((resolve) =>
    process.stdout.write(
      `${JSON.stringify(
        {
          total: texts.length,
          normalized: texts
            .filter(({ text, speechText }) => text !== speechText)
            .map(({ key, text, speechText }) => ({ key, text, speechText })),
          pending: pending.map(({ key }) => key),
          request: buildRequest(pending.slice(0, BATCH_SIZE)),
        },
        null,
        2,
      )}\n`,
      resolve,
    ),
  );
  process.exit(0);
}

for (const receipt of receipts) {
  if (
    receipt.status === 'submitted' &&
    receipt.keys?.some((key) => pending.some((entry) => entry.key === key))
  )
    throw new Error(
      `Previous request outcome unknown; inspect ${receipt.file} before retrying`,
    );
  if (
    receipt.spoken_ruby &&
    pending.some(
      (entry) =>
        receipt.spoken_texts?.[entry.key] === entry.speechText &&
        receipt.result?.items?.some(
          (item) =>
            item.item_id === itemId(entry.lang, entry.text) &&
            item.status_code === 0 &&
            item.audio_url !== urls[entry.key],
        ),
    )
  )
    throw new Error(
      `Previous matching result not published; inspect ${receipt.file} before generating again`,
    );
}

save(urls);
console.log(`Audio URLs: ${Object.keys(urls).length}/${texts.length}`);

for (let index = 0; index < pending.length; index += BATCH_SIZE) {
  const batch = pending.slice(index, index + BATCH_SIZE);
  const generated = await generate(batch);
  for (const [key, item, speechText, speechRuby] of generated) {
    urls[key] = item.audio_url;
    delete timings[key];
    const timing = makeTimings(key, item, speechText, speechRuby);
    if (timing) timings[key] = timing;
  }
  save(urls);
  saveTimings(timings);
  console.log(
    `Generated ${Math.min(index + batch.length, pending.length)}/${pending.length}`,
  );
}

console.log(`Done. Audio URLs: ${Object.keys(urls).length}/${texts.length}`);
saveTimings(timings);
