/** 用当月纸质日历展示打卡记录。 */
import styles from './index.module.less';
import { todayStr } from '@/lib/date';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MonthCalendar({ checkins }: { checkins: string[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const checked = new Set(checkins);
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );

  return (
    <section
      className={styles.calendar}
      aria-label={`${year}年${month + 1}月学习日历`}
    >
      <span
        className={`${styles.ring} ${styles.ringLeft}`}
        aria-hidden="true"
      />
      <span
        className={`${styles.ring} ${styles.ringRight}`}
        aria-hidden="true"
      />
      <h2>
        {year}年&nbsp; {month + 1}月
      </h2>
      <table>
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th key={weekday} scope="col">
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (!day) return <td key={`empty-${dayIndex}`} />;
                const date = dateKey(year, month, day);
                const active = checked.has(date);
                const today = date === todayStr();
                return (
                  <td key={date}>
                    <span
                      title={`${date}${active ? ' · 已学习' : ''}`}
                      aria-label={`${month + 1}月${day}日${active ? '，已学习' : ''}`}
                      className={`${styles.day} ${active ? styles.active : ''} ${today ? styles.today : ''}`}
                    >
                      {active ? (
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="m3 8.2 3 3L13 4.8" />
                        </svg>
                      ) : (
                        day
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
