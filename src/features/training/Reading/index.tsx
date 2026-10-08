import { useState } from 'react';
import type { Lesson } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import { stopSpeak } from '@/lib/speech';
import ReadingQuestions from './ReadingQuestions';
import GrammarPractice from './GrammarPractice';
import ListeningPractice from './ListeningPractice';
import InteractiveReader from '../components/InteractiveReader';
import type { TrainingSelection } from '../types';
import styles from '../index.module.less';

export default function Reading({
  lesson,
  onBack,
  onOpen,
  initialPanel = 'text',
}: {
  lesson: Lesson;
  onBack: () => void;
  onOpen: (selection: TrainingSelection) => void;
  initialPanel?: TrainingSelection['panel'];
}) {
  const { data, addWord } = useTraining();
  const [translation, setTranslation] = useState(false);
  const [ruby, setRuby] = useState(lesson.lang === 'ja');
  const [startedAt] = useState(Date.now);
  const [activeParagraph, setActiveParagraph] = useState(0);
  const [playerTarget, setPlayerTarget] = useState<HTMLDivElement | null>(null);
  const [panel, setPanel] = useState(initialPanel);

  return (
    <div>
      <button type="button" className={styles.back} onClick={onBack}>
        ‹ 阅读目录
      </button>
      <div className={styles.trainingHeader}>
        <div>
          <p>{lesson.stage}</p>
          <h1>{lesson.title}</h1>
        </div>
        <span>{lesson.minutes} 分钟</span>
      </div>
      <div className={styles.readingTabs}>
        <button
          type="button"
          aria-pressed={panel === 'text'}
          onClick={() => {
            stopSpeak();
            setPanel('text');
          }}
        >
          正文
        </button>
        <button
          type="button"
          aria-pressed={panel === 'questions'}
          onClick={() => {
            stopSpeak();
            setPanel('questions');
          }}
        >
          理解
        </button>
        {(['grammar', 'listening'] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={panel === item}
            onClick={() => {
              stopSpeak();
              setPanel(item);
            }}
          >
            {item === 'grammar' ? '句型' : '精听'}
          </button>
        ))}
      </div>
      {/* 同一单元保持表单挂载，切换页签不丢未提交的答案。 */}
      <div hidden={panel !== 'grammar'}>
        <GrammarPractice lesson={lesson} onOpen={onOpen} />
      </div>
      <div hidden={panel !== 'listening'}>
        <ListeningPractice lesson={lesson} />
      </div>
      <div hidden={panel === 'grammar' || panel === 'listening'}>
        <div
          className={`${styles.readingLayout} ${panel === 'text' ? styles.readingShowText : styles.readingShowQuestions}`}
        >
          <article className={styles.readingPaper}>
            <div className={styles.readingTools}>
              <span>正文</span>
              <div>
                {lesson.lang === 'ja' && (
                  <button
                    type="button"
                    aria-pressed={ruby}
                    onClick={() => setRuby((value) => !value)}
                  >
                    读音
                  </button>
                )}
                <button
                  type="button"
                  aria-pressed={translation}
                  onClick={() => setTranslation((value) => !value)}
                >
                  译文
                </button>
              </div>
            </div>
            <h2 lang={lesson.lang}>{lesson.subtitle}</h2>
            {lesson.paragraphs.map((paragraph, index) => (
              <section
                key={index}
                id={`paragraph-${index + 1}`}
                className={styles.readingParagraph}
              >
                <div className={styles.paragraphLabel}>
                  <span>段落 {index + 1}</span>
                </div>
                <InteractiveReader
                  text={paragraph.text}
                  lesson={lesson}
                  ruby={ruby ? paragraph.ruby : undefined}
                  label={`段落 ${index + 1}`}
                  active={activeParagraph === index}
                  controlsTarget={playerTarget}
                  onActivate={() => {
                    if (activeParagraph !== index) stopSpeak();
                    setActiveParagraph(index);
                  }}
                />
                {translation && (
                  <p className={styles.translation}>{paragraph.translation}</p>
                )}
              </section>
            ))}
            <details className={styles.pattern}>
              <summary>句型</summary>
              <strong lang={lesson.lang}>{lesson.pattern.form}</strong>
              <p>{lesson.pattern.meaning}</p>
              <InteractiveReader
                text={lesson.pattern.example}
                lesson={lesson}
                label="句型例句"
              />
            </details>
            <details className={styles.wordSection}>
              <summary>词汇 · {lesson.words.length}</summary>
              <div className={styles.wordChips}>
                {lesson.words.map((word) => {
                  const saved = data.savedWords.some(
                    (item) => item.key === `${lesson.lang}:${word.term}`,
                  );
                  return (
                    <button
                      type="button"
                      key={word.id}
                      disabled={saved}
                      onClick={() => addWord(lesson, word)}
                    >
                      <strong lang={lesson.lang}>{word.term}</strong>
                      {word.reading && <small>{word.reading}</small>}
                      <span>{saved ? '已加入复习' : `${word.meaning} ＋`}</span>
                    </button>
                  );
                })}
              </div>
            </details>
            <small className={styles.source}>{lesson.source}</small>
            <div className={styles.readerDock}>
              <small>段落 {activeParagraph + 1}</small>
              <div ref={setPlayerTarget} />
            </div>
          </article>
          <ReadingQuestions
            lesson={lesson}
            startedAt={startedAt}
            onOpen={onOpen}
            onShowText={() => setPanel('text')}
          />
        </div>
      </div>
    </div>
  );
}
