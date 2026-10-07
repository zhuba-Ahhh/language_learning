import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import { normalizeAnswer, scoreReading } from '@/study/trainingState';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';

export default function ReadingQuestions({
  lesson,
  startedAt,
  onOpen,
}: {
  lesson: Lesson;
  startedAt: number;
  onOpen: (selection: TrainingSelection) => void;
}) {
  const { addResult } = useTraining();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = scoreReading(lesson, answers);
  const answered = lesson.questions.filter((question) =>
    answers[question.id]?.trim(),
  ).length;
  const submit = () => {
    if (submitted || answered !== lesson.questions.length) return;
    addResult({
      lessonId: lesson.id,
      lang: lesson.lang,
      skill: 'reading',
      answers,
      correct,
      total: lesson.questions.length,
      durationMs: Date.now() - startedAt,
    });
    setSubmitted(true);
  };

  return (
    <aside className={styles.questionPaper}>
      <div className={styles.questionHeading}>
        <h2>{submitted ? '看看理解得怎样' : '读后，试着回答'}</h2>
        <span>
          {submitted
            ? `${correct}/${lesson.questions.length}`
            : `${answered}/${lesson.questions.length}`}
        </span>
      </div>
      {lesson.questions.map((question, index) => {
        const isCorrect =
          normalizeAnswer(answers[question.id] ?? '') ===
          normalizeAnswer(question.answer);
        const options =
          question.kind === 'truth'
            ? ['True', 'False', 'Not Given']
            : question.options;
        return (
          <fieldset
            key={question.id}
            className={styles.question}
            disabled={submitted}
          >
            <legend>
              {index + 1}. {question.prompt}
            </legend>
            {options ? (
              <div className={styles.options}>
                {options.map((option) => (
                  <label
                    key={option}
                    className={`${answers[question.id] === option ? styles.optionSelected : ''} ${submitted && option === question.answer ? styles.optionCorrect : ''}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option,
                        }))
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                className={styles.gapInput}
                type="text"
                aria-label={question.prompt}
                value={answers[question.id] ?? ''}
                onChange={(event) =>
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: event.target.value,
                  }))
                }
              />
            )}
            {submitted && (
              <div
                className={`${styles.explanation} ${isCorrect ? styles.correct : styles.incorrect}`}
              >
                <strong>
                  {isCorrect ? '答对了' : `答案：${question.answer}`}
                </strong>
                <p>{question.explanation}</p>
                <a href={`#paragraph-${question.evidence + 1}`}>
                  看段落 {question.evidence + 1} 的依据
                </a>
              </div>
            )}
          </fieldset>
        );
      })}
      {submitted ? (
        <div className={styles.resultBlock}>
          <p>
            {correct === lesson.questions.length
              ? '理解题全部答对，试着用自己的话说一遍。'
              : '错题已加入复习，回到原文看看依据。'}
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() =>
              onOpen({
                lessonId: lesson.id,
                skill: 'speaking',
                taskId: lesson.speaking.at(-1)?.id,
              })
            }
          >
            继续口语表达
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.primary}
          disabled={answered !== lesson.questions.length}
          onClick={submit}
        >
          查看结果
        </button>
      )}
    </aside>
  );
}
