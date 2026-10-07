import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useRecorder } from '../src/features/training/Speaking/useRecorder';
import { getRecording, saveRecording } from '../src/lib/recordings';
import {
  createTrainingBackup,
  readTrainingBackup,
} from '../src/study/trainingBackup';
import { initialTrainingData, saveResult } from '../src/study/trainingState';
import { LESSONS } from '../src/content/training';

// Runs only on this developer fixture. It produces a synthetic stream,
// requests no microphone permission, and uses an isolated browser origin.
let audioContext: AudioContext | undefined;
navigator.mediaDevices.getUserMedia = async () => {
  audioContext = new AudioContext();
  const output = audioContext.createMediaStreamDestination();
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = 440;
  oscillator.connect(output);
  oscillator.start();
  await audioContext.resume();
  return output.stream;
};

export default function RecordingCheck() {
  const recorder = useRecorder(2);
  const [message, setMessage] = useState('等待验证');
  const [source, setSource] = useState('');
  useEffect(() => {
    let url = '';
    let cancelled = false;
    const id = localStorage.getItem('linguadesk-recording-fixture');
    if (id)
      getRecording(id)
        .then((blob) => {
          if (cancelled) return;
          if (!blob) throw new Error('missing recording');
          url = URL.createObjectURL(blob);
          setSource(url);
          setMessage(`刷新恢复通过：${blob.size} 字节，${blob.type}`);
        })
        .catch(() => {
          if (!cancelled) setMessage('刷新恢复失败');
        });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);
  const check = async () => {
    try {
      if (!recorder.blob) throw new Error('no recording');
      const id = `fixture-${crypto.randomUUID()}`;
      await saveRecording(id, recorder.blob);
      const lesson = LESSONS[0];
      const data = saveResult(structuredClone(initialTrainingData), {
        id: 'fixture-result',
        lessonId: lesson.id,
        lang: lesson.lang,
        skill: 'speaking',
        taskId: lesson.speaking[0].id,
        recordingId: id,
        assessment: 'ready',
        completedAt: new Date().toISOString(),
        durationMs: recorder.duration.current,
      });
      const backup = await createTrainingBackup(data);
      if (!backup.audio[id] || backup.missingRecordings.length)
        throw new Error('backup missing');
      const restored = await readTrainingBackup(
        JSON.parse(JSON.stringify(backup)),
      );
      const blob = await getRecording(id);
      if (
        !blob ||
        blob.size !== recorder.blob.size ||
        restored.results[0].recordingId !== id
      )
        throw new Error('restore mismatch');
      localStorage.setItem('linguadesk-recording-fixture', id);
      await audioContext?.close();
      setMessage(`录制、保存、备份、恢复通过：${blob.size} 字节，${blob.type}`);
    } catch (error) {
      setMessage(`验证失败：${String(error)}`);
    }
  };
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 30, maxWidth: 700 }}>
      <h1>录音存储验证</h1>
      <p>合成音频测试，不使用真实麦克风。</p>
      <p>
        状态：{recorder.status} · {recorder.seconds} 秒
      </p>
      <button type="button" onClick={() => void recorder.start()}>
        生成两秒测试录音
      </button>
      {recorder.blob && (
        <button type="button" onClick={() => void check()}>
          验证保存与完整备份
        </button>
      )}
      <p role="status">{recorder.error || message}</p>
      {recorder.url && <audio controls src={recorder.url} />}
      {source && <audio controls src={source} />}
      <button type="button" onClick={() => location.reload()}>
        刷新并恢复录音
      </button>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<RecordingCheck />);
