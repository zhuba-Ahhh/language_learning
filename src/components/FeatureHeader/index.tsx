/** 六个功能页共用的标题与说明，额外操作仍由调用方提供。 */
import type { ReactNode } from 'react';
import styles from './index.module.less';

interface Props {
  title: string;
  children?: ReactNode;
}

export default function FeatureHeader({ title, children }: Props) {
  return (
    <header className="reveal">
      <h1 className={styles.title}>{title}</h1>
      {children}
    </header>
  );
}
