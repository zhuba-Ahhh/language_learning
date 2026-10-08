import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { GRAMMAR } from '@/content/training/grammar';
import InteractiveReader from '../components/InteractiveReader';
import ReadingQuestions from './ReadingQuestions';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';

export default function GrammarPractice({
  lesson,
  onOpen,
}: {
  lesson: Lesson;
  onOpen: (selection: TrainingSelection) => void;
}) {
  const [startedAt] = useState(Date.now);
  const note = GRAMMAR[lesson.id];
  return (
    <div className={styles.readingLayout}>
      <section className={styles.grammarPaper}>
        <h2 lang={lesson.lang}>{lesson.pattern.form}</h2>
        <p>{lesson.pattern.meaning}</p>
        <div id="pattern-example" className={styles.patternExample}>
          <InteractiveReader
            text={lesson.pattern.example}
            lesson={lesson}
            label="句型例句"
          />
        </div>
        <h3>拆开看</h3>
        <dl className={styles.sentenceChunks}>
          {note.chunks.map((chunk, index) => (
            <div key={index}>
              <dt lang={lesson.lang}>{chunk.text}</dt>
              <dd>{chunk.role}</dd>
            </div>
          ))}
        </dl>
        <ul className={styles.grammarTips}>
          {note.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
      <ReadingQuestions
        lesson={lesson}
        questions={note.questions}
        mode="grammar"
        startedAt={startedAt}
        onOpen={onOpen}
      />
    </div>
  );
}
