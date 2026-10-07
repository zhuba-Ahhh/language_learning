import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import SpeakingExercise from './SpeakingExercise';
import AudioHistory from '../components/AudioHistory';
import styles from '../index.module.less';

export default function Speaking({
  lesson,
  initialTaskId,
  onBack,
}: {
  lesson: Lesson;
  initialTaskId?: string;
  onBack: () => void;
}) {
  const { draftActive, data } = useTraining();
  const [taskId, setTaskId] = useState(initialTaskId ?? lesson.speaking[0].id);
  const task =
    lesson.speaking.find((item) => item.id === taskId) ?? lesson.speaking[0];
  return (
    <div>
      <button type="button" className={styles.back} onClick={onBack}>
        ‹ 口语目录
      </button>
      <div className={styles.trainingHeader}>
        <div>
          <p>{lesson.stage}</p>
          <h1>{lesson.title}</h1>
        </div>
        <span>{lesson.speaking.length} 个训练</span>
      </div>
      <div className={styles.speakingTasks}>
        {lesson.speaking.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={task.id === item.id}
            onClick={() => {
              if (
                !draftActive ||
                window.confirm('这段录音还未保存。离开会放弃本次录音，继续吗？')
              )
                setTaskId(item.id);
            }}
          >
            <span>
              {data.results.some(
                (result) =>
                  result.lessonId === lesson.id && result.taskId === item.id,
              )
                ? '✓'
                : index + 1}
            </span>
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.seconds} 秒{item.optional ? ' · 加练' : ''}
              </small>
            </div>
          </button>
        ))}
      </div>
      <div className={styles.speakingLayout}>
        <SpeakingExercise key={task.id} lesson={lesson} task={task} />
        <aside className={styles.speakingHistory}>
          <h2>回听</h2>
          {!data.results.some(
            (result) => result.lessonId === lesson.id && result.recordingId,
          ) && <p>保存录音后，在这里回听。</p>}
          {data.results
            .filter(
              (result) => result.lessonId === lesson.id && result.recordingId,
            )
            .map((result) => (
              <details key={result.id}>
                <summary>
                  <strong>
                    {
                      lesson.speaking.find((item) => item.id === result.taskId)
                        ?.title
                    }
                  </strong>
                  <small>
                    {new Date(result.completedAt).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {result.assessment === 'ready' ? '熟悉' : '再练'}
                  </small>
                </summary>
                <AudioHistory id={result.recordingId!} />
              </details>
            ))}
        </aside>
      </div>
    </div>
  );
}
