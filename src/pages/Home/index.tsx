/** 组合七个学习入口，并统一挂载学习状态与导航。 */
import styles from './index.module.less';
import { useState, type ReactNode } from 'react';
import { StudyProvider } from '@/study/StudyProvider';
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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    id: 'cards',
    label: '闪卡',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="6"
          width="14"
          height="15"
          rx="2"
          transform="rotate(-6 3 6)"
        />
        <rect
          x="8"
          y="3"
          width="14"
          height="15"
          rx="2"
          transform="rotate(4 8 3)"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    id: 'speak',
    label: '口语',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
      </svg>
    ),
  },
  {
    id: 'read',
    label: '阅读',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: 'kana',
    label: '假名',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16v16H4z" opacity="0" />
        <path d="M12 4c-2 3-4 5-7 6M8 8c1 4 3 8 8 10M16 6c-1 5-4 9-9 12" />
      </svg>
    ),
  },
  {
    id: 'plan',
    label: '计划',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    id: 'vocab',
    label: '词库',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
    <div className={styles.shell}>
      {/* header */}
      <header ref={headerRef} className={`site-header ${styles.header}`}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <span className={styles.logo}>
              Lingua<span className={styles.logoAccent}>Desk</span>
            </span>
            <span lang="ja" className={styles.tagline}>
              英日・双语学习台
            </span>
          </div>
          {/* desktop nav */}
          <nav className={styles.desktopNav}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`${styles.navButton} ${
                  tab === t.id ? styles.selected : styles.idle
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <span className={styles.mobileTagline}>EN × JP</span>
        </div>
      </header>

      {/* content */}
      <main ref={revealRef} className={styles.main}>
        <div key={tab}>
          {tab === 'today' && <TodaySection />}
          {tab === 'cards' && <FlashcardsSection />}
          {tab === 'speak' && <SpeakingSection />}
          {tab === 'read' && <ReadingSection />}
          {tab === 'kana' && <KanaSection />}
          {tab === 'plan' && <PlanSection />}
          {tab === 'vocab' && <VocabSection />}
        </div>

        <footer className={styles.footer}>
          <p className={styles.signature}>
            LinguaDesk — read it, say it, ship it.
          </p>
        </footer>
      </main>

      {/* mobile bottom nav */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileNavContent}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`${styles.mobileButton} ${
                tab === t.id ? styles.mobileSelected : styles.mobileIdle
              }`}
            >
              {t.icon}
              <span className={styles.mobileLabel}>{t.label}</span>
              <span
                className={`${styles.indicator} ${
                  tab === t.id ? styles.indicatorSelected : styles.indicatorIdle
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
