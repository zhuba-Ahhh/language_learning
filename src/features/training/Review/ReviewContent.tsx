import type { Lesson } from '@/content/training';
import type { ReviewItem } from '@/study/trainingTypes';
import SpeakButton from '@/components/SpeakButton';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';
import { GRAMMAR } from '@/content/training/grammar';

export default function ReviewContent({
  item,
  lesson,
  revealed,
  onOpen,
}: {
  item: ReviewItem;
  lesson: Lesson;
  revealed: boolean;
  onOpen: (selection: TrainingSelection) => void;
}) {
  return (
    <>
      {item.kind === 'word' &&
        (() => {
          const word = lesson.words.find((word) => word.id === item.contentId)!;
          const terms = [
            word.term,
            ...(lesson.marks ?? [])
              .filter((mark) => mark.wordId === word.id)
              .map((mark) => mark.text),
          ];
          const paragraph = lesson.paragraphs.find((paragraph) =>
            terms.some((term) =>
              paragraph.text
                .toLocaleLowerCase()
                .includes(term.toLocaleLowerCase()),
            ),
          );
          const context = paragraph?.text
            .split(/(?<=[.!?。！？])\s*/u)
            .find((sentence) =>
              terms.some((term) =>
                sentence.toLocaleLowerCase().includes(term.toLocaleLowerCase()),
              ),
            );
          return (
            <>
              <h2 lang={lesson.lang}>{word.term}</h2>
              <SpeakButton text={word.term} lang={lesson.lang} size={38} />
              {revealed && (
                <div className={styles.reviewAnswer}>
                  {word.reading && <small>{word.reading}</small>}
                  <p>{word.meaning}</p>
                  {context && (
                    <blockquote lang={lesson.lang}>{context}</blockquote>
                  )}
                </div>
              )}
            </>
          );
        })()}
      {(item.kind === 'question' || item.kind === 'grammar') &&
        (() => {
          const question = (
            item.kind === 'grammar'
              ? GRAMMAR[lesson.id].questions
              : lesson.questions
          ).find((q) => q.id === item.contentId)!;
          return (
            <>
              <h2>{question.prompt}</h2>
              {revealed && (
                <div className={styles.reviewAnswer}>
                  <strong>{question.answer}</strong>
                  <p>{question.explanation}</p>
                  <blockquote lang={lesson.lang}>
                    {item.kind === 'grammar'
                      ? lesson.pattern.example
                      : lesson.paragraphs[question.evidence].text}
                  </blockquote>
                </div>
              )}
            </>
          );
        })()}
      {item.kind === 'listening' && (
        <>
          <h2>听清这一句</h2>
          <SpeakButton
            text={lesson.pattern.example}
            lang={lesson.lang}
            size={38}
          />
          {revealed && (
            <div className={styles.reviewAnswer}>
              <blockquote lang={lesson.lang}>
                {lesson.pattern.example}
              </blockquote>
              <p>{lesson.pattern.meaning}</p>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  onOpen({
                    lessonId: lesson.id,
                    skill: 'reading',
                    panel: 'listening',
                  })
                }
              >
                重新听写
              </button>
            </div>
          )}
        </>
      )}
      {item.kind === 'speaking' && (
        <>
          <h2>
            {lesson.speaking.find((task) => task.id === item.contentId)!.title}
          </h2>
          <p>
            {lesson.speaking.find((task) => task.id === item.contentId)!.prompt}
          </p>
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              onOpen({
                lessonId: lesson.id,
                skill: 'speaking',
                taskId: item.contentId,
              })
            }
          >
            去练口语
          </button>
        </>
      )}
    </>
  );
}
