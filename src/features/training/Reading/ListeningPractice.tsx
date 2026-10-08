import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { normalizeAnswer } from '@/study/trainingScoring';
import { useTraining } from '@/study/trainingContext';
import { stopSpeak } from '@/lib/speech';
import InteractiveReader from '../components/InteractiveReader';
import styles from '../index.module.less';

export default function ListeningPractice({ lesson }: { lesson: Lesson }) {
  const { addDrillResult } = useTraining();
  const [startedAt, setStartedAt] = useState(Date.now);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const correct =
    normalizeAnswer(answer) === normalizeAnswer(lesson.pattern.example);
  const submit = () => {
    if (!answer.trim() || submitted) return;
    stopSpeak();
    addDrillResult({
      lessonId: lesson.id,
      lang: lesson.lang,
      kind: 'listening',
      answers: { sentence: answer },
      durationMs: Date.now() - startedAt,
      assisted: revealed,
    });
    setSubmitted(true);
  };
  return (
    <section className={styles.listeningPaper}>
      <div className={styles.sectionHeading}>
        <h2>先听，再写</h2>
        <span>句型精听</span>
      </div>
      <p>听一遍大意，循环听清，再写下整句。</p>
      <div className={styles.listeningAudio}>
        <InteractiveReader
          text={lesson.pattern.example}
          lesson={lesson}
          label="精听音频"
          hideText={!revealed && !submitted}
          loopable
        />
      </div>
      <label className={styles.formField}>
        听到的句子
        <textarea
          className={styles.formControl}
          rows={3}
          value={answer}
          lang={lesson.lang}
          aria-describedby="listening-hint"
          aria-invalid={submitted && !correct}
          disabled={submitted}
          autoComplete="off"
          spellCheck={false}
          placeholder="写下听到的内容"
          onChange={(event) => setAnswer(event.target.value)}
        />
      </label>
      <small id="listening-hint">
        忽略大小写、句末标点；句内标点按原文填写。
      </small>
      {!submitted ? (
        <div className={styles.drillActions}>
          <button
            type="button"
            className={styles.secondary}
            disabled={revealed}
            onClick={() => setRevealed(true)}
          >
            {revealed ? '已看原文' : '看原文'}
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={!answer.trim()}
            onClick={submit}
          >
            核对
          </button>
        </div>
      ) : (
        <div
          className={`${styles.explanation} ${correct ? styles.correct : styles.incorrect}`}
          role="status"
        >
          <strong>{correct ? '听写正确' : '对照原文，再听一次'}</strong>
          <p>{lesson.pattern.meaning}</p>
          <p>
            {revealed ? '已使用原文提示，记录为辅助练习。' : '已记录本次听写。'}
            {!correct || revealed ? '已加入复习。' : ''}
          </p>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              stopSpeak();
              setAnswer('');
              setRevealed(false);
              setSubmitted(false);
              setStartedAt(Date.now());
            }}
          >
            再听写一次
          </button>
        </div>
      )}
    </section>
  );
}
