/** 管理假名模式及测验状态，切换字表时保留成绩与当前题。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useMemo, useState } from 'react';
import { ALL_KANA, type KanaCell } from '@/content/kana';
import { speak, ttsSupported } from '@/lib/speech';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import KanaChart from './components/KanaChart';
import KanaQuiz from './components/KanaQuiz';

type Mode = 'hira' | 'kata';

/** 从现有字池生成一道四选一题目。 */
function randomQuiz(pool: KanaCell[]) {
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const options = new Set<KanaCell>([answer]);
  while (options.size < 4)
    options.add(pool[Math.floor(Math.random() * pool.length)]);
  return { answer, options: [...options].sort(() => Math.random() - 0.5) };
}

export default function KanaSection({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [mode, setMode] = useState<Mode>('hira');
  const [tab, setTab] = useState<'chart' | 'quiz'>('chart');

  // quiz state
  const pool = ALL_KANA;
  const [quiz, setQuiz] = useState(() => randomQuiz(pool));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [best, setBest] = useLocalStorage<{
    accuracy: number;
    answered: number;
  }>('lingua.kanaBest', { accuracy: 0, answered: 0 });

  const idx = mode === 'hira' ? 0 : 1;

  const nextQuiz = () => {
    setQuiz(randomQuiz(pool));
    setPicked(null);
  };

  /** 记录作答并按原有延时出下一题，满十题后更新最佳成绩。 */
  const answer = (cell: KanaCell) => {
    if (picked) return;
    setPicked(cell.romaji);
    const right = cell.romaji === quiz.answer.romaji;
    const next = {
      right: score.right + (right ? 1 : 0),
      total: score.total + 1,
    };
    setScore(next);
    if (next.total === 10) onComplete?.();
    // 每答满 10 题且刷新纪录时保存历史最佳
    if (next.total >= 10) {
      const acc = Math.round((next.right / next.total) * 100);
      if (acc > best.accuracy) setBest({ accuracy: acc, answered: next.total });
    }
    if (ttsSupported) speak(quiz.answer.kana[0], 'ja');
    window.setTimeout(nextQuiz, right ? 650 : 1200);
  };

  const accuracy = useMemo(
    () => (score.total ? Math.round((score.right / score.total) * 100) : 0),
    [score],
  );

  return (
    <div className={styles.section}>
      <FeatureHeader title="认读假名"></FeatureHeader>

      {/* controls */}
      <div className={`reveal ${styles.controls}`}>
        <div className={styles.switchGroup}>
          {(
            [
              ['chart', '字表'],
              ['quiz', '小测验'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`${styles.switchOption} ${
                tab === v ? styles.selected : styles.idle
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.switchGroup}>
          {(
            [
              ['hira', '平假名'],
              ['kata', '片假名'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              className={`${styles.switchOption} ${
                mode === v ? styles.modeSelected : styles.idle
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'chart' ? (
        <KanaChart idx={idx} />
      ) : (
        <KanaQuiz
          idx={idx}
          quiz={quiz}
          picked={picked}
          score={score}
          accuracy={accuracy}
          bestAccuracy={best.accuracy}
          onAnswer={answer}
          onReset={() => setScore({ right: 0, total: 0 })}
        />
      )}
    </div>
  );
}
