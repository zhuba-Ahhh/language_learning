import type { Lesson } from './types';
import data from './data/en.json' with { type: 'json' };

export const englishLessons = data as Lesson[];
