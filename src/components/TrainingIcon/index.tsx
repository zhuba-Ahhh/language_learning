import home from './icons/home.svg';
import speaking from './icons/speaking.svg';
import reading from './icons/reading.svg';
import review from './icons/review.svg';
import records from './icons/records.svg';
import settings from './icons/settings.svg';
import clock from './icons/clock.svg';
import play from './icons/play.svg';
import pause from './icons/pause.svg';
import arrow from './icons/arrow.svg';
import check from './icons/check.svg';
import speaker from './icons/speaker.svg';
import bookmark from './icons/bookmark.svg';
import close from './icons/close.svg';
import download from './icons/download.svg';
import upload from './icons/upload.svg';

const icons = {
  home,
  speaking,
  reading,
  review,
  records,
  settings,
  clock,
  play,
  pause,
  arrow,
  check,
  speaker,
  bookmark,
  close,
  download,
  upload,
};

export default function TrainingIcon({
  name,
  size = 21,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  const mask = `url("${icons[name]}") center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        mask,
        WebkitMask: mask,
      }}
    />
  );
}
