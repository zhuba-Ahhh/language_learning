/** 口语练习保持一个动作流：听一句，再录一句。 */
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import SpeakButton from '@/components/SpeakButton';
import { SCENARIOS } from '@/content/speaking';

export default function SpeakingSection() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

  const scenario = SCENARIOS.find((item) => item.id === scenarioId)!;
  const sentence = scenario.sentences[sentenceIndex];

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const stopRecording = () => recorderRef.current?.stop();

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('当前浏览器不支持录音');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunksRef.current));
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setRecordingUrl(url);
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError('请允许麦克风权限');
    }
  };

  const selectScenario = (id: string) => {
    setScenarioId(id);
    setSentenceIndex(0);
  };

  const nextSentence = () => {
    setSentenceIndex((index) => (index + 1) % scenario.sentences.length);
  };

  return (
    <div className={styles.section}>
      <FeatureHeader title="先说出来" />

      <div className={`reveal ${styles.scenarioScroller}`}>
        <div className={styles.scenarioList}>
          {SCENARIOS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => selectScenario(item.id)}
              className={`${styles.scenarioChip} ${
                item.id === scenarioId ? styles.selected : styles.idle
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <section className={`reveal ${styles.sheet}`}>
        <span className={styles.tape} aria-hidden="true" />
        <div className={styles.counter}>
          {sentenceIndex + 1} / {scenario.sentences.length}
        </div>
        <p
          lang={scenario.lang === 'ja' ? 'ja' : undefined}
          className={styles.prompt}
        >
          {sentence.text}
        </p>
        <p className={styles.translation}>{sentence.zh}</p>

        <div className={styles.controls}>
          <div className={styles.listen}>
            <SpeakButton text={sentence.text} lang={scenario.lang} size={44} />
            <span>听一遍</span>
          </div>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`${styles.record} ${recording ? styles.recording : ''}`}
            aria-pressed={recording}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="8" y="3" width="8" height="12" rx="4" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
            </svg>
            <span>{recording ? '停止' : '录音'}</span>
          </button>
        </div>

        {recordingUrl && !recording && (
          <audio className={styles.audio} controls src={recordingUrl} />
        )}
        {error && <p className={styles.error}>{error}</p>}

        <button type="button" onClick={nextSentence} className={styles.next}>
          下一句
        </button>
      </section>
    </div>
  );
}
