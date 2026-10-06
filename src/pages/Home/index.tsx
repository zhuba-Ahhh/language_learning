/** 组合四个稳定入口，并统一挂载学习状态与导航。 */
import styles from './index.module.less';
import { useState, type ReactNode } from 'react';
import { StudyProvider } from '@/study/StudyProvider';
import { useHideOnScroll, useReveal } from '@/hooks/useScrollFx';
import TodaySection from '@/features/today';
import PracticeSection, {
  type PracticeView,
} from './components/PracticeSection';
import GoalsSection from './components/GoalsSection';
import PlanSection from '@/features/plan';
import type { PlanTask } from '@/content/plan';
import { useStudy } from '@/study/useStudy';

type Tab = 'today' | 'practice' | 'goals' | 'progress';

interface ActiveTask {
  task: PlanTask;
  day: number;
  total: number;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'today',
    label: '今日',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </Icon>
    ),
  },
  {
    id: 'practice',
    label: '练习',
    icon: (
      <Icon>
        <path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v18H6.5A3.5 3.5 0 0 0 3 23z" />
        <path d="M21 5.5A3.5 3.5 0 0 0 17.5 2H13v18h4.5A3.5 3.5 0 0 1 21 23z" />
      </Icon>
    ),
  },
  {
    id: 'goals',
    label: '目标',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" />
      </Icon>
    ),
  },
  {
    id: 'progress',
    label: '进度',
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </Icon>
    ),
  },
];

function Shell() {
  const { completeTask } = useStudy();
  const [tab, setTab] = useState<Tab>('today');
  const [practiceView, setPracticeView] = useState<PracticeView>('overview');
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  const headerRef = useHideOnScroll();
  const revealRef = useReveal<HTMLDivElement>([tab, practiceView]);

  const openPractice = (view: PracticeView) => {
    setPracticeView(view);
    setTab('practice');
    window.scrollTo({ top: 0 });
  };

  const selectTab = (nextTab: Tab) => {
    setActiveTask(null);
    if (nextTab === 'practice') setPracticeView('overview');
    setTab(nextTab);
    window.scrollTo({ top: 0 });
  };

  const startTask = (task: PlanTask, day: number, total: number) => {
    setActiveTask({ task, day, total });
    if (
      task.activity.type === 'flashcards' &&
      task.activity.mode === 'review'
    ) {
      openPractice('review');
      return;
    }
    const view: Record<PlanTask['activity']['type'], PracticeView> = {
      flashcards: 'cards',
      speaking: 'speak',
      reading: 'read',
      kana: 'kana',
    };
    openPractice(view[task.activity.type]);
  };

  const completeActiveTask = () => {
    if (!activeTask) return;
    completeTask(activeTask.day, activeTask.task.id, activeTask.total);
  };

  return (
    <div className={styles.shell}>
      <header ref={headerRef} className={`site-header ${styles.header}`}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <svg
              className={styles.brandMark}
              viewBox="0 0 32 42"
              aria-hidden="true"
            >
              <path d="M6 13h15v25l-7.5-5L6 38V13Z" />
              <path d="M13 13C12 7 8 4 3 4c0 6 4 9 10 9Zm2 0c1-7 5-11 12-11 0 7-5 11-12 11Z" />
            </svg>
            <span className={styles.logo}>LinguaDesk</span>
            <span className={styles.tagline}>每天，靠近一种语言。</span>
          </div>
          <nav className={styles.desktopNav} aria-label="主要导航">
            {TABS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => selectTab(item.id)}
                aria-current={tab === item.id ? 'page' : undefined}
                className={`${styles.navButton} ${
                  tab === item.id ? styles.selected : styles.idle
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <span className={styles.mobileTagline} aria-hidden="true" />
        </div>
      </header>

      <main ref={revealRef} className={styles.main}>
        <div key={`${tab}-${tab === 'practice' ? practiceView : ''}`}>
          {tab === 'today' && <TodaySection onStartTask={startTask} />}
          {tab === 'practice' && (
            <PracticeSection
              view={practiceView}
              onChange={openPractice}
              task={activeTask?.task}
              onActivityComplete={activeTask ? completeActiveTask : undefined}
            />
          )}
          {tab === 'goals' && (
            <GoalsSection onConfirm={() => selectTab('today')} />
          )}
          {tab === 'progress' && <PlanSection />}
        </div>

        <footer className={styles.footer}>
          <p className={styles.signature}>明天再见。</p>
        </footer>
      </main>

      <nav className={styles.mobileNav} aria-label="主要导航">
        <div className={styles.mobileNavContent}>
          {TABS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => selectTab(item.id)}
              aria-current={tab === item.id ? 'page' : undefined}
              className={`${styles.mobileButton} ${
                tab === item.id ? styles.mobileSelected : styles.mobileIdle
              }`}
            >
              {item.icon}
              <span className={styles.mobileLabel}>{item.label}</span>
              <span
                className={`${styles.indicator} ${
                  tab === item.id
                    ? styles.indicatorSelected
                    : styles.indicatorIdle
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
