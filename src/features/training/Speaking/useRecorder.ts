import { useEffect, useRef, useState } from 'react';

export const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export function useRecorder(limit: number) {
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'recording' | 'ready'
  >('idle');
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob>();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const active = useRef(true);
  const started = useRef(0);
  const duration = useRef(0);
  const audioUrl = useRef('');

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    };
  }, []);

  useEffect(() => {
    if (status !== 'recording') return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      setSeconds(elapsed);
      if (elapsed >= limit && recorder.current?.state === 'recording')
        recorder.current.stop();
    }, 250);
    return () => clearInterval(timer);
  }, [status, limit]);

  const start = async () => {
    if (status === 'requesting' || status === 'recording') return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('此浏览器不支持录音，请使用支持麦克风的浏览器。');
      return;
    }
    setStatus('requesting');
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (!active.current) {
        microphone.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = microphone;
      const recording = new MediaRecorder(microphone);
      recorder.current = recording;
      const chunks: Blob[] = [];
      recording.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recording.onerror = () => {
        microphone.getTracks().forEach((track) => track.stop());
        if (active.current) {
          setError('录音中断，请检查麦克风后重新录制。');
          setStatus('idle');
        }
      };
      recording.onstop = () => {
        microphone.getTracks().forEach((track) => track.stop());
        stream.current = null;
        if (!active.current) return;
        const result = new Blob(chunks, { type: recording.mimeType });
        duration.current = Date.now() - started.current;
        if (!result.size) {
          setError('没有录到声音，请重新录制。');
          setStatus('idle');
          return;
        }
        if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
        audioUrl.current = URL.createObjectURL(result);
        setBlob(result);
        setUrl(audioUrl.current);
        setStatus('ready');
        setSeconds(Math.round(duration.current / 1000));
      };
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
      audioUrl.current = '';
      setUrl('');
      setBlob(undefined);
      setSeconds(0);
      started.current = Date.now();
      recording.start();
      setStatus('recording');
      return true;
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      if (active.current) {
        setError('无法使用麦克风，请检查本站麦克风权限和设备连接。');
        setStatus('idle');
      }
    }
  };

  const stop = () => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  };
  return { status, seconds, blob, url, error, start, stop, duration };
}
