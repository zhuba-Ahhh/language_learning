/** 聚合今日计划、任务进度、统计与每日一句。 */
import { FOCUS_LABEL, PLAN } from '@/content/plan';
import { SCENARIOS } from '@/content/speaking';
import { TOTAL_WORDS } from '@/content/words';
import { useStudy } from '@/study/useStudyState';
import TaskList from '@/study/components/TaskList';
import SpeakButton from '@/components/SpeakButton';

function Ring({ percent, size = 84 }: { percent: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efece2" strokeWidth="10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#019e96"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent)}
        style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

const FOCUS_STYLE: Record<string, string> = {
  EN: 'bg-deepblue text-white',
  JP: 'bg-aqua text-white',
  RV: 'bg-navy text-white',
};

export default function TodaySection() {
  const { dayIndex, checks, toggleTask, streak, knownCount, startDate } = useStudy();
  const plan = PLAN[dayIndex - 1];
  const done = new Set(checks[plan.day] ?? []);
  const percent = plan.tasks.length ? done.size / plan.tasks.length : 0;

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekLabel = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()];

  // 每日一句：按当天日期确定性轮换；英语日推英语，日语日推日语
  const pool = SCENARIOS.filter((s) =>
    plan.focus === 'JP' ? s.lang === 'ja' : plan.focus === 'EN' ? s.lang === 'en' : true
  ).flatMap((s) => s.sentences.map((t) => ({ ...t, lang: s.lang })));
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = pool[dayOfYear % pool.length];

  return (
    <div className="space-y-6">
      {/* hero */}
      <section className="reveal relative overflow-hidden rounded-[2rem] bg-navy text-white px-6 py-8 sm:px-10 sm:py-12 soft-shadow-lg">
        <span className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-deepblue/60" />
        <span className="pointer-events-none absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-aqua/25" />
        <p className="font-mono2 text-[11px] sm:text-xs uppercase tracking-[0.3em] text-powder">
          Day {String(plan.day).padStart(2, '0')} / 30 · {dateLabel} · 星期{weekLabel}
        </p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl leading-[1.15]">
          开始今天的练习
        </h1>
        <p lang="ja" className="mt-3 text-sm sm:text-base text-white/70">
          今日も一歩前進しよう。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-widest ${FOCUS_STYLE[plan.focus]}`}
          >
            {FOCUS_LABEL[plan.focus]}
          </span>
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs tracking-widest text-white/90">
            {plan.title}
          </span>
        </div>
      </section>

      {/* 每日一句 */}
      <section className="reveal rounded-[1.4rem] bg-white soft-shadow px-5 sm:px-6 py-5 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-aqua">
            每日一句 · {quote.lang === 'ja' ? '日本語' : 'English'}
          </p>
          <p
            lang={quote.lang === 'ja' ? 'ja' : undefined}
            className="mt-2 text-base sm:text-lg font-semibold text-ink leading-relaxed"
          >
            {quote.text}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{quote.zh}</p>
        </div>
        <SpeakButton
          text={quote.text}
          lang={quote.lang}
          className="bg-sand text-navy hover:bg-powder/60 shrink-0"
          size={42}
        />
      </section>

      {/* stats */}
      <section className="reveal grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-[1.4rem] bg-white soft-shadow p-4 sm:p-6 flex flex-col items-center justify-center">
          <span className="font-display text-3xl sm:text-4xl text-deepblue">{streak}</span>
          <span className="mt-1 text-[11px] sm:text-xs text-muted-foreground tracking-widest">连续打卡（天）</span>
        </div>
        <div className="rounded-[1.4rem] bg-white soft-shadow p-4 sm:p-6 flex flex-col items-center justify-center">
          <span className="font-display text-3xl sm:text-4xl text-aqua">{knownCount}</span>
          <span className="mt-1 text-[11px] sm:text-xs text-muted-foreground tracking-widest">已掌握单词</span>
        </div>
        <div className="rounded-[1.4rem] bg-white soft-shadow p-4 sm:p-6 flex flex-col items-center justify-center">
          <span className="font-display text-3xl sm:text-4xl text-navy">{TOTAL_WORDS}</span>
          <span className="mt-1 text-[11px] sm:text-xs text-muted-foreground tracking-widest">词库总量</span>
        </div>
      </section>

      {/* tasks */}
      <section className="reveal rounded-[2rem] bg-white soft-shadow p-5 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Ring percent={percent} />
            <span className="absolute inset-0 flex items-center justify-center font-display text-sm text-ink">
              {Math.round(percent * 100)}%
            </span>
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-ink">今日任务</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              全部完成即可自动打卡 · 预计{' '}
              {plan.tasks.reduce((n, t) => n + t.minutes, 0)} 分钟
            </p>
          </div>
        </div>

        <TaskList
          tasks={plan.tasks}
          done={checks[plan.day] ?? []}
          onToggle={(i) => toggleTask(plan.day, i, plan.tasks.length)}
          variant="today"
        />

        {percent === 1 && (
          <p className="pop-in mt-4 rounded-[1rem] bg-aqua/10 px-4 py-3 text-center text-sm font-medium text-aqua">
            今日已打卡，干得漂亮！明天继续。
          </p>
        )}
      </section>

      <p className="reveal pb-2 text-center text-[11px] text-muted-foreground">
        学习记录保存在当前浏览器中 · 开始于 {startDate}
      </p>
    </div>
  );
}
