import { useEffect, useState } from 'react';
import { getRecording } from '@/lib/recordings';

export default function AudioHistory({ id }: { id: string }) {
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    let url = '';
    getRecording(id)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setError('这段录音未保存在当前浏览器，可从完整备份恢复。');
          return;
        }
        url = URL.createObjectURL(blob);
        setSource(url);
      })
      .catch(() => {
        if (!cancelled) setError('录音读取失败，请检查浏览器存储权限。');
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return source ? (
    <audio
      controls
      preload="metadata"
      src={source}
      aria-label="已保存的练习录音"
    />
  ) : (
    <p role="status">{error || '读取录音…'}</p>
  );
}
