import { useState } from 'react';
import styles from '../index.module.less';

function readLegacy() {
  const values: Record<string, unknown> = {};
  for (const key of [
    'lingua.goal',
    'lingua.start',
    'lingua.courses',
    'lingua.goalStarts',
    'lingua.checks',
    'lingua.checkins',
    'lingua.goalCheckins',
    'lingua.marks',
    'lingua.customWords',
    'lingua.sessions',
    'lingua.attempts',
    'lingua.kanaBest',
  ]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) values[key] = JSON.parse(raw);
    } catch {
      /* Preserve unreadable keys in their original storage. */
    }
  }
  return values;
}

export default function LegacyHistory() {
  const [legacy] = useState(readLegacy);
  const attempts = Array.isArray(legacy['lingua.attempts'])
    ? legacy['lingua.attempts']
    : [];
  const sessions = Array.isArray(legacy['lingua.sessions'])
    ? legacy['lingua.sessions']
    : [];
  const words = Array.isArray(legacy['lingua.customWords'])
    ? legacy['lingua.customWords']
    : [];
  if (!attempts.length && !sessions.length && !words.length) return null;
  const exportLegacy = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { format: 'linguadesk-legacy-archive', data: legacy },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'linguadesk-legacy-archive.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <details className={styles.settings}>
      <summary>旧版学习记录</summary>
      <p>
        {attempts.length} 次练习、{sessions.length} 项完成任务、{words.length}{' '}
        个自建词。原始数据仍保留。
      </p>
      {sessions.map((session, index) =>
        typeof session === 'object' &&
        session !== null &&
        'title' in session ? (
          <p key={index}>{String(session.title)}</p>
        ) : null,
      )}
      {words.map((word, index) =>
        typeof word === 'object' && word !== null && 'term' in word ? (
          <p key={index}>
            {String(word.term)}
            {'meaning' in word ? ` · ${String(word.meaning)}` : ''}
          </p>
        ) : null,
      )}
      <div className={styles.settingsActions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={exportLegacy}
        >
          导出旧版归档
        </button>
      </div>
    </details>
  );
}
