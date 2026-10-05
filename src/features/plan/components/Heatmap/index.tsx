/** 展示近 15 周的打卡记录，按周排列并标记今天。 */
import { todayStr } from '@/study/useStudyState';

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
    <div className="rounded-[1.4rem] bg-white soft-shadow px-5 sm:px-6 py-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ink">打卡热力图</h2>
        <span className="font-mono2 text-[11px] text-muted-foreground">近 15 周</span>
      </div>
      <div className="mt-4 flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell, di) =>
              cell ? (
                <span
                  key={cell.date}
                  title={`${cell.date}${cell.active ? ' · 已打卡' : ''}`}
                  className={`h-3 w-3 rounded-[3px] transition-colors ${
                    cell.active ? 'bg-aqua' : 'bg-sand'
                  } ${cell.date === todayStr() ? 'ring-2 ring-deepblue ring-offset-1' : ''}`}
                />
              ) : (
                <span key={`pad-${di}`} className="h-3 w-3" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        少
        <span className="h-3 w-3 rounded-[3px] bg-sand" />
        <span className="h-3 w-3 rounded-[3px] bg-aqua" />
        多
      </div>
    </div>
  );
}
