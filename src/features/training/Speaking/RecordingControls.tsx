import TrainingIcon from '@/components/TrainingIcon';
import type { useRecorder } from './useRecorder';
import { formatClock } from './useRecorder';
import styles from '../index.module.less';

export default function RecordingControls({
  recorder,
  limit,
  preparation,
  saving,
  onStart,
}: {
  recorder: ReturnType<typeof useRecorder>;
  limit: number;
  preparation: number;
  saving: boolean;
  onStart: () => void;
}) {
  return (
    <div className={styles.recorder}>
      <div className={styles.waveform} aria-hidden="true">
        {Array.from({ length: 25 }, (_, index) => (
          <i
            key={index}
            style={{ height: `${12 + ((index * 13) % 35)}px` }}
            className={recorder.status === 'recording' ? styles.waveActive : ''}
          />
        ))}
      </div>
      <span className={styles.recordClock}>
        {formatClock(recorder.seconds)}
        <small> / {formatClock(limit)}</small>
      </span>
      <button
        type="button"
        className={`${styles.recordButton} ${recorder.status === 'recording' ? styles.recording : ''}`}
        disabled={recorder.status === 'requesting' || preparation > 0 || saving}
        onClick={recorder.status === 'recording' ? recorder.stop : onStart}
      >
        <TrainingIcon name="speaking" />
        {recorder.status === 'requesting'
          ? '连接麦克风…'
          : recorder.status === 'recording'
            ? '停止录音'
            : recorder.url
              ? '重新录制'
              : '开始录音'}
      </button>
      <p>
        {recorder.status === 'recording'
          ? '到时自动停止'
          : '录音仅保存在此设备'}
      </p>
    </div>
  );
}
