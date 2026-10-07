export default function RubyText({
  text,
  enabled,
}: {
  text: string;
  enabled: boolean;
}) {
  const parts = text.split(/([\p{Script=Han}々]+\[[^\]]+\])/gu);
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^(.+)\[([^\]]+)\]$/);
        if (!match) return <span key={index}>{part}</span>;
        return enabled ? (
          <ruby key={index}>
            {match[1]}
            <rt>{match[2]}</rt>
          </ruby>
        ) : (
          <span key={index}>{match[1]}</span>
        );
      })}
    </>
  );
}
