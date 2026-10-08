import type { Deck } from './words/types';
import type { Language, Lesson, TrainingWord } from './training/types';

export interface VocabularyWord extends TrainingWord {
  key: string;
  lang: Language;
  origin: string;
  lessonId?: string;
  audioUrl?: string;
}

export type VocabularyNotes = Record<
  string,
  Pick<TrainingWord, 'partOfSpeech' | 'lemma' | 'note' | 'forms'>
>;

export const vocabularyKey = (term: string, lang: Language) =>
  `${lang}:${term.trim().toLocaleLowerCase()}`;

export function buildVocabulary(
  decks: Deck[],
  lessons: Lesson[],
  notes: VocabularyNotes,
) {
  const entries = new Map<string, VocabularyWord>();
  const add = (
    word: TrainingWord & { audioUrl?: string },
    lang: Language,
    origin: string,
    lessonId?: string,
  ) => {
    const key = vocabularyKey(word.term, lang);
    entries.set(key, {
      ...entries.get(key),
      ...word,
      ...notes[key],
      key,
      lang,
      origin,
      ...(lessonId ? { lessonId } : {}),
    });
  };
  for (const deck of decks)
    for (const word of deck.words) add(word, deck.lang, deck.title);
  for (const lesson of lessons)
    for (const word of lesson.words)
      add(word, lesson.lang, lesson.title, lesson.id);
  return [...entries.values()];
}

export function findVocabulary(
  words: VocabularyWord[],
  term: string,
  lang: Language,
) {
  const key = vocabularyKey(term, lang);
  return (
    words.find((word) => word.key === key) ??
    words.find(
      (word) =>
        word.lang === lang &&
        [word.lemma, ...(word.forms ?? [])].some(
          (form) => form && vocabularyKey(form, lang) === key,
        ),
    )
  );
}
