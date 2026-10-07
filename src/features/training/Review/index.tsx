import { useState } from 'react';
import { LESSONS } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import ReviewContent from './ReviewContent';
import type { TrainingSelection } from '../types';
import PageHeading from '../components/PageHeading';
import WordBank from './WordBank';
import KanaPractice from './KanaPractice';
import styles from '../index.module.less';

export default function Review({
  onOpen,
}: {
  onOpen: (selection: TrainingSelection) => void;
}) {
  const { data, now, review } = useTraining();
  const [tools, setTools] = useState<'none' | 'words' | 'kana'>('none');
  const [revealed, setRevealed] = useState(false);
  const [batch, setBatch] = useState(() =>
    data.reviews
      .filter(
        (item) =>
          LESSONS.find((lesson) => lesson.id === item.lessonId)?.lang ===
            data.language && Date.parse(item.dueAt) <= Date.now(),
      )
      .map((item) => item.id)
      .slice(0, 10),
  );
  const [index, setIndex] = useState(0);
  const item = data.reviews.find((review) => review.id === batch[index]);
  const lesson = LESSONS.find((unit) => unit.id === item?.lessonId);
  const upcoming = data.reviews.filter(
    (item) =>
      LESSONS.find((lesson) => lesson.id === item.lessonId)?.lang ===
        data.language && Date.parse(item.dueAt) > now,
  ).length;
  const finish = (remembered: boolean) => {
    if (!item) return;
    review(item.id, remembered);
    setIndex((value) => value + 1);
    setRevealed(false);
  };
  const refresh = () => {
    setBatch(
      data.reviews
        .filter(
          (item) =>
            LESSONS.find((lesson) => lesson.id === item.lessonId)?.lang ===
              data.language && Date.parse(item.dueAt) <= Date.now(),
        )
        .map((item) => item.id)
        .slice(0, 10),
    );
    setIndex(0);
    setRevealed(false);
  };
  if (tools === 'words') return <WordBank onBack={() => setTools('none')} />;
  if (tools === 'kana') return <KanaPractice onBack={() => setTools('none')} />;
  return (
    <div>
      <PageHeading
        title="再练一次，会更熟悉。"
        description="一次练几项，把不熟悉的重新记住。"
      />
      {item && lesson ? (
        <section className={styles.reviewPaper} key={item.id}>
          <div className={styles.exerciseMeta}>
            <span>
              {item.kind === 'word'
                ? '生词'
                : item.kind === 'question'
                  ? '阅读错题'
                  : '口语重练'}
            </span>
            <span>
              {index + 1} / {batch.length}
            </span>
          </div>
          <p className={styles.reviewOrigin}>{lesson.title}</p>
          <ReviewContent
            item={item}
            lesson={lesson}
            revealed={revealed}
            onOpen={onOpen}
          />
          {item.kind !== 'speaking' && !revealed ? (
            <button
              type="button"
              className={styles.primary}
              onClick={() => setRevealed(true)}
            >
              看答案
            </button>
          ) : (
            <div className={styles.reviewActions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => finish(false)}
              >
                还不熟
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={() => finish(true)}
              >
                记住了
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className={styles.reviewEmpty}>
          <div aria-hidden="true">✓</div>
          <h2>{batch.length ? '这一轮，完成了。' : '现在没有到期内容。'}</h2>
          <p>
            {upcoming
              ? `${upcoming} 项已安排下次复习`
              : '阅读时加入生词，做错的题也会自动来到这里。'}
          </p>
          <button type="button" className={styles.secondary} onClick={refresh}>
            检查到期内容
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              onOpen({
                lessonId: LESSONS.find(
                  (lesson) => lesson.lang === data.language,
                )!.id,
                skill: 'reading',
              })
            }
          >
            读一篇新的
          </button>
        </section>
      )}
      <div className={styles.toolRow}>
        <button type="button" onClick={() => setTools('words')}>
          词库与我的词
          <span>
            {
              data.savedWords.filter((word) => word.lang === data.language)
                .length
            }{' '}
            个已收藏
          </span>
        </button>
        {data.language === 'ja' && (
          <button type="button" onClick={() => setTools('kana')}>
            假名小练习<span>清音、浊音与拗音</span>
          </button>
        )}
      </div>
    </div>
  );
}
