import home from './icons/home.svg';
import speaking from './icons/speaking.svg';
import reading from './icons/reading.svg';
import review from './icons/review.svg';
import records from './icons/records.svg';

const icons = { home, speaking, reading, review, records };

export default function TrainingIcon({
  name,
  size = 21,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  return (
    <img
      src={icons[name]}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
