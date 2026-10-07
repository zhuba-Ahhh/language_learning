import { LESSONS } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import AudioHistory from '../components/AudioHistory';
import PageHeading from '../components/PageHeading';
import Settings from './Settings';
import LegacyHistory from './LegacyHistory';
import KanaHistory from './KanaHistory';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';

export default function Records({
  onOpen,
}: {
  onOpen: (selection: TrainingSelection) => void;
}) {
  const { data } = useTraining();
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
  const now = new Date();
  const localDay = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const activeDates = new Set(
    results.map((result) => localDay(new Date(result.completedAt))),
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + index);
    return date;
  });
  return (
    <div>
      <PageHeading
        title="每一次练习，都算数。"
        description="看见真实的阅读结果，听见自己的变化。"
      />
      <div className={styles.metricGrid}>
        <section>
          <small>阅读正确率</small>
          <strong>{accuracy === null ? '—' : `${accuracy}%`}</strong>
          <span>
            {reading.length} 次阅读 · {totalQuestions} 道题
          </span>
        </section>
        <section>
          <small>口语练习</small>
          <strong>
            {speaking.length}
            <em>次</em>
          </strong>
          <span>每次录音分别保存</span>
        </section>
        <section>
          <small>已记录的练习时间</small>
          <strong>
            {Math.round(
              results.reduce((n, result) => n + result.durationMs, 0) / 60000,
            )}
            <em>分钟</em>
          </strong>
          <span>口语录音与阅读作答</span>
        </section>
      </div>
      <section className={styles.weekSection}>
        <div className={styles.sectionHeading}>
          <h2>最近七天</h2>
          <span>{data.language === 'en' ? '英语' : '日语'}</span>
        </div>
        <div className={styles.weekStrip}>
          {days.map((date) => (
            <div key={date.toISOString()}>
              <small>
                {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
              </small>
              <span
                className={
                  activeDates.has(localDay(date)) ? styles.dayActive : ''
                }
              >
                {date.getDate()}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.recordList}>
        <div className={styles.sectionHeading}>
          <h2>练习记录</h2>
          <span>{results.length} 次</span>
        </div>
        {!results.length && (
          <div className={styles.empty}>
            <p>完成阅读题，或保存一段录音，第一条记录就会出现在这里。</p>
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
              开始第一课
            </button>
          </div>
        )}
        {results.map((result) => {
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
                      ? '能独立表达'
                      : '继续练习'}
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
                  再练一次
                </button>
              </div>
            </details>
          );
        })}
      </section>
      <Settings />
      <KanaHistory />
      <LegacyHistory />
      <p className={styles.libraryNote}>
        这里展示练习表现与自评，不换算正式考试成绩。
      </p>
    </div>
  );
}
