import type { Lesson } from '@/content/training';
import { useState } from 'react';
import KanaPractice from './Review/KanaPractice';
import Today from './Today';
import Library from './Library';
import Reading from './Reading';
import Speaking from './Speaking';
import Review from './Review';
import Records from './Records';
import type { TrainingSelection, WorkspaceTab } from './types';

export type { TrainingSelection, WorkspaceTab } from './types';
export { default as TrainingSettings } from './Records/Settings';

export default function TrainingContent({
  tab,
  selection,
  lesson,
  onOpen,
  onNavigate,
  onBack,
  onSettings,
}: {
  tab: WorkspaceTab;
  selection: TrainingSelection | null;
  lesson?: Lesson;
  onOpen: (selection: TrainingSelection) => void;
  onNavigate: (tab: WorkspaceTab) => void;
  onBack: () => void;
  onSettings: () => void;
}) {
  const [kanaOpen, setKanaOpen] = useState(false);
  if (tab === 'today' && kanaOpen && !selection)
    return (
      <KanaPractice
        backLabel="今日"
        onBack={() => {
          setKanaOpen(false);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  if (selection && lesson) {
    return selection.skill === 'reading' ? (
      <Reading
        key={lesson.id}
        lesson={lesson}
        onBack={onBack}
        onOpen={onOpen}
      />
    ) : (
      <Speaking
        key={`${lesson.id}-${selection.taskId ?? ''}`}
        lesson={lesson}
        initialTaskId={selection.taskId}
        onBack={onBack}
      />
    );
  }
  if (tab === 'today')
    return (
      <Today
        onOpen={onOpen}
        onNavigate={onNavigate}
        onKana={() => {
          setKanaOpen(true);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  if (tab === 'reading' || tab === 'speaking')
    return <Library key={tab} skill={tab} onOpen={onOpen} />;
  if (tab === 'review') return <Review onOpen={onOpen} />;
  return <Records onOpen={onOpen} onSettings={onSettings} />;
}
