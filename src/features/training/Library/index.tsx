import { useState } from 'react';
import { LESSONS, TRACK_LABELS, type Track } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import TrainingIcon from '@/components/TrainingIcon';
import StudyArt from '../components/StudyArt';
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
      <PageHeading title={skill === 'speaking' ? '口语' : '阅读'} />
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
        <label className={styles.searchField}>
          <TrainingIcon name="search" size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜材料"
            aria-label="搜索训练单元"
          />
        </label>
      </div>
      <div className={styles.libraryGrid}>
        {filtered.map((lesson) => {
          const attempts = data.results.filter(
            (result) => result.lessonId === lesson.id && result.skill === skill,
          );
          const art =
            lesson.track === 'tech'
              ? 'technology'
              : skill === 'speaking'
                ? 'microphone'
                : lesson.track === 'ielts' || lesson.track === 'jlpt'
                  ? 'flashcards'
                  : 'book';
          return (
            <button
              type="button"
              key={lesson.id}
              className={styles.lessonTile}
              onClick={() => onOpen({ lessonId: lesson.id, skill })}
            >
              <div className={`${styles.tileCover} ${styles[lesson.track]}`}>
                <StudyArt name={art} className={styles.coverArt} />
              </div>
              <div className={styles.tileBody}>
                <h2>{lesson.title}</h2>
                <div className={styles.tileMeta}>
                  <span>{lesson.stage}</span>
                  <span>
                    {skill === 'reading'
                      ? `${lesson.questions.length} 题`
                      : `${lesson.speaking.length} 个训练`}
                  </span>
                  {attempts.length > 0 && (
                    <small>已练 {attempts.length} 次</small>
                  )}
                  <i className={styles.entryArrow}>
                    <TrainingIcon name="arrow" size={19} />
                  </i>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!filtered.length && <p className={styles.empty}>没有匹配的材料。</p>}
      {filtered.some(
        (lesson) => lesson.track === 'ielts' || lesson.track === 'jlpt',
      ) && <p className={styles.libraryNote}>考试材料为原创专项练习。</p>}
    </div>
  );
}
