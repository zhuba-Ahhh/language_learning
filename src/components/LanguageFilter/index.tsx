/** 受控语言筛选，选项与外观由调用方提供。 */
import styles from './index.module.less';
interface Props<T extends string> {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
  variant: 'segmented' | 'chips';
}

export default function LanguageFilter<T extends string>({
  options,
  value,
  onChange,
  variant,
}: Props<T>) {
  const segmented = variant === 'segmented';
  return (
    <div className={segmented ? `reveal ${styles.segmented}` : styles.chips}>
      {options.map(([option, label]) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`${styles.option} ${
            segmented ? styles.segment : styles.chip
          } ${
            value === option
              ? styles.selected
              : segmented
                ? styles.segmentIdle
                : styles.chipIdle
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
