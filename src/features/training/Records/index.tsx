import { useState } from 'react';
import { LESSONS } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import TrainingIcon from '@/components/TrainingIcon';
import AudioHistory from '../components/AudioHistory';
import PageHeading from '../components/PageHeading';
import LegacyHistory from './LegacyHistory';
import KanaHistory from './KanaHistory';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';
import {
  lessonMastered,
  lessonsForTarget,
  reviewLanguage,
} from '@/study/trainingState';

const localDay = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export default function Records({
  onOpen,
  onSettings,
}: {
  onOpen: (selection: TrainingSelection) => void;
  onSettings: () => void;
}) {
  const { data, now } = useTraining();
  const [month, setMonth] = useState(() => {
    const date = new Date(now);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const results = data.results.filter(
    (result) => result.lang === data.language,
  );
  const reading = results.filter((result) => result.skill === 'reading');
  const speaking = results.filter((result) => result.skill === 'speaking');
  const totalQuestions = reading.reduce(
    (n, result) => n + (result.total ?? 0),
    0,
  );
  const accuracy = totalQuestions
    ? Math.round(
        (reading.reduce((n, result) => n + (result.correct ?? 0), 0) /
          totalQuestions) *
          100,
      )
    : null;
  const activeDates = new Set(
    [
      ...results,
      ...(data.drillResults ?? []).filter(
        (result) => result.lang === data.language,
      ),
    ].map((result) => localDay(new Date(result.completedAt))),
  );
  if (data.language === 'ja')
    for (const result of data.kanaResults ?? [])
      activeDates.add(localDay(new Date(result.completedAt)));
  for (const item of data.reviews)
    if (item.lastReviewedAt && reviewLanguage(item) === data.language)
      activeDates.add(localDay(new Date(item.lastReviewedAt)));
  const first = (month.getDay() + 6) % 7;
  const count = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from(
    { length: Math.ceil((first + count) / 7) * 7 },
    (_, index) =>
      index >= first && index < first + count
        ? new Date(month.getFullYear(), month.getMonth(), index - first + 1)
        : null,
  );
  const visibleResults = selectedDate
    ? results.filter(
        (result) => localDay(new Date(result.completedAt)) === selectedDate,
      )
    : results;
  const route = lessonsForTarget(data);
  const drills = (data.drillResults ?? []).filter(
    (result) =>
      result.lang === data.language &&
      (!selectedDate ||
        localDay(new Date(result.completedAt)) === selectedDate),
  );
  const moveMonth = (offset: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
    setSelectedDate(null);
  };

  return (
    <div>
      <div className={styles.headingRow}>
        <PageHeading title="记录" />
        <button type="button" className={styles.secondary} onClick={onSettings}>
          <TrainingIcon name="settings" size={18} />
          设置
        </button>
      </div>
      <div className={styles.recordsOverview}>
        <section className={styles.calendarPaper} aria-label="练习日历">
          <div className={styles.calendarHeading}>
            <button
              type="button"
              aria-label="上个月"
              onClick={() => moveMonth(-1)}
            >
              ‹
            </button>
            <h2>
              {month.getFullYear()} 年 {month.getMonth() + 1} 月
            </h2>
            <button
              type="button"
              aria-label="下个月"
              onClick={() => moveMonth(1)}
            >
              ›
            </button>
          </div>
          <div className={styles.calendarWeek}>
            {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className={styles.calendarGrid}>
            {cells.map((date, index) =>
              date ? (
                <button
                  key={localDay(date)}
                  type="button"
                  aria-label={`${date.getMonth() + 1}月${date.getDate()}日${activeDates.has(localDay(date)) ? '，已练习' : ''}`}
                  aria-pressed={selectedDate === localDay(date)}
                  className={`${activeDates.has(localDay(date)) ? styles.calendarActive : ''} ${localDay(date) === localDay(new Date(now)) ? styles.calendarToday : ''}`}
                  onClick={() =>
                    setSelectedDate(
                      selectedDate === localDay(date) ? null : localDay(date),
                    )
                  }
                >
                  {date.getDate()}
                  {activeDates.has(localDay(date)) && <i />}
                </button>
              ) : (
                <span key={index} />
              ),
            )}
          </div>
          <div className={styles.calendarLegend}>
            <i />
            已练习
            {selectedDate && (
              <button type="button" onClick={() => setSelectedDate(null)}>
                显示全部
              </button>
            )}
          </div>
        </section>
        <div className={styles.metricGrid}>
          <section>
            <TrainingIcon name="reading" />
            <small>阅读正确率</small>
            <strong>{accuracy === null ? '—' : `${accuracy}%`}</strong>
            <span>
              {reading.length} 次 · {totalQuestions} 道题
            </span>
          </section>
          <section>
            <TrainingIcon name="speaking" />
            <small>口语练习</small>
            <strong>
              {speaking.length}
              <em>次</em>
            </strong>
            <span>
              {Math.round(
                speaking.reduce((n, result) => n + result.durationMs, 0) /
                  60000,
              )}{' '}
              分钟录音
            </span>
          </section>
          <button
            type="button"
            className={styles.targetCard}
            onClick={onSettings}
          >
            <small>当前目标</small>
            <strong>{data.targets[data.language]}</strong>
            <TrainingIcon name="arrow" size={20} />
          </button>
        </div>
      </div>
      <section className={styles.recordList}>
        <p className={styles.masteryNote}>
          当前路线已掌握{' '}
          {route.filter((lesson) => lessonMastered(data, lesson)).length}/
          {route.length} · 阅读 ≥80%，必做口语自评熟悉；不换算考试分数。
        </p>
        <div className={styles.sectionHeading}>
          <h2>
            {selectedDate
              ? `${selectedDate.split('-').slice(1).join('/')} 的练习`
              : '练习记录'}
          </h2>
          <span>
            {visibleResults.length} 次 ·{' '}
            {Math.round(
              visibleResults.reduce((n, result) => n + result.durationMs, 0) /
                60000,
            )}{' '}
            分钟
          </span>
        </div>
        {!visibleResults.length && (
          <div className={styles.empty}>
            <p>
              {selectedDate
                ? '这一天暂无口语或阅读记录。'
                : '暂无口语或阅读记录。'}
            </p>
            <button
              type="button"
              className={styles.primary}
              onClick={() =>
                onOpen({
                  lessonId: LESSONS.find(
                    (lesson) => lesson.lang === data.language,
                  )!.id,
                  skill: 'reading',
                })
              }
            >
              开始练习
            </button>
          </div>
        )}
        {visibleResults.map((result) => {
          const lesson = LESSONS.find((item) => item.id === result.lessonId)!;
          const task = lesson.speaking.find(
            (item) => item.id === result.taskId,
          );
          return (
            <details key={result.id} className={styles.recordItem}>
              <summary>
                <span className={styles.recordSkill}>
                  {result.skill === 'reading' ? '读' : '说'}
                </span>
                <div>
                  <strong>{result.lessonTitle ?? lesson.title}</strong>
                  <small>
                    {task?.title ?? '阅读理解'} ·{' '}
                    {new Date(result.completedAt).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </div>
                <span>
                  {result.skill === 'reading'
                    ? `${result.correct}/${result.total}`
                    : result.assessment === 'ready'
                      ? '已熟悉'
                      : '再练'}
                </span>
              </summary>
              <div className={styles.recordBody}>
                {result.recordingId ? (
                  <AudioHistory id={result.recordingId} />
                ) : (
                  (result.questionSnapshot ?? lesson.questions).map(
                    (question) => (
                      <p key={question.id}>
                        <strong>{question.prompt}</strong>
                        <span>
                          你的答案：{result.answers?.[question.id] || '未作答'}{' '}
                          · 正确答案：{question.answer}
                        </span>
                      </p>
                    ),
                  )
                )}
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() =>
                    onOpen({
                      lessonId: lesson.id,
                      skill: result.skill,
                      taskId: result.taskId,
                    })
                  }
                >
                  重练
                </button>
              </div>
            </details>
          );
        })}
      </section>

      {drills.length > 0 && (
        <section className={styles.recordList}>
          <div className={styles.sectionHeading}>
            <h2>句型与精听</h2>
            <span>{drills.length} 次</span>
          </div>
          {drills.map((result) => (
            <details className={styles.recordItem} key={result.id}>
              <summary>
                <span className={styles.recordSkill}>
                  {result.kind === 'grammar' ? '句' : '听'}
                </span>
                <div>
                  <strong>
                    {
                      LESSONS.find((lesson) => lesson.id === result.lessonId)!
                        .title
                    }
                  </strong>
                  <small>
                    {result.kind === 'grammar'
                      ? '句型练习'
                      : result.assisted
                        ? '精听 · 使用提示'
                        : '精听 · 独立听写'}{' '}
                    · {new Date(result.completedAt).toLocaleString('zh-CN')}
                  </small>
                </div>
                <span>
                  {result.correct}/{result.total}
                </span>
              </summary>
              <div className={styles.recordBody}>
                {result.questionSnapshot.map((question) => (
                  <p key={question.id}>
                    <strong>{question.prompt}</strong>
                    <span>
                      你的答案：{result.answers[question.id]} · 答案：
                      {question.answer}
                    </span>
                  </p>
                ))}
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() =>
                    onOpen({
                      lessonId: result.lessonId,
                      skill: 'reading',
                      panel: result.kind,
                    })
                  }
                >
                  重练
                </button>
              </div>
            </details>
          ))}
        </section>
      )}

      <KanaHistory />
      <LegacyHistory />
      <p className={styles.libraryNote}>练习表现与自评，不换算考试成绩。</p>
    </div>
  );
}
