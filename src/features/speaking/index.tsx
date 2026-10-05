/** 展示场景句子、朗读操作与跟读提示。 */
import styles from './index.module.less';
import FeatureHeader from '@/components/FeatureHeader';
import { useState } from 'react';
import SpeakButton from '@/components/SpeakButton';
import { SCENARIOS } from '@/content/speaking';

export default function SpeakingSection() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  return (
    <div className={styles.section}>
      <FeatureHeader
        eyebrow="Speaking"
        title="口语练习"
        description={
          <>
            点喇叭听发音 → 跟读 3 遍 → 不看中文复述。每天一个场景，录下来回听。
          </>
        }
      ></FeatureHeader>

      {/* scenario chips */}
      <div className={`reveal ${styles.scenarioScroller}`}>
        <div className={styles.scenarioList}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`${styles.scenarioChip} ${
                s.id === scenarioId ? styles.selected : styles.idle
              }`}
            >
              {s.lang === 'ja' ? '日语' : '英语'} · {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* tip */}
      <div className={`reveal ${styles.tip}`}>
        <p className={styles.tipLabel}>{scenario.subtitle} · 练习提示</p>
        <p className={styles.tipText}>{scenario.tip}</p>
      </div>

      {/* sentences */}
      <ul className={`reveal ${styles.sentences}`}>
        {scenario.sentences.map((s, i) => (
          <li key={i} className={styles.sentence}>
            <span className={styles.number}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className={styles.content}>
              <p
                lang={scenario.lang === 'ja' ? 'ja' : undefined}
                className={styles.sentenceText}
              >
                {s.text}
              </p>
              <p className={styles.translation}>{s.zh}</p>
            </div>
            <SpeakButton text={s.text} lang={scenario.lang} size={38} />
          </li>
        ))}
      </ul>

      {/* shadowing guide */}
      <section className={`reveal ${styles.shadowing}`}>
        <h2 className={styles.guideTitle}>Shadowing 三步法</h2>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            先看着文本听一遍，理解每个词
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            不看文本跟读，落后音频半拍，模仿语调节奏
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            换成你自己的内容复述一遍（站会就换成你真实的任务）
          </li>
        </ol>
      </section>
      {/* pronunciation tips */}
      <section className={`reveal ${styles.pronunciation}`}>
        <h2 className={styles.guideTitle}>发音要点</h2>
        <div className={styles.languages}>
          <div>
            <p className={styles.english}>English</p>
            <ul className={styles.points}>
              <li>· 弱读：to / for / of 在句中读得又轻又快（tə、fə、əv）</li>
              <li>· 连读：an hour → "a-nour"，worked on → "work-ton"</li>
              <li>· 失爆：blocked by 的 /t/ 不爆破，只做口型</li>
              <li>
                · 重音：名词双音节通常重音在前（RE-cord），动词在后（re-CORD）
              </li>
            </ul>
          </div>
          <div>
            <p lang="ja" className={styles.japanese}>
              日本語
            </p>
            <ul className={styles.points}>
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
