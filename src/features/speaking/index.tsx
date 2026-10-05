/** 展示场景句子、朗读操作与跟读提示。 */
import { useState } from 'react';
import SpeakButton from '@/components/SpeakButton';
import { SCENARIOS } from '@/content/speaking';

export default function SpeakingSection() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  return (
    <div className="space-y-6">
      <header className="reveal">
        <p className="font-mono2 text-[11px] uppercase tracking-[0.3em] text-aqua">Speaking</p>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl text-ink">口语练习</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          点喇叭听发音 → 跟读 3 遍 → 不看中文复述。每天一个场景，录下来回听。
        </p>
      </header>

      {/* scenario chips */}
      <div className="reveal -mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 w-max">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                s.id === scenarioId
                  ? 'bg-deepblue text-white soft-shadow'
                  : 'bg-white text-ink/70 hover:bg-powder/40'
              }`}
            >
              {s.lang === 'ja' ? '日语' : '英语'} · {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* tip */}
      <div className="reveal rounded-[1.4rem] bg-navy text-white px-5 sm:px-6 py-5 soft-shadow">
        <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-powder">
          {scenario.subtitle} · 练习提示
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/90">{scenario.tip}</p>
      </div>

      {/* sentences */}
      <ul className="reveal space-y-2.5">
        {scenario.sentences.map((s, i) => (
          <li
            key={i}
            className="flex items-center gap-3 sm:gap-4 rounded-[1.4rem] bg-white soft-shadow px-4 sm:px-6 py-4"
          >
            <span className="font-mono2 text-[11px] text-muted-foreground w-6 shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <p
                lang={scenario.lang === 'ja' ? 'ja' : undefined}
                className="text-sm sm:text-base font-medium text-ink leading-relaxed"
              >
                {s.text}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.zh}</p>
            </div>
            <SpeakButton
              text={s.text}
              lang={scenario.lang}
              className="bg-sand text-navy hover:bg-powder/60 shrink-0"
              size={38}
            />
          </li>
        ))}
      </ul>

      {/* shadowing guide */}
      <section className="reveal rounded-[1.4rem] border-2 border-dashed border-aqua/40 px-5 sm:px-6 py-5">
        <h2 className="font-display text-lg text-ink">Shadowing 三步法</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink/80">
          <li className="flex gap-3">
            <span className="font-mono2 text-aqua shrink-0">1</span>
            先看着文本听一遍，理解每个词
          </li>
          <li className="flex gap-3">
            <span className="font-mono2 text-aqua shrink-0">2</span>
            不看文本跟读，落后音频半拍，模仿语调节奏
          </li>
          <li className="flex gap-3">
            <span className="font-mono2 text-aqua shrink-0">3</span>
            换成你自己的内容复述一遍（站会就换成你真实的任务）
          </li>
        </ol>
      </section>
      {/* pronunciation tips */}
      <section className="reveal rounded-[1.4rem] bg-white soft-shadow px-5 sm:px-6 py-5">
        <h2 className="font-display text-lg text-ink">发音要点</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-deepblue">English</p>
            <ul className="mt-2 space-y-2 text-sm text-ink/80 leading-relaxed">
              <li>· 弱读：to / for / of 在句中读得又轻又快（tə、fə、əv）</li>
              <li>· 连读：an hour → "a-nour"，worked on → "work-ton"</li>
              <li>· 失爆：blocked by 的 /t/ 不爆破，只做口型</li>
              <li>· 重音：名词双音节通常重音在前（RE-cord），动词在后（re-CORD）</li>
            </ul>
          </div>
          <div>
            <p lang="ja" className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-aqua">日本語</p>
            <ul className="mt-2 space-y-2 text-sm text-ink/80 leading-relaxed">
              <li>· 日语是「拍」语言：每个假名时长均等，不要拖长某些音</li>
              <li>· 长音要读满一拍：エンジニア（en-ji-ni-a，ニ要拖长）</li>
              <li>· 促音停一拍：チケット（ticket）里小「ッ」处停顿一拍</li>
              <li>· 句尾语调：疑问句尾上扬（ですか↗），陈述句平缓下降</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
