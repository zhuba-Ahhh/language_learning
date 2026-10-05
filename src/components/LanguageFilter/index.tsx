/** 受控语言筛选，选项与外观由调用方提供。 */
interface Props<T extends string> {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
  variant: 'segmented' | 'chips';
}

export default function LanguageFilter<T extends string>({
  options, value, onChange, variant,
}: Props<T>) {
  const segmented = variant === 'segmented';
  return (
    <div className={segmented ? 'reveal flex rounded-full bg-white soft-shadow p-1 w-max' : 'flex gap-2'}>
      {options.map(([option, label]) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full font-medium transition-all ${
            segmented ? 'px-5 py-2 text-sm' : 'px-4 py-2 text-xs'
          } ${
            value === option
              ? 'bg-deepblue text-white'
              : segmented ? 'text-ink/60' : 'bg-white text-ink/70 hover:bg-powder/40'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
