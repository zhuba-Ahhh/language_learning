import { DECKS } from './words';
import { LESSONS } from './training';
import notes from './vocabulary-notes.json';
import { buildVocabulary, findVocabulary } from './vocabularyIndex';

export const VOCABULARY = buildVocabulary(DECKS, LESSONS, notes);
export const lookupVocabulary = (term: string, lang: 'en' | 'ja') =>
  findVocabulary(VOCABULARY, term, lang);
