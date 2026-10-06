/** 英语词组清单；顺序决定词库和闪卡中的展示顺序。 */
import arch from './data/en/arch.json';
import code from './data/en/code.json';
import comm from './data/en/comm.json';
import daily from './data/en/daily.json';
import debug from './data/en/debug.json';
import flow from './data/en/flow.json';
import interview from './data/en/interview.json';
import net from './data/en/net.json';
import reading from './data/en/reading.json';
import smalltalk from './data/en/smalltalk.json';
import speaking from './data/en/speaking.json';
import { defineDecks } from './schema';

export const EN_DECKS = defineDecks(
  [
    flow,
    code,
    debug,
    arch,
    comm,
    interview,
    net,
    daily,
    smalltalk,
    speaking,
    reading,
  ],
  'en',
);
