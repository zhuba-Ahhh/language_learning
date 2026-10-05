/** 组合七个学习入口，并统一挂载学习状态与导航。 */
import { useState, type ReactNode } from 'react';
import { StudyProvider } from '@/study/useStudyState';
import { useHideOnScroll, useReveal } from '@/hooks/useScrollFx';
import TodaySection from '@/features/today';
import FlashcardsSection from '@/features/flashcards';
import PlanSection from '@/features/plan';
import VocabSection from '@/features/vocabulary';
import SpeakingSection from '@/features/speaking';
import KanaSection from '@/features/kana';
import ReadingSection from '@/features/reading';

type Tab = 'today' | 'cards' | 'speak' | 'read' | 'kana' | 'plan' | 'vocab';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'today',
    label: '今日',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    id: 'cards',
    label: '闪卡',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="14" height="15" rx="2" transform="rotate(-6 3 6)" />
        <rect x="8" y="3" width="14" height="15" rx="2" transform="rotate(4 8 3)" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'speak',
    label: '口语',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
      </svg>
    ),
  },
  {
    id: 'read',
    label: '阅读',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: 'kana',
    label: '假名',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" opacity="0" />
        <path d="M12 4c-2 3-4 5-7 6M8 8c1 4 3 8 8 10M16 6c-1 5-4 9-9 12" />
      </svg>
    ),
  },
  {
    id: 'plan',
    label: '计划',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    id: 'vocab',
    label: '词库',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </svg>
    ),
  },
];

function Shell() {
  const [tab, setTab] = useState<Tab>('today');
  const headerRef = useHideOnScroll();
  const revealRef = useReveal<HTMLDivElement>([tab]);

  return (
    <div className="min-h-screen bg-paper">
      {/* header */}
      <header
        ref={headerRef}
        className="site-header fixed inset-x-0 top-0 z-40 bg-paper/85 backdrop-blur-md border-b border-border/60"
      >
        <div className="mx-auto flex h-14 sm:h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg sm:text-xl text-ink tracking-tight">
              Lingua<span className="text-aqua">Desk</span>
            </span>
            <span lang="ja" className="hidden sm:inline font-mono2 text-[10px] tracking-[0.25em] text-muted-foreground">
              英日・双语学习台
            </span>
          </div>
          {/* desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  tab === t.id ? 'bg-deepblue text-white' : 'text-ink/60 hover:text-ink hover:bg-powder/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <span className="sm:hidden font-mono2 text-[10px] tracking-[0.25em] text-muted-foreground">
            EN × JP
          </span>
        </div>
      </header>

      {/* content */}
      <main ref={revealRef} className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 sm:pt-24 pb-28 sm:pb-16">
        <div key={tab}>
          {tab === 'today' && <TodaySection />}
          {tab === 'cards' && <FlashcardsSection />}
          {tab === 'speak' && <SpeakingSection />}
          {tab === 'read' && <ReadingSection />}
          {tab === 'kana' && <KanaSection />}
          {tab === 'plan' && <PlanSection />}
          {tab === 'vocab' && <VocabSection />}
        </div>

        <footer className="mt-14 border-t border-border pt-6 pb-2 text-center">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            LinguaDesk — read it, say it, ship it.
          </p>
        </footer>
      </main>

      {/* mobile bottom nav */}
      <nav className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-md pb-safe">
        <div className="mx-auto grid max-w-md grid-cols-7">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                tab === t.id ? 'text-deepblue' : 'text-muted-foreground'
              }`}
            >
              {t.icon}
              <span className="text-[10px] font-medium">{t.label}</span>
              <span
                className={`h-1 w-1 rounded-full transition-all ${
                  tab === t.id ? 'bg-aqua' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function Home() {
  return (
    <StudyProvider>
      <Shell />
    </StudyProvider>
  );
}
