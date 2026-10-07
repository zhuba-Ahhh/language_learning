import type { KanaCell } from '../kana';
import data from './data/kana.json';

export const KANA_GROUPS = data as { title: string; cells: KanaCell[] }[];
