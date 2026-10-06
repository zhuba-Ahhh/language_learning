/** 在当前页完成文章阅读、生词收集与理解题。 */
import { useState } from 'react';
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import SpeakButton from '@/components/SpeakButton';
import type { PlanTask } from '@/content/plan';
import { READING_GROUPS, type ReadingResource } from '@/content/reading';
import { useStudy } from '@/study/useStudy';

const LEVEL_STYLE: Record<number, { label: string; cls: string }> = {
  1: { label: '入门', cls: styles.beginner },
  2: { label: '进阶', cls: styles.intermediate },
  3: { label: '高级', cls: styles.advanced },
};

function ArticleReader({
  resource,
  lang,
  onBack,
  onComplete,
}: {
  resource: ReadingResource;
  lang: 'en' | 'ja';
  onBack: () => void;
  onComplete?: () => void;
}) {
  const { customWords, addCustomWord } = useStudy();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const answered = Object.keys(answers).length;
  const correct = resource.questions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;

  return (
    <article className={styles.reader}>
      <button type="button" onClick={onBack} className={styles.back}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m14 6-6 6 6 6" />
        </svg>
        文章
      </button>

      <header className={styles.articleHeader}>
        <div className={styles.meta}>
          <span className={LEVEL_STYLE[resource.level].cls}>
            {LEVEL_STYLE[resource.level].label}
          </span>
          <span>{resource.minutes} 分钟</span>
        </div>
        <h1 lang={lang === 'ja' ? 'ja' : undefined}>{resource.name}</h1>
        <p>{resource.desc}</p>
      </header>

      <div className={styles.paper}>
        <div className={styles.paragraphs}>
          {resource.paragraphs.map((paragraph, index) => (
            <div key={paragraph} className={styles.paragraphRow}>
              <span className={styles.paragraphNumber}>{index + 1}</span>
              <p lang={lang === 'ja' ? 'ja' : undefined}>{paragraph}</p>
              <SpeakButton
                text={paragraph}
                lang={lang}
                tone="muted"
                size={34}
              />
            </div>
          ))}
        </div>

        <section className={styles.words} aria-labelledby="reading-words">
          <h2 id="reading-words">生词</h2>
          <div className={styles.wordList}>
            {resource.vocabulary.map((word) => {
              const saved = customWords.some(
                (item) =>
                  item.lang === lang &&
                  item.term.toLocaleLowerCase() ===
                    word.term.toLocaleLowerCase(),
              );
              return (
                <button
                  type="button"
                  key={word.term}
                  disabled={saved}
                  onClick={() => addCustomWord({ lang, ...word })}
                  className={styles.word}
                >
                  <span>
                    <strong lang={lang === 'ja' ? 'ja' : undefined}>
                      {word.term}
                    </strong>
                    {word.reading && <small>{word.reading}</small>}
                  </span>
                  <span>{saved ? '已加入' : word.meaning}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className={styles.quiz} aria-labelledby="reading-quiz">
        <div className={styles.quizHeading}>
          <h2 id="reading-quiz">读完答两题</h2>
          <span>
            {submitted
              ? `${correct} / ${resource.questions.length}`
              : `${answered} / ${resource.questions.length}`}
          </span>
        </div>

        {resource.questions.map((question, questionIndex) => (
          <fieldset key={question.id} className={styles.question}>
            <legend>
              {questionIndex + 1}. {question.prompt}
            </legend>
            <div className={styles.options}>
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                const state = submitted
                  ? optionIndex === question.answer
                    ? styles.correct
                    : selected
                      ? styles.wrong
                      : ''
                  : selected
                    ? styles.optionSelected
                    : '';
                return (
                  <button
                    type="button"
                    key={option}
                    disabled={submitted}
                    aria-pressed={selected}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: optionIndex,
                      }))
                    }
                    className={`${styles.option} ${state}`}
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className={styles.explanation}>{question.explanation}</p>
            )}
          </fieldset>
        ))}

        <button
          type="button"
          className={styles.submit}
          disabled={answered !== resource.questions.length || submitted}
          onClick={() => {
            setSubmitted(true);
            onComplete?.();
          }}
        >
          {submitted
            ? `完成 · ${correct}/${resource.questions.length}`
            : answered === resource.questions.length
              ? '查看结果'
              : `还差 ${resource.questions.length - answered} 题`}
        </button>
      </section>
    </article>
  );
}

export default function ReadingSection({
  task,
  onComplete,
}: {
  task?: PlanTask;
  onComplete?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const groupIds = task?.activity.resourceGroupIds;
  const resourceNames = task?.activity.resourceNames;
  const groups = READING_GROUPS.filter((group) =>
    groupIds ? groupIds.includes(group.id) : group.courseOnly !== true,
  )
    .map((group) => ({
      ...group,
      resources: group.resources.filter(
        (resource) => !resourceNames || resourceNames.includes(resource.name),
      ),
    }))
    .filter((group) => group.resources.length > 0);
  const selected = groups
    .flatMap((group) =>
      group.resources.map((resource) => ({
        resource,
        lang: group.lang,
      })),
    )
    .find(({ resource }) => resource.id === selectedId);

  if (selected) {
    return (
      <ArticleReader
        key={selected.resource.id}
        resource={selected.resource}
        lang={selected.lang}
        onBack={() => setSelectedId(null)}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className={styles.section}>
      <FeatureHeader title="慢慢读懂" />

      {groups.map((group) => (
        <section key={group.id} className={styles.group}>
          <div className={styles.groupHeading}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            <span className={styles.subtitle}>
              {group.lang === 'ja' ? '日语' : '英语'}
            </span>
          </div>
          <ul className={styles.resources}>
            {group.resources.map((resource) => (
              <li key={resource.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(resource.id)}
                  className={styles.resource}
                >
                  <span className={styles.content}>
                    <span className={styles.resourceHeading}>
                      <span
                        lang={group.lang === 'ja' ? 'ja' : undefined}
                        className={styles.name}
                      >
                        {resource.name}
                      </span>
                      <span
                        className={`${styles.level} ${LEVEL_STYLE[resource.level].cls}`}
                      >
                        {LEVEL_STYLE[resource.level].label}
                      </span>
                    </span>
                    <span className={styles.desc}>{resource.desc}</span>
                  </span>
                  <span className={styles.duration}>
                    {resource.minutes} min
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={styles.arrow}
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
