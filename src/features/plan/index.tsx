/** 展示 30 天计划与打卡统计，复用共享任务列表。 */
import { useState } from 'react';
import { FOCUS_LABEL, PLAN } from '@/content/plan';
import { useStudy } from '@/study/useStudyState';
import TaskList from '@/study/components/TaskList';
import Heatmap from './components/Heatmap';

const FOCUS_DOT: Record<string, string> = {
  EN: 'bg-deepblue',
  JP: 'bg-aqua',
  RV: 'bg-navy',
};

export default function PlanSection() {
  const { dayIndex, checks, toggleTask, checkins, streak, resetAll } = useStudy();
  const [openDay, setOpenDay] = useState<number>(dayIndex);

  const completedDays = PLAN.filter((p) => (checks[p.day] ?? []).length === p.tasks.length).length;

  return (
    <div className="space-y-6">
      <header className="reveal">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-aqua">30-Day Roadmap</p>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl text-ink">30 天计划</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          单日英语、双日日语，周日复盘。已完成 {completedDays} / 30 天。
        </p>
        <button
          onClick={() => {
            if (window.confirm('确定要清空所有打卡和单词记录，从第 1 天重新开始吗？')) {
              resetAll();
            }
          }}
          className="mt-3 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-destructive transition-colors"
        >
          重置全部进度
        </button>
      </header>

      <div className="reveal grid gap-3 sm:grid-cols-[1fr_auto]">
        <Heatmap checkins={checkins} />
        <div className="flex sm:flex-col items-center justify-center gap-1 rounded-[1.4rem] bg-navy text-white px-6 py-4 soft-shadow">
          <span className="font-display text-3xl sm:text-4xl">{streak}</span>
          <span className="text-[11px] tracking-widest text-white/70">连续打卡（天）</span>
        </div>
      </div>

      <div className="reveal space-y-2.5">
        {PLAN.map((p) => {
          const done = checks[p.day] ?? [];
          const complete = done.length === p.tasks.length;
          const isToday = p.day === dayIndex;
          const open = openDay === p.day;
          return (
            <div
              key={p.day}
              className={`overflow-hidden rounded-[1.4rem] transition-all duration-300 ${
                isToday
                  ? 'bg-navy text-white soft-shadow-lg'
                  : complete
                    ? 'bg-aqua/10'
                    : 'bg-white soft-shadow'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenDay(open ? 0 : p.day)}
                className="flex w-full items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 text-left"
              >
                <span
                  className={`font-mono2 text-xs sm:text-sm w-10 shrink-0 ${
                    isToday ? 'text-powder' : 'text-muted-foreground'
                  }`}
                >
                  D{String(p.day).padStart(2, '0')}
                </span>
                <span className={`h-2 w-2 shrink-0 rounded-full ${FOCUS_DOT[p.focus]}`} />
                <span className="flex-1 min-w-0">
                  <span
                    className={`block truncate text-sm sm:text-base font-medium ${
                      isToday ? 'text-white' : complete ? 'text-muted-foreground' : 'text-ink'
                    }`}
                  >
                    {p.title}
                  </span>
                  <span
                    className={`text-[11px] ${isToday ? 'text-white/60' : 'text-muted-foreground'}`}
                  >
                    {FOCUS_LABEL[p.focus]} · {p.tasks.reduce((n, t) => n + t.minutes, 0)} 分钟
                  </span>
                </span>
                {complete ? (
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-aqua">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  isToday && (
                    <span className="shrink-0 rounded-full bg-aqua px-3 py-1 text-[10px] font-bold tracking-widest text-white">
                      今天
                    </span>
                  )
                )}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${
                    isToday ? 'text-white/70' : 'text-muted-foreground'
                  }`}
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {open && (
                <TaskList
                  tasks={p.tasks}
                  done={done}
                  onToggle={(i) => toggleTask(p.day, i, p.tasks.length)}
                  variant="plan"
                  dark={isToday}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
