import { useState } from 'react';
import { LESSONS } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import ReviewContent from './ReviewContent';
import type { TrainingSelection } from '../types';
import PageHeading from '../components/PageHeading';
import WordBank from './WordBank';
import KanaPractice from './KanaPractice';
import styles from '../index.module.less';
import StudyArt from '../components/StudyArt';
import { stopSpeak } from '@/lib/speech';

export default function Review({
  onOpen,
}: {
  onOpen: (selection: TrainingSelection) => void;
}) {
  const { data, now, review } = useTraining();
  const [tools, setTools] = useState<'none' | 'words' | 'kana'>('none');
  const openTool = (tool: 'none' | 'words' | 'kana') => {
    stopSpeak();
    setTools(tool);
    window.scrollTo({ top: 0 });
  };
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
  if (tools === 'words')
    return <WordBank onBack={() => openTool('none')} onOpen={onOpen} />;
  if (tools === 'kana') return <KanaPractice onBack={() => openTool('none')} />;
  return (
    <div>
      <PageHeading title="复习" />
      <div className={styles.reviewLayout}>
        {item && lesson ? (
          <section className={styles.reviewPaper} key={item.id}>
            <div className={styles.exerciseMeta}>
              <span>
                {item.kind === 'word'
                  ? '生词'
                  : item.kind === 'question'
                    ? '阅读错题'
                    : item.kind === 'grammar'
                      ? '句型复习'
                      : item.kind === 'listening'
                        ? '听写复习'
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
                  再练
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => finish(true)}
                >
                  熟悉
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={styles.reviewEmpty}>
            <StudyArt name="flashcards" />
            <h2>{batch.length ? '本轮完成' : '暂无到期内容'}</h2>
            <p>
              {upcoming
                ? `${upcoming} 项已安排下次复习`
                : '收藏生词或做错的题，会在这里复习。'}
            </p>
            <button
              type="button"
              className={styles.secondary}
              onClick={refresh}
            >
              检查到期
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
              去阅读
            </button>
          </section>
        )}
        <aside className={styles.reviewRail}>
          <h2>本轮</h2>
          <div className={styles.reviewCounts}>
            {(
              [
                ['word', '词汇'],
                ['question', '阅读'],
                ['speaking', '口语'],
                ['grammar', '句型'],
                ['listening', '精听'],
              ] as const
            ).map(([kind, label]) => (
              <div key={kind}>
                <span>{label}</span>
                <strong>
                  {
                    data.reviews.filter(
                      (item) =>
                        batch.slice(index).includes(item.id) &&
                        item.kind === kind,
                    ).length
                  }
                </strong>
              </div>
            ))}
          </div>
          <div className={styles.toolRow}>
            <button type="button" onClick={() => openTool('words')}>
              词库
              <span>
                {
                  data.savedWords.filter((word) => word.lang === data.language)
                    .length
                }{' '}
                个收藏
              </span>
            </button>
            {data.language === 'ja' && (
              <button type="button" onClick={() => openTool('kana')}>
                假名<span>字表 · 5 题小测</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
