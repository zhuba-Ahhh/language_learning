/** 展示平片假名字表，沿用平假名文本朗读。 */
import { GOJUON, NASAL } from '@/content/kana';
import { speak, ttsSupported } from '@/lib/speech';

export default function KanaChart({ idx }: { idx: 0 | 1 }) {
  return (
    <div className="reveal space-y-2">
      {GOJUON.map((row) => (
        <div key={row.row} className="flex items-center gap-2">
          <span lang="ja" className="w-8 shrink-0 font-mono2 text-[10px] text-muted-foreground">
            {row.row}
          </span>
          <div className="grid flex-1 grid-cols-5 gap-2">
            {row.cells.map((cell, i) =>
              cell ? (
                <button
                  key={cell.romaji}
                  onClick={() => ttsSupported && speak(cell.kana[0], 'ja')}
                  className="group rounded-[0.9rem] bg-white soft-shadow py-2.5 sm:py-3 text-center transition-all hover:bg-powder/40 active:scale-95"
                >
                  <span lang="ja" className="block text-xl sm:text-2xl font-medium text-ink">
                    {cell.kana[idx]}
                  </span>
                  <span className="mt-0.5 block font-mono2 text-[10px] text-muted-foreground group-hover:text-aqua">
                    {cell.romaji}
                  </span>
                </button>
              ) : (
                <span key={`empty-${i}`} />
              )
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span lang="ja" className="w-8 shrink-0 font-mono2 text-[10px] text-muted-foreground">
          拨音
        </span>
        <button
          onClick={() => ttsSupported && speak(NASAL.kana[0], 'ja')}
          className="rounded-[0.9rem] bg-white soft-shadow px-6 py-2.5 text-center transition-all hover:bg-powder/40 active:scale-95"
        >
          <span lang="ja" className="block text-xl sm:text-2xl font-medium text-ink">
            {NASAL.kana[idx]}
          </span>
          <span className="block font-mono2 text-[10px] text-muted-foreground">n</span>
        </button>
      </div>
    </div>
  );
}
