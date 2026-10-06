import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lookupAllWords } from 'japanese-easy';

const require = createRequire(import.meta.url);
const subtlexWords = require('subtlex-word-frequencies');
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const outputDirectory = path.join(projectRoot, 'data/word-candidates');

const ENGLISH_STOP_WORDS = new Set(
  `a an the and or but if because as until while of at by for with about against
   between into through during before after above below to from up down in out on
   off over under again further then once here there when where why how all any
   both each few more most other some such no nor not only own same so than too
   very can will just should now i you he she it we they me him her us them my
   your his its our their mine yours hers ours theirs this that these those am is
   are was were be been being have has had having do does did doing would could
   might must shall what which who whom whose s t d ll m re ve`
    .split(/\s+/)
    .filter(Boolean),
);
const ENGLISH_CONTRACTION_FRAGMENTS = new Set([
  'aren',
  'couldn',
  'didn',
  'doesn',
  'don',
  'hadn',
  'hasn',
  'haven',
  'isn',
  'mightn',
  'mustn',
  'needn',
  'shouldn',
  'wasn',
  'weren',
  'won',
  'wouldn',
]);

const normalize = (value) => value.trim().toLocaleLowerCase();

async function readExistingTerms(language) {
  const directory = path.join(
    projectRoot,
    `src/content/words/data/${language}`,
  );
  const files = (await fs.readdir(directory)).filter((file) =>
    file.endsWith('.json'),
  );
  const terms = new Set();

  for (const file of files) {
    const deck = JSON.parse(
      await fs.readFile(path.join(directory, file), 'utf8'),
    );
    deck.words.forEach((word) => terms.add(normalize(word.term)));
  }

  return terms;
}

async function generateEnglishCandidates() {
  const existingTerms = await readExistingTerms('en');
  const candidates = [];

  for (
    let index = 0;
    index < subtlexWords.length && candidates.length < 100;
    index += 1
  ) {
    const entry = subtlexWords[index];
    const term = normalize(entry.word);
    if (
      !/^[a-z]+(?:'[a-z]+)?$/.test(term) ||
      term.length < 3 ||
      ENGLISH_STOP_WORDS.has(term) ||
      ENGLISH_CONTRACTION_FRAGMENTS.has(term) ||
      existingTerms.has(term)
    ) {
      continue;
    }

    candidates.push({
      term,
      frequency: entry.count,
      sourceRank: index + 1,
    });
    existingTerms.add(term);
  }

  return {
    language: 'en',
    source: 'subtlex-word-frequencies@2.0.0',
    note: '候选词进入正式词库前，必须补充中文释义与双语例句。',
    candidates,
  };
}

async function generateJapaneseCandidates() {
  const existingTerms = await readExistingTerms('ja');
  const candidates = [];

  for (const level of [5, 4]) {
    const words = await lookupAllWords(level);
    if (!Array.isArray(words)) throw new Error(`无法获取 JLPT N${level} 词汇`);

    let selectedForLevel = 0;
    for (const word of words) {
      const term = word.word?.trim();
      if (!term || existingTerms.has(normalize(term))) continue;

      candidates.push({
        term,
        reading: word.furigana || term,
        romaji: word.romaji || '',
        meaningEn: word.meaning || '',
        level: `N${level}`,
      });
      existingTerms.add(normalize(term));
      selectedForLevel += 1;
      if (selectedForLevel === 50) break;
    }
  }

  return {
    language: 'ja',
    source: 'japanese-easy@1.2.5 / JLPT Vocabulary API',
    note: '候选词进入正式词库前，必须补充中文释义与双语例句，并人工核对读音。',
    candidates,
  };
}

async function writeJson(filename, data) {
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(
    path.join(outputDirectory, filename),
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8',
  );
}

const [english, japanese] = await Promise.all([
  generateEnglishCandidates(),
  generateJapaneseCandidates(),
]);

await Promise.all([
  writeJson('en.json', english),
  writeJson('ja.json', japanese),
]);

console.log(
  `Generated ${english.candidates.length} English and ${japanese.candidates.length} Japanese candidates.`,
);
