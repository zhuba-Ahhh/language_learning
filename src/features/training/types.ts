export type WorkspaceTab =
  'today' | 'speaking' | 'reading' | 'review' | 'records';

export interface TrainingSelection {
  lessonId: string;
  skill: 'reading' | 'speaking';
  taskId?: string;
}
