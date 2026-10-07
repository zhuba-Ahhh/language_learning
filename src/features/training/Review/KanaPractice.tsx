import { useState } from 'react';
import { KANA_GROUPS } from '@/content/training/kana';
import { speak } from '@/lib/speech';
import { useTraining } from '@/study/trainingContext';
import SpeakButton from '@/components/SpeakButton';
import styles from '../index.module.less';

function chooseRound(size: number) {
  const indices = Array.from({ length: size }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[other]] = [indices[other], indices[index]];
  }
  return indices.slice(0, 5);
}

export default function KanaPractice({
  onBack,
  backLabel = '复习',
}: {
  onBack: () => void;
  backLabel?: string;
}) {
  const { recordKana } = useTraining();
  const [group, setGroup] = useState(0);
  const [script, setScript] = useState<0 | 1>(0);
  const [quiz, setQuiz] = useState(false);
  const [position, setPosition] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState('');
  const [selected, setSelected] = useState(0);
  const [audioError, setAudioError] = useState('');
  const [round, setRound] = useState(() =>
    chooseRound(KANA_GROUPS[0].cells.length),
  );
  const cells = KANA_GROUPS[group].cells;
  const cell = cells[round[position] ?? 0];
  const options = [
    cell.romaji,
    ...cells
      .filter((item) => item.romaji !== cell.romaji)
      .slice(position % 4, (position % 4) + 3)
      .map((item) => item.romaji),
  ].sort();
  const reset = (nextGroup = group) => {
    setRound(chooseRound(KANA_GROUPS[nextGroup].cells.length));
    setPosition(0);
    setCorrect(0);
    setPicked('');
    setSelected(0);
    setAudioError('');
  };
  return (
    <div>
      <button type="button" className={styles.back} onClick={onBack}>
        ‹ {backLabel}
      </button>
      <div className={styles.pageHeading}>
        <h1>假名</h1>
      </div>
      <div className={styles.libraryToolbar}>
        <div className={styles.filters}>
          {KANA_GROUPS.map((item, index) => (
            <button
              type="button"
              key={item.title}
              aria-pressed={group === index}
              onClick={() => {
                setGroup(index);
                reset(index);
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <button
            type="button"
            aria-pressed={script === 0}
            onClick={() => {
              setScript(0);
              reset();
            }}
          >
            平假名
          </button>
          <button
            type="button"
            aria-pressed={script === 1}
            onClick={() => {
              setScript(1);
              reset();
            }}
          >
            片假名
          </button>
          <button
            type="button"
            aria-pressed={quiz}
            onClick={() => {
              setQuiz((value) => !value);
              reset();
            }}
          >
            {quiz ? '字表' : '小测'}
          </button>
        </div>
      </div>
      {quiz ? (
        <section className={`${styles.reviewPaper} ${styles.kanaQuiz}`}>
          {position >= 5 ? (
            <>
              <h2>这一轮答对 {correct} / 5</h2>
              <button
                type="button"
                className={styles.primary}
                onClick={() => reset()}
              >
                再练五题
              </button>
            </>
          ) : (
            <>
              <p>{position + 1} / 5</p>
              <h2 lang="ja">{cell.kana[script]}</h2>
              <div className={styles.filters}>
                {options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    disabled={!!picked}
                    aria-pressed={picked === option}
                    onClick={() => {
                      setPicked(option);
                      if (position === 4)
                        recordKana({
                          group: KANA_GROUPS[group].title,
                          script,
                          correct: correct + (option === cell.romaji ? 1 : 0),
                          total: 5,
                        });
                      if (option === cell.romaji)
                        setCorrect((value) => value + 1);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {picked && (
                <>
                  <p>
                    {picked === cell.romaji
                      ? '答对了'
                      : `读音是 ${cell.romaji}`}
                  </p>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => {
                      setPosition((value) => value + 1);
                      setPicked('');
                    }}
                  >
                    下一题
                  </button>
                </>
              )}
            </>
          )}
        </section>
      ) : (
        <div className={styles.kanaLayout}>
          <section className={styles.kanaBoard}>
            <div className={styles.kanaGrid}>
              {cells.map((item, index) => (
                <button
                  type="button"
                  key={index}
                  style={{
                    gridColumn: 'aiueo'.indexOf(item.romaji.slice(-1)) + 1 || 1,
                  }}
                  aria-pressed={selected === index}
                  onClick={() => {
                    setSelected(index);
                    setAudioError('');
                    void speak(item.kana[0], 'ja').catch(() =>
                      setAudioError('发音加载失败，请重试。'),
                    );
                  }}
                >
                  <strong lang="ja">{item.kana[script]}</strong>
                  <small>{item.romaji}</small>
                </button>
              ))}
            </div>
          </section>
          <aside className={styles.kanaDetail}>
            <h2 lang="ja">{cells[selected].kana[script]}</h2>
            <p>{cells[selected].romaji}</p>
            <SpeakButton text={cells[selected].kana[0]} lang="ja" size={44} />
            <small>
              {script === 0 ? '片假名' : '平假名'} ·{' '}
              <span lang="ja">
                {cells[selected].kana[script === 0 ? 1 : 0]}
              </span>
            </small>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setQuiz(true);
                reset();
              }}
            >
              练 5 题
            </button>
          </aside>
        </div>
      )}
      {audioError && (
        <p role="alert" className={styles.error}>
          {audioError}
        </p>
      )}
      <details className={styles.pattern}>
        <summary>长音与促音</summary>
        <p>
          长音把元音延长一拍，例如「おばさん」与「おばあさん」不同。促音「っ」先停一拍，再读后面的辅音，例如「きて」与「きって」。
        </p>
      </details>
    </div>
  );
}
