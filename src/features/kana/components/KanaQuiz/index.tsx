/** 受控测验视图；题目、成绩及最佳记录由父组件保存。 */
import type { KanaCell } from '@/content/kana';

interface Props {
  idx: 0 | 1;
  quiz: { answer: KanaCell; options: KanaCell[] };
  picked: string | null;
  score: { right: number; total: number };
  accuracy: number;
  bestAccuracy: number;
  onAnswer: (cell: KanaCell) => void;
  onReset: () => void;
}

export default function KanaQuiz({
  idx, quiz, picked, score, accuracy, bestAccuracy, onAnswer, onReset,
}: Props) {
  return (
    <div className="reveal rounded-[2rem] bg-white soft-shadow-lg px-6 py-10 text-center">
      <div className="flex items-center justify-center gap-6 font-mono2 text-xs text-muted-foreground">
        <span>
          正确率 <span className="text-aqua font-bold">{accuracy}%</span>
        </span>
        <span>
          {score.right} / {score.total}
        </span>
        {bestAccuracy > 0 && (
          <span>
            历史最佳 <span className="text-deepblue font-bold">{bestAccuracy}%</span>
          </span>
        )}
        <button
          onClick={onReset}
          className="underline underline-offset-2 hover:text-ink"
        >
          清零
        </button>
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-mono2">
        哪个是
      </p>
      <p className="font-display mt-2 text-5xl text-ink">{quiz.answer.romaji}</p>
      <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-3">
        {quiz.options.map((cell) => {
          const isAnswer = cell.romaji === quiz.answer.romaji;
          const isPicked = picked === cell.romaji;
          return (
            <button
              key={cell.romaji}
              onClick={() => onAnswer(cell)}
              className={`rounded-[1.2rem] py-5 text-3xl font-medium transition-all duration-300 active:scale-95 ${
                picked
                  ? isAnswer
                    ? 'bg-aqua text-white pop-in'
                    : isPicked
                      ? 'bg-destructive text-white'
                      : 'bg-sand text-ink/40'
                  : 'bg-sand text-ink hover:bg-powder/50'
              }`}
            >
              <span lang="ja">{cell.kana[idx]}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">答对自动出下一题，答错会停顿让你看清楚</p>
    </div>
  );
}
