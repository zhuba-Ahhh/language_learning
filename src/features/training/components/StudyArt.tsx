const art = {
  book: new URL('../../../assets/study/book.webp', import.meta.url).href,
  microphone: new URL('../../../assets/study/microphone.webp', import.meta.url)
    .href,
  flashcards: new URL('../../../assets/study/flashcards.webp', import.meta.url)
    .href,
  technology: new URL('../../../assets/study/technology.webp', import.meta.url)
    .href,
};
export default function StudyArt({
  name,
  className,
  eager = false,
}: {
  name: keyof typeof art;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      src={art[name]}
      className={className}
      width={640}
      height={640}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
