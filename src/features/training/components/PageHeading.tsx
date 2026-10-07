import styles from '../index.module.less';
export default function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className={styles.pageHeading}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}
