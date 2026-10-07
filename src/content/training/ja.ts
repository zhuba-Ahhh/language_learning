import type { Lesson } from './types';
import data from './data/ja.json' with { type: 'json' };

export const japaneseLessons = data as Lesson[];
