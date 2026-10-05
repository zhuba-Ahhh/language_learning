/** 按语言与难度展示内置阅读资源。 */
import { READING_GROUPS } from '@/content/reading';

const LEVEL_STYLE: Record<number, { label: string; cls: string }> = {
  1: { label: '入门', cls: 'bg-aqua/15 text-aqua' },
  2: { label: '进阶', cls: 'bg-deepblue/10 text-deepblue' },
  3: { label: '高级', cls: 'bg-navy/10 text-navy' },
};

export default function ReadingSection() {
  return (
    <div className="space-y-6">
      <header className="reveal">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-aqua">Reading</p>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl text-ink">阅读资源</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          按难度分级。每天一篇，从「入门」栏开始，生词收进闪卡。
        </p>
      </header>

      {READING_GROUPS.map((g) => (
        <section key={g.id} className="reveal">
          <div className="mb-2.5 flex items-baseline gap-2 px-1">
            <h2 className="font-display text-lg text-ink">
              {g.lang === 'ja' ? '日语' : '英语'} · {g.title}
            </h2>
            <span className="font-mono2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {g.subtitle}
            </span>
          </div>
          <ul className="space-y-2.5">
            {g.resources.map((r) => (
              <li key={r.name}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-[1.4rem] bg-white soft-shadow px-5 sm:px-6 py-4 transition-all hover:soft-shadow-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-semibold text-ink group-hover:text-deepblue transition-colors">
                        {r.name}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest ${LEVEL_STYLE[r.level].cls}`}
                      >
                        {LEVEL_STYLE[r.level].label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-aqua"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="reveal text-center text-[11px] text-muted-foreground">
        外部资源将在新标签页打开
      </p>
    </div>
  );
}
