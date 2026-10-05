/** 六个功能页共用的标题与说明，额外操作仍由调用方提供。 */
import type { ReactNode } from 'react';
import styles from './index.module.less';

interface Props {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

export default function FeatureHeader({
  eyebrow,
  title,
  description,
  children,
}: Props) {
  return (
    <header className="reveal">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {children}
    </header>
  );
}
