/** 今日与计划共享的任务列表，完成状态与切换操作由上层管理。 */
import type { PlanTask } from '@/content/plan';

interface Props {
  tasks: PlanTask[];
  done: readonly number[];
  onToggle: (index: number) => void;
  variant: 'today' | 'plan';
  dark?: boolean;
}

export default function TaskList({ tasks, done, onToggle, variant, dark = false }: Props) {
  const today = variant === 'today';
  const iconSize = today ? 12 : 10;
  return (
    <ul className={today ? 'mt-6 divide-y divide-border' : `px-4 sm:px-6 pb-4 pt-1 space-y-1 border-t ${
      dark ? 'border-white/15' : 'border-border'
    }`}>
      {tasks.map((task, i) => {
        const checked = done.includes(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              className={today
                ? 'group flex w-full items-start gap-4 py-4 text-left'
                : 'flex w-full items-start gap-3 py-2.5 text-left'}
            >
              <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                today ? 'h-6 w-6 duration-300' : 'h-5 w-5'
              } ${
                checked ? 'border-aqua bg-aqua pop-in'
                  : today ? 'border-muted-foreground/40 group-hover:border-aqua'
                    : dark ? 'border-white/40' : 'border-muted-foreground/40'
              }`}>
                {checked && (
                  <svg width={iconSize} height={iconSize} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`flex-1 leading-relaxed ${
                today ? 'text-sm sm:text-base transition-colors' : 'text-xs sm:text-sm'
              } ${
                checked ? (today ? 'text-muted-foreground line-through' : 'line-through opacity-50')
                  : today ? 'text-ink' : dark ? 'text-white/90' : 'text-ink/80'
              }`}>
                {task.text}
              </span>
              <span className={`shrink-0 font-mono2 ${
                today ? 'text-[11px] text-muted-foreground pt-1'
                  : `text-[10px] pt-0.5 ${dark ? 'text-white/50' : 'text-muted-foreground'}`
              }`}>
                {task.minutes}min
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
