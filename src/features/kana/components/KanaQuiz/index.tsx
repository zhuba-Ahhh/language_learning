/** 受控测验视图；题目、成绩及最佳记录由父组件保存。 */
import styles from './index.module.less';
import type { KanaCell } from '@/content/kana';

interface Props {
  idx: 0 | 1;
  quiz: { answer: KanaCell; options: KanaCell[] };
  picked: string | null;
  score: { right: number; total: number };
  accuracy: number;
  bestAccuracy: number;
  onAnswer: (cell: KanaCell) => void;
  onReset: () => void;
}

export default function KanaQuiz({
  idx,
  quiz,
  picked,
  score,
  accuracy,
  bestAccuracy,
  onAnswer,
  onReset,
}: Props) {
  return (
    <div className={`reveal ${styles.quiz}`}>
      <div className={styles.stats}>
        <span>
          正确率 <span className={styles.accuracy}>{accuracy}%</span>
        </span>
        <span>
          {score.right} / {score.total}
        </span>
        {bestAccuracy > 0 && (
          <span>
            历史最佳 <span className={styles.best}>{bestAccuracy}%</span>
          </span>
        )}
        <button onClick={onReset} className={styles.reset}>
          清零
        </button>
      </div>
      <p className={styles.prompt}>哪个是</p>
      <p className={styles.question}>{quiz.answer.romaji}</p>
      <div className={styles.options}>
        {quiz.options.map((cell) => {
          const isAnswer = cell.romaji === quiz.answer.romaji;
          const isPicked = picked === cell.romaji;
          return (
            <button
              key={cell.romaji}
              onClick={() => onAnswer(cell)}
              className={`${styles.option} ${
                picked
                  ? isAnswer
                    ? `pop-in ${styles.correct}`
                    : isPicked
                      ? styles.wrong
                      : styles.dimmed
                  : styles.idle
              }`}
            >
              <span lang="ja">{cell.kana[idx]}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.hint}>答对自动出下一题，答错会停顿让你看清楚</p>
    </div>
  );
}
