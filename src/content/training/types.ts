export type Language = 'en' | 'ja';
export type Track = 'foundation' | 'ielts' | 'jlpt' | 'life' | 'tech';

export interface TrainingWord {
  id: string;
  term: string;
  meaning: string;
  reading?: string;
}

export interface TextMark {
  text: string;
  kind: 'phrase' | 'pattern';
  note: string;
  wordId?: string;
}

export interface Question {
  id: string;
  kind: 'choice' | 'truth' | 'gap';
  prompt: string;
  options?: string[];
  answer: string;
  evidence: number;
  explanation: string;
  maxWords?: number;
}

export interface SpeakingTask {
  id: string;
  mode: 'shadow' | 'answer' | 'retell';
  title: string;
  prompt: string;
  sample: string;
  translation: string;
  hints: string[];
  seconds: number;
  prepareSeconds?: number;
  optional?: boolean;
}

export interface Lesson {
  id: string;
  lang: Language;
  title: string;
  subtitle: string;
  stage: string;
  track: Track;
  minutes: number;
  goal: string;
  paragraphs: { text: string; translation: string; ruby?: string }[];
  words: TrainingWord[];
  marks?: TextMark[];
  pattern: { form: string; meaning: string; example: string };
  questions: Question[];
  speaking: SpeakingTask[];
  version: number;
  source: string;
}
