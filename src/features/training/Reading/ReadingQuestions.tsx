import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import { normalizeAnswer, scoreReading } from '@/study/trainingState';
import type { TrainingSelection } from '../types';
import TrainingIcon from '@/components/TrainingIcon';
import styles from '../index.module.less';

export default function ReadingQuestions({
  lesson,
  startedAt,
  onOpen,
  onShowText,
}: {
  lesson: Lesson;
  startedAt: number;
  onOpen: (selection: TrainingSelection) => void;
  onShowText: () => void;
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
        <h2>{submitted ? '结果' : '理解'}</h2>
        <span>
          {submitted
            ? `${correct}/${lesson.questions.length}`
            : `${answered}/${lesson.questions.length}`}
        </span>
        <progress
          aria-label={submitted ? '答对题数' : '作答进度'}
          value={submitted ? correct : answered}
          max={lesson.questions.length}
        />
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
              <span className={styles.questionNumber}>{index + 1}</span>
              {question.prompt}
            </legend>
            {options ? (
              <div className={styles.options}>
                {options.map((option) => (
                  <label
                    key={option}
                    className={`${answers[question.id] === option ? styles.optionSelected : ''} ${submitted && option === question.answer ? styles.optionCorrect : ''} ${submitted && answers[question.id] === option && !isCorrect ? styles.optionIncorrect : ''}`}
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
                    {submitted && option === question.answer && (
                      <TrainingIcon name="check" size={17} />
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className={styles.gapField}>
                <input
                  className={`${styles.formControl} ${submitted && isCorrect ? styles.inputCorrect : ''}`}
                  type="text"
                  aria-label={question.prompt}
                  aria-invalid={submitted && !isCorrect}
                  aria-describedby={`${lesson.id}-${question.id}-hint`}
                  placeholder="按原文填写"
                  autoComplete="off"
                  value={answers[question.id] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                />
                <small id={`${lesson.id}-${question.id}-hint`}>
                  {question.maxWords
                    ? `最多 ${question.maxWords} 词`
                    : '填写原文中的答案'}
                </small>
              </div>
            )}
            {submitted && (
              <div
                className={`${styles.explanation} ${isCorrect ? styles.correct : styles.incorrect}`}
              >
                <strong>
                  {isCorrect ? '答对了' : `答案：${question.answer}`}
                </strong>
                <p>{question.explanation}</p>
                <a
                  href={`#paragraph-${question.evidence + 1}`}
                  onClick={onShowText}
                >
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
              ? '全部答对，试试复述。'
              : '错题已加入复习。'}
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() =>
              onOpen({
                lessonId: lesson.id,
                skill: 'speaking',
                taskId: lesson.speaking.filter((task) => !task.optional).at(-1)
                  ?.id,
              })
            }
          >
            练口语
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.primary}
          disabled={answered !== lesson.questions.length}
          onClick={submit}
        >
          确认
        </button>
      )}
    </aside>
  );
}
