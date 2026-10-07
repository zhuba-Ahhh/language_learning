import { useState } from 'react';
import type { Lesson, SpeakingTask } from '@/content/training';
import InteractiveReader from '../components/InteractiveReader';
import styles from '../index.module.less';

export default function SpeakingSample({
  task,
  lesson,
}: {
  task: SpeakingTask;
  lesson: Lesson;
}) {
  const [sampleVisible, setSampleVisible] = useState(task.mode === 'shadow');
  return (
    <>
      <div className={styles.sampleHeading}>
        <button
          type="button"
          onClick={() => setSampleVisible((value) => !value)}
          aria-expanded={sampleVisible}
        >
          {sampleVisible ? '收起示范' : '看示范'}
        </button>
        <span>点词听读</span>
      </div>
      {sampleVisible && (
        <div className={styles.sample}>
          <InteractiveReader text={task.sample} lesson={lesson} />
          <small>{task.translation}</small>
        </div>
      )}
    </>
  );
}
