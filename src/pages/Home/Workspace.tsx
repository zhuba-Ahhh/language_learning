import { useState } from 'react';
import { LESSONS } from '@/content/training';
import { TrainingProvider } from '@/study/TrainingProvider';
import { useTraining } from '@/study/trainingContext';
import { stopSpeak } from '@/lib/speech';
import TrainingIcon from '@/components/TrainingIcon';
import logo from '@/components/TrainingIcon/icons/logo.svg';
import TrainingContent, {
  TrainingSettings,
  type TrainingSelection,
  type WorkspaceTab,
} from '@/features/training';
import styles from './workspace.module.less';

const TABS: {
  id: WorkspaceTab;
  title: string;
  icon: 'home' | 'speaking' | 'reading' | 'review' | 'records';
}[] = [
  { id: 'today', title: '今日', icon: 'home' },
  { id: 'speaking', title: '口语', icon: 'speaking' },
  { id: 'reading', title: '阅读', icon: 'reading' },
  { id: 'review', title: '复习', icon: 'review' },
  { id: 'records', title: '记录', icon: 'records' },
];

function Workspace() {
  const { data, now, draftActive, setLanguage, openLesson, storageError } =
    useTraining();
  const [tab, setTab] = useState<WorkspaceTab>('today');
  const [selection, setSelection] = useState<TrainingSelection | null>(null);
  const [navigationKey, setNavigationKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canLeave = () =>
    !draftActive ||
    window.confirm('这段录音还未保存。离开会放弃本次录音，继续吗？');
  const lesson = LESSONS.find((item) => item.id === selection?.lessonId);
  const due = data.reviews.filter(
    (item) =>
      LESSONS.find((unit) => unit.id === item.lessonId)?.lang ===
        data.language && Date.parse(item.dueAt) <= now,
  ).length;
  const navigate = (next: WorkspaceTab) => {
    if (!canLeave()) return;
    setNavigationKey((value) => value + 1);
    stopSpeak();
    setSettingsOpen(false);
    setSelection(null);
    setTab(next);
    window.scrollTo({ top: 0 });
  };
  const open = (next: TrainingSelection) => {
    if (!canLeave()) return;
    const unit = LESSONS.find((item) => item.id === next.lessonId);
    if (!unit || unit.lang !== data.language) return;
    stopSpeak();
    setSettingsOpen(false);
    openLesson(unit);
    setSelection(next);
    setTab(next.skill);
    window.scrollTo({ top: 0 });
  };
  const changeLanguage = (language: 'en' | 'ja') => {
    if (!canLeave()) return;
    stopSpeak();
    setSelection(null);
    setLanguage(language);
    window.scrollTo({ top: 0 });
  };
  const openSettings = () => {
    if (!canLeave()) return;
    stopSpeak();
    setSelection(null);
    setTab('records');
    setSettingsOpen(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={styles.workspace}>
      <header className={styles.appHeader}>
        <button
          type="button"
          className={styles.brand}
          onClick={() => navigate('today')}
          aria-label="LinguaDesk 今日"
        >
          <img src={logo} width={36} height={36} alt="" />
          <strong>LinguaDesk</strong>
        </button>
        <nav className={styles.navigation} aria-label="主要导航">
          {TABS.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              {item.title}
              {item.id === 'review' && due > 0 && <small>{due}</small>}
            </button>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.languageSwitch} aria-label="学习语言">
            <button
              type="button"
              aria-pressed={data.language === 'en'}
              onClick={() => changeLanguage('en')}
            >
              英语
            </button>
            <button
              type="button"
              aria-pressed={data.language === 'ja'}
              onClick={() => changeLanguage('ja')}
            >
              日语
            </button>
          </div>
          <button
            type="button"
            className={styles.settingsButton}
            aria-label="设置"
            onClick={openSettings}
          >
            <TrainingIcon name="settings" />
          </button>
        </div>
      </header>
      <main className={styles.content}>
        {storageError && (
          <p role="alert" className={styles.storageError}>
            {storageError}
          </p>
        )}
        {settingsOpen ? (
          <TrainingSettings onBack={() => setSettingsOpen(false)} />
        ) : (
          <div key={data.language}>
            <TrainingContent
              key={navigationKey}
              tab={tab}
              selection={selection}
              lesson={lesson}
              onOpen={open}
              onNavigate={navigate}
              onBack={() => navigate(tab)}
              onSettings={openSettings}
            />
          </div>
        )}
      </main>
      <nav className={styles.mobileNav} aria-label="移动导航">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => navigate(item.id)}
          >
            <TrainingIcon name={item.icon} />
            <span>{item.title}</span>
            {item.id === 'review' && due > 0 && <i />}
          </button>
        ))}
      </nav>
    </div>
  );
}
export default function Home() {
  return (
    <TrainingProvider>
      <Workspace />
    </TrainingProvider>
  );
}
