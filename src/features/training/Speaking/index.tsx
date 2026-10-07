import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import SpeakingExercise from './SpeakingExercise';
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
      <div className={styles.speakingLayout}>
        <aside className={styles.speakingGuide}>
          <h2>今天，练这几步。</h2>
          <p>{lesson.goal}</p>
          <div className={styles.speakingTasks}>
            {lesson.speaking.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={task.id === item.id}
                onClick={() => {
                  if (
                    !draftActive ||
                    window.confirm(
                      '这段录音还未保存。离开会放弃本次录音，继续吗？',
                    )
                  )
                    setTaskId(item.id);
                }}
              >
                <span>
                  {data.results.some(
                    (result) =>
                      result.lessonId === lesson.id &&
                      result.taskId === item.id,
                  )
                    ? '✓'
                    : index + 1}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.seconds} 秒</small>
                </div>
              </button>
            ))}
          </div>
          <div className={styles.guideNote}>
            <h3>一句一句，变成自己的。</h3>
            <p>听示范，试着回答，再回听。一次只改进一个地方。</p>
          </div>
        </aside>
        <SpeakingExercise key={task.id} lesson={lesson} task={task} />
      </div>
    </div>
  );
}
