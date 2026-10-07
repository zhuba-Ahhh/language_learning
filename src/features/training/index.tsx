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

export default function TrainingContent({
  tab,
  selection,
  lesson,
  onOpen,
  onNavigate,
  onBack,
}: {
  tab: WorkspaceTab;
  selection: TrainingSelection | null;
  lesson?: Lesson;
  onOpen: (selection: TrainingSelection) => void;
  onNavigate: (tab: WorkspaceTab) => void;
  onBack: () => void;
}) {
  const [kanaOpen, setKanaOpen] = useState(false);
  if (tab === 'today' && kanaOpen && !selection)
    return <KanaPractice backLabel="今日" onBack={() => setKanaOpen(false)} />;
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
        onKana={() => setKanaOpen(true)}
      />
    );
  if (tab === 'reading' || tab === 'speaking')
    return <Library key={tab} skill={tab} onOpen={onOpen} />;
  if (tab === 'review') return <Review onOpen={onOpen} />;
  return <Records onOpen={onOpen} />;
}
