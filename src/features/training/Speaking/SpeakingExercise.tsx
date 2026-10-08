import { useEffect, useRef, useState } from 'react';
import type { Lesson, SpeakingTask } from '@/content/training';
import { useTraining } from '@/study/trainingContext';
import { saveRecording } from '@/lib/recordings';
import { playAudio, speak, stopSpeak } from '@/lib/speech';
import AudioHistory from '../components/AudioHistory';
import type { PracticeResult } from '@/study/trainingTypes';
import SpeakingSample from './SpeakingSample';
import StudyArt from '../components/StudyArt';
import { formatClock, useRecorder } from './useRecorder';
import RecordingControls from './RecordingControls';
import styles from '../index.module.less';

export default function SpeakingExercise({
  lesson,
  task,
}: {
  lesson: Lesson;
  task: SpeakingTask;
}) {
  const { data, addResult, setDraftActive } = useTraining();
  const recorder = useRecorder(task.seconds);
  const [assessment, setAssessment] = useState<'again' | 'ready'>('again');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [prepareUntil, setPrepareUntil] = useState(0);
  const [preparation, setPreparation] = useState(0);
  const [checks, setChecks] = useState<
    NonNullable<PracticeResult['selfChecks']>
  >([]);
  const [savedId, setSavedId] = useState('');
  const ownAudio = useRef<HTMLAudioElement>(null);
  const previous = data.results.find(
    (result) =>
      result.lessonId === lesson.id &&
      result.taskId === task.id &&
      result.recordingId &&
      result.recordingId !== savedId,
  );

  useEffect(() => {
    if (!prepareUntil) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((prepareUntil - Date.now()) / 1000),
      );
      setPreparation(remaining);
      if (!remaining) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [prepareUntil]);

  useEffect(
    () => () => {
      stopSpeak();
      setDraftActive(false);
    },
    [setDraftActive],
  );

  const startRecording = async () => {
    if (
      recorder.url &&
      !saved &&
      !window.confirm('重新录制会放弃这段未保存的录音，继续吗？')
    )
      return;
    setSaved(false);
    setSaveError('');
    setChecks([]);
    setSavedId('');
    setDraftActive(true);
    stopSpeak();
    const started = await recorder.start();
    if (!started) setDraftActive(false);
  };
  const save = async () => {
    if (!recorder.blob || saved || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const id = crypto.randomUUID();
      await saveRecording(id, recorder.blob);
      addResult({
        lessonId: lesson.id,
        lang: lesson.lang,
        skill: 'speaking',
        taskId: task.id,
        recordingId: id,
        durationMs: recorder.duration.current,
        assessment,
        selfChecks: checks,
      });
      setSavedId(id);
      setSaved(true);
      setDraftActive(false);
    } catch {
      setSaveError('录音保存失败，请检查浏览器存储空间。当前录音仍可回听。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.speakingPaper}>
      <StudyArt name="microphone" className={styles.speakingArt} />
      <div className={styles.exerciseMeta}>
        <span>
          {task.mode === 'shadow'
            ? '跟读'
            : task.mode === 'retell'
              ? '复述'
              : '自由回答'}
        </span>
        <span>{task.seconds} 秒</span>
      </div>
      <h2>{task.title}</h2>
      <p className={styles.speakingPrompt} lang={lesson.lang}>
        {task.prompt}
      </p>
      <ul className={styles.hints}>
        {task.hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
      <SpeakingSample task={task} lesson={lesson} />
      <section className={styles.speakingChecklist} aria-label="口语自检">
        <h3>听一遍，再改一处</h3>
        <div>
          {(
            [
              ['pause', '停顿自然'],
              ['message', '信息完整'],
              ['pattern', '用上句式'],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={checks.includes(key)}
                disabled={saved || recorder.status === 'recording'}
                onChange={(event) =>
                  setChecks((current) =>
                    event.target.checked
                      ? [...current, key]
                      : current.filter((item) => item !== key),
                  )
                }
              />
              {label}
            </label>
          ))}
        </div>
        <small>回听后自检，不是自动发音评分。</small>
      </section>
      {task.prepareSeconds && (
        <div className={styles.preparation}>
          <p>
            {preparation
              ? `准备时间 ${formatClock(preparation)}`
              : `准备 ${task.prepareSeconds} 秒`}
          </p>
          <button
            type="button"
            disabled={recorder.status === 'recording'}
            onClick={() => {
              if (preparation) {
                setPrepareUntil(0);
                setPreparation(0);
              } else {
                setPrepareUntil(Date.now() + task.prepareSeconds! * 1000);
                setPreparation(task.prepareSeconds!);
              }
            }}
          >
            {preparation ? '结束准备' : '开始准备'}
          </button>
        </div>
      )}
      <RecordingControls
        recorder={recorder}
        limit={task.seconds}
        preparation={preparation}
        saving={saving}
        onStart={startRecording}
      />
      {(recorder.error || saveError) && (
        <p role="alert" className={styles.error}>
          {recorder.error || saveError}
        </p>
      )}
      {recorder.url && (
        <div className={styles.recordFeedback}>
          <h3>回听与自评</h3>
          <audio
            ref={ownAudio}
            controls
            src={recorder.url}
            aria-label="本次练习录音"
          />
          <div className={styles.drillActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                ownAudio.current?.pause();
                void speak(task.sample, lesson.lang).catch(() =>
                  setSaveError('示范加载失败，请重试。'),
                );
              }}
            >
              听示范
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                if (ownAudio.current)
                  void playAudio(ownAudio.current).catch(() =>
                    setSaveError('录音播放失败，请重试。'),
                  );
              }}
            >
              听自己
            </button>
          </div>
          <div className={styles.selfAssessment}>
            <button
              type="button"
              aria-pressed={assessment === 'again'}
              disabled={saved}
              onClick={() => setAssessment('again')}
            >
              再练
            </button>
            <button
              type="button"
              aria-pressed={assessment === 'ready'}
              disabled={saved}
              onClick={() => setAssessment('ready')}
            >
              熟悉
            </button>
          </div>
          <button
            type="button"
            className={styles.primary}
            disabled={saved || saving}
            onClick={() => void save()}
          >
            {saved ? '已保存' : saving ? '保存中…' : '保存'}
          </button>
          {saved && (
            <p role="status">
              {assessment === 'again'
                ? '已保存并加入复习。'
                : '已保存，可随时回听。'}
            </p>
          )}
        </div>
      )}
      {previous?.recordingId && (
        <details className={styles.historyDetails}>
          <summary>对照上一次录音</summary>
          <AudioHistory id={previous.recordingId} />
        </details>
      )}
    </section>
  );
}
