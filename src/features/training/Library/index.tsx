import { useState } from 'react';
import { LESSONS, TRACK_LABELS, type Track } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import TrainingIcon from '@/components/TrainingIcon';
import PageHeading from '../components/PageHeading';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';

export default function Library({
  skill,
  onOpen,
}: {
  skill: 'reading' | 'speaking';
  onOpen: (selection: TrainingSelection) => void;
}) {
  const { data } = useTraining();
  const [track, setTrack] = useState<Track | 'all'>('all');
  const [query, setQuery] = useState('');
  const lessons = LESSONS.filter((lesson) => lesson.lang === data.language);
  const tracks = [...new Set(lessons.map((lesson) => lesson.track))];
  const filtered = lessons.filter(
    (lesson) =>
      (track === 'all' || lesson.track === track) &&
      `${lesson.title} ${lesson.subtitle}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div>
      <PageHeading
        title={
          skill === 'speaking' ? '让语言，真正说出来。' : '读得懂，也讲得清。'
        }
        description={
          skill === 'speaking'
            ? '先跟读，再用自己的话回答。'
            : '从适合你的短文开始，读后再复述。'
        }
      />
      <div className={styles.libraryToolbar}>
        <div className={styles.filters} aria-label="内容方向">
          {(['all', ...tracks] as const).map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={track === item}
              onClick={() => setTrack(item)}
            >
              {item === 'all' ? '全部' : TRACK_LABELS[item]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="找一个主题"
          aria-label="搜索训练单元"
        />
      </div>
      <div className={styles.libraryGrid}>
        {filtered.map((lesson, index) => {
          const attempts = data.results.filter(
            (result) => result.lessonId === lesson.id && result.skill === skill,
          );
          return (
            <button
              type="button"
              key={lesson.id}
              className={styles.lessonTile}
              onClick={() => onOpen({ lessonId: lesson.id, skill })}
            >
              <div className={styles.tileTop}>
                <span className={`${styles.tileIcon} ${styles[lesson.track]}`}>
                  <TrainingIcon name={skill} size={27} />
                </span>
                <span>{lesson.stage}</span>
              </div>
              <h2>{lesson.title}</h2>
              <p>{lesson.subtitle}</p>
              <div className={styles.tileMeta}>
                <span>
                  {skill === 'reading'
                    ? `${lesson.questions.length} 题`
                    : `${lesson.speaking.length} 个训练`}
                  <span className={styles.metaDivider}>·</span>
                  {lesson.minutes} 分钟
                </span>
                <span>
                  {attempts.length
                    ? `已练 ${attempts.length} 次`
                    : index === 0
                      ? '从这里开始'
                      : '开始'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {!filtered.length && (
        <p className={styles.empty}>没有匹配的主题，试试其他关键词。</p>
      )}
      <p className={styles.libraryNote}>
        所有正文、题目与解析均内置。考试内容为原创专项练习。
      </p>
    </div>
  );
}
