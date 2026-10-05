/** 读取当前 Provider 的共享学习状态。 */
import { useContext } from 'react';
import { StudyContext } from './context';

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}
