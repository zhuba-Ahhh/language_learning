/** 展示近 15 周的打卡记录，按周排列并标记今天。 */
import styles from './index.module.less';
import { todayStr } from '@/lib/date';

export default function Heatmap({ checkins }: { checkins: string[] }) {
  const set = new Set(checkins);
  const days: { date: string; active: boolean }[] = [];
  for (let i = 104; i >= 0; i--) {
    const d = todayStr(-i);
    days.push({ date: d, active: set.has(d) });
  }
  const first = new Date(days[0].date);
  const pad = (first.getDay() + 6) % 7;
  const cells: ({ date: string; active: boolean } | null)[] = [
    ...Array<null>(pad).fill(null),
    ...days,
  ];
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className={styles.heatmap}>
      <div className={styles.heading}>
        <h2 className={styles.title}>最近练习</h2>
        <span className={styles.period}>15 周</span>
      </div>
      <div className={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.week}>
            {week.map((cell, di) =>
              cell ? (
                <span
                  key={cell.date}
                  title={`${cell.date}${cell.active ? ' · 已打卡' : ''}`}
                  className={`${styles.cell} ${
                    cell.active ? styles.active : styles.inactive
                  } ${cell.date === todayStr() ? styles.today : ''}`}
                />
              ) : (
                <span key={`pad-${di}`} className={styles.spacer} />
              ),
            )}
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        少
        <span className={styles.emptySample} />
        <span className={styles.activeSample} />多
      </div>
    </div>
  );
}
