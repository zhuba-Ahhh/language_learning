/** 展示平片假名字表，沿用平假名文本朗读。 */
import styles from './index.module.less';
import { GOJUON, NASAL } from '@/content/kana';
import { speak, ttsSupported } from '@/lib/speech';

export default function KanaChart({ idx }: { idx: 0 | 1 }) {
  return (
    <div className={`reveal ${styles.chart}`}>
      {GOJUON.map((row) => (
        <div key={row.row} className={styles.row}>
          <span lang="ja" className={styles.rowLabel}>
            {row.row}
          </span>
          <div className={styles.cells}>
            {row.cells.map((cell, i) =>
              cell ? (
                <button
                  key={cell.romaji}
                  onClick={() => ttsSupported && speak(cell.kana[0], 'ja')}
                  className={styles.cell}
                >
                  <span lang="ja" className={styles.character}>
                    {cell.kana[idx]}
                  </span>
                  <span className={styles.reading}>{cell.romaji}</span>
                </button>
              ) : (
                <span key={`empty-${i}`} />
              ),
            )}
          </div>
        </div>
      ))}
      <div className={styles.row}>
        <span lang="ja" className={styles.rowLabel}>
          拨音
        </span>
        <button
          onClick={() => ttsSupported && speak(NASAL.kana[0], 'ja')}
          className={styles.nasal}
        >
          <span lang="ja" className={styles.character}>
            {NASAL.kana[idx]}
          </span>
          <span className={styles.nasalReading}>n</span>
        </button>
      </div>
    </div>
  );
}
