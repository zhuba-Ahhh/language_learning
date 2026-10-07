import { useTraining } from '@/study/trainingContext';
import styles from '../index.module.less';

export default function KanaHistory() {
  const { data } = useTraining();
  if (data.language !== 'ja' || !data.kanaResults?.length) return null;
  return (
    <details className={styles.settings}>
      <summary>假名练习 · {data.kanaResults.length} 次</summary>
      {data.kanaResults.map((result) => (
        <p key={result.id}>
          {result.group} · {result.script === 0 ? '平假名' : '片假名'} ·{' '}
          {result.correct}/{result.total} ·{' '}
          {new Date(result.completedAt).toLocaleDateString('zh-CN')}
        </p>
      ))}
    </details>
  );
}
