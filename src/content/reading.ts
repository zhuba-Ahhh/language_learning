/** 站内阅读文章、生词与理解题。 */
export interface ReadingWord {
  term: string;
  meaning: string;
  reading?: string;
}

export interface ReadingQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ReadingResource {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  minutes: number;
  desc: string;
  paragraphs: string[];
  vocabulary: ReadingWord[];
  questions: ReadingQuestion[];
}

export interface ReadingGroup {
  id: string;
  lang: 'en' | 'ja';
  title: string;
  subtitle: string;
  courseOnly?: boolean;
  resources: ReadingResource[];
}

export const READING_GROUPS: ReadingGroup[] = [
  {
    id: 'en-tech-easy',
    lang: 'en',
    title: '技术阅读 · 入门',
    subtitle: 'English · Beginner',
    resources: [
      {
        id: 'en-small-functions',
        name: 'A Small Function',
        level: 1,
        minutes: 4,
        desc: '从函数命名理解“单一职责”。',
        paragraphs: [
          'A small function does one job and gives that job a clear name. When a reader sees calculateTotal(), they can understand the intention without reading every line.',
          'Small functions are also easier to test and change. The goal is not to make every function tiny. The goal is to keep each function focused.',
        ],
        vocabulary: [
          { term: 'intention', meaning: '意图' },
          { term: 'focused', meaning: '专注于单一任务的' },
          { term: 'tiny', meaning: '极小的' },
        ],
        questions: [
          {
            id: 'en-small-functions-1',
            prompt: '小函数首先帮助读者做什么？',
            options: ['快速理解意图', '减少所有代码', '避免编写测试'],
            answer: 0,
            explanation: '清晰的名称能直接表达函数意图。',
          },
          {
            id: 'en-small-functions-2',
            prompt: '作者认为函数应该怎样？',
            options: ['越短越好', '保持专注', '只能返回数字'],
            answer: 1,
            explanation: '文章强调 focused，而不是盲目追求 tiny。',
          },
        ],
      },
    ],
  },
  {
    id: 'en-tech-mid',
    lang: 'en',
    title: '技术阅读 · 进阶',
    subtitle: 'English · Intermediate',
    resources: [
      {
        id: 'en-useful-bug-report',
        name: 'A Useful Bug Report',
        level: 2,
        minutes: 6,
        desc: '学会用结构化英语描述问题。',
        paragraphs: [
          'A useful bug report begins with what you expected and what actually happened. It then gives the shortest set of steps that can reproduce the problem.',
          'Details such as the browser version and the exact error message help other people investigate. Avoid guessing the root cause unless you have evidence.',
        ],
        vocabulary: [
          { term: 'reproduce', meaning: '复现' },
          { term: 'investigate', meaning: '调查；排查' },
          { term: 'evidence', meaning: '证据' },
        ],
        questions: [
          {
            id: 'en-useful-bug-report-1',
            prompt: '报告开头应说明哪两件事？',
            options: [
              '预期结果与实际结果',
              '作者与审查人',
              '发布日期与回滚日期',
            ],
            answer: 0,
            explanation: '这是文章第一句给出的核心结构。',
          },
          {
            id: 'en-useful-bug-report-2',
            prompt: '没有证据时应避免什么？',
            options: ['写错误信息', '猜测根因', '提供浏览器版本'],
            answer: 1,
            explanation: '先记录可验证的事实，不要把猜测当结论。',
          },
        ],
      },
    ],
  },
  {
    id: 'en-tech-hard',
    lang: 'en',
    title: '原版长句 · 高级',
    subtitle: 'English · Advanced',
    resources: [
      {
        id: 'en-hidden-cost',
        name: 'The Hidden Cost of Abstraction',
        level: 3,
        minutes: 8,
        desc: '练习转折、让步与抽象概念。',
        paragraphs: [
          'Abstraction can remove repetition, but every new layer also hides information. A design that looks elegant from the outside may make performance problems harder to locate.',
          'This does not mean abstraction is harmful. It means that a team should introduce a layer only when the simpler design no longer explains the problem well enough.',
        ],
        vocabulary: [
          { term: 'abstraction', meaning: '抽象' },
          { term: 'repetition', meaning: '重复' },
          { term: 'introduce', meaning: '引入' },
        ],
        questions: [
          {
            id: 'en-hidden-cost-1',
            prompt: '抽象层可能带来什么问题？',
            options: ['隐藏有用信息', '完全阻止复用', '让所有代码变慢'],
            answer: 0,
            explanation: '文章说每个新层次都会隐藏一部分信息。',
          },
          {
            id: 'en-hidden-cost-2',
            prompt: '什么时候更适合引入新抽象？',
            options: [
              '一开始就引入',
              '简单设计已不足以表达问题时',
              '只要能减少文件数',
            ],
            answer: 1,
            explanation: '先保持简单，在真实问题出现后再增加层次。',
          },
        ],
      },
    ],
  },
  {
    id: 'ja-daily-easy',
    lang: 'ja',
    title: '日语阅读 · 入门',
    subtitle: '日本語 · Beginner',
    resources: [
      {
        id: 'ja-morning-station',
        name: '朝の駅で',
        level: 1,
        minutes: 4,
        desc: '时间、交通与日常习惯。',
        paragraphs: [
          '朝の駅は人が多いです。私は七時半に家を出て、八時ごろ駅に着きます。',
          '電車を待つ間に、スマートフォンで短いニュースを読みます。分からない言葉は一つだけメモします。',
        ],
        vocabulary: [
          { term: '駅', reading: 'えき', meaning: '车站' },
          { term: '着きます', reading: 'つきます', meaning: '到达' },
          { term: '待つ間', reading: 'まつあいだ', meaning: '等待期间' },
        ],
        questions: [
          {
            id: 'ja-morning-station-1',
            prompt: '“我”几点左右到车站？',
            options: ['七点半', '八点左右', '八点半'],
            answer: 1,
            explanation: '「八時ごろ駅に着きます」表示八点左右到站。',
          },
          {
            id: 'ja-morning-station-2',
            prompt: '等车时做什么？',
            options: ['读短新闻', '写长文', '打电话'],
            answer: 0,
            explanation: '文中说会用手机读短新闻。',
          },
        ],
      },
    ],
  },
  {
    id: 'podcast',
    lang: 'en',
    title: '听读稿 · 英语',
    subtitle: 'Listen & Read',
    resources: [
      {
        id: 'en-short-standup',
        name: 'A Two-Minute Stand-up',
        level: 1,
        minutes: 5,
        desc: '先听一段，再用文字核对。',
        paragraphs: [
          'Yesterday I fixed the search filter and added two tests. Today I will connect the page to the new API.',
          'I am waiting for the API documentation, but this is not a blocker yet. I can finish the empty state first.',
        ],
        vocabulary: [
          { term: 'connect', meaning: '接入；连接' },
          { term: 'blocker', meaning: '阻塞项' },
          { term: 'empty state', meaning: '空状态' },
        ],
        questions: [
          {
            id: 'en-short-standup-1',
            prompt: '昨天完成了什么？',
            options: ['修复搜索并加测试', '发布新 API', '重写文档'],
            answer: 0,
            explanation: '第一句直接列出了昨天的两项工作。',
          },
          {
            id: 'en-short-standup-2',
            prompt: 'API 文档是当前阻塞吗？',
            options: ['是', '还不是', '文中没说'],
            answer: 1,
            explanation: '说话者说「this is not a blocker yet」。',
          },
        ],
      },
    ],
  },
  {
    id: 'podcast-ja',
    lang: 'ja',
    title: '听读稿 · 日语',
    subtitle: '聞いて読む',
    resources: [
      {
        id: 'ja-first-review',
        name: 'はじめてのレビュー',
        level: 2,
        minutes: 6,
        desc: '日语职场中的建议与确认。',
        paragraphs: [
          '今日ははじめてコードレビューに参加しました。先輩は問題を指摘するだけでなく、理由も説明してくれました。',
          '私も「この名前を変えると、もっと分かりやすくなると思います」と伝えました。',
        ],
        vocabulary: [
          { term: '参加', reading: 'さんか', meaning: '参加' },
          { term: '指摘', reading: 'してき', meaning: '指出' },
          { term: '理由', reading: 'りゆう', meaning: '理由' },
        ],
        questions: [
          {
            id: 'ja-first-review-1',
            prompt: '前辈除了指出问题，还做了什么？',
            options: ['说明理由', '删除代码', '结束会议'],
            answer: 0,
            explanation: '「理由も説明してくれました」表示还说明了理由。',
          },
          {
            id: 'ja-first-review-2',
            prompt: '“我”提出了什么建议？',
            options: ['改名', '加测试', '换框架'],
            answer: 0,
            explanation: '建议改变名称，让代码更容易理解。',
          },
        ],
      },
    ],
  },
  {
    id: 'ja-tech',
    lang: 'ja',
    title: '技术阅读 · 日语',
    subtitle: '日本語 · Tech',
    resources: [
      {
        id: 'ja-small-release',
        name: '小さくリリースする',
        level: 2,
        minutes: 7,
        desc: '用日语理解小步发布。',
        paragraphs: [
          '大きな変更を一度にリリースすると、問題の原因を探すことが難しくなります。',
          '変更を小さく分けると、確認と修正が簡単になります。失敗しても、元の状態に戻しやすいです。',
        ],
        vocabulary: [
          { term: '変更', reading: 'へんこう', meaning: '变更' },
          { term: '原因', reading: 'げんいん', meaning: '原因' },
          {
            term: '元の状態',
            reading: 'もとのじょうたい',
            meaning: '原来的状态',
          },
        ],
        questions: [
          {
            id: 'ja-small-release-1',
            prompt: '一次发布大量变更有什么风险？',
            options: ['难以定位原因', '文件数变少', '测试会自动完成'],
            answer: 0,
            explanation: '文章说大改动会让原因更难查找。',
          },
          {
            id: 'ja-small-release-2',
            prompt: '小步发布的好处是什么？',
            options: ['不再需要检查', '容易确认、修正和回退', '永远不会失败'],
            answer: 1,
            explanation: '小改动降低了检查、修正和回退的难度。',
          },
        ],
      },
    ],
  },
  {
    id: 'en-ielts-starter',
    lang: 'en',
    title: 'IELTS · Academic Reading',
    subtitle: 'Band 5.5 Starter',
    courseOnly: true,
    resources: [
      {
        id: 'en-ielts-green-roofs',
        name: 'Green Roofs in Cities',
        level: 2,
        minutes: 7,
        desc: '练习定位主旨与因果关系。',
        paragraphs: [
          'A green roof is covered with plants instead of traditional roofing materials. In dense cities, these roofs can absorb rainwater and reduce the amount of heat stored by buildings.',
          'However, a green roof needs careful planning. The structure must support the additional weight, and the plants must suit the local climate. For this reason, green roofs are useful but not equally practical for every building.',
        ],
        vocabulary: [
          { term: 'dense', meaning: '人口或建筑密集的' },
          { term: 'absorb', meaning: '吸收' },
          { term: 'structure', meaning: '建筑结构' },
        ],
        questions: [
          {
            id: 'en-ielts-green-roofs-1',
            prompt: '第一段主要介绍什么？',
            options: ['绿色屋顶的作用', '屋顶的历史', '植物的价格'],
            answer: 0,
            explanation: '第一段给出定义，并说明吸收雨水和减少热量两项作用。',
          },
          {
            id: 'en-ielts-green-roofs-2',
            prompt: '为什么绿色屋顶并不适合所有建筑？',
            options: [
              '需要结构与气候条件',
              '只能使用一种植物',
              '会增加城市降雨',
            ],
            answer: 0,
            explanation: '第二段指出承重和当地气候都会限制实际使用。',
          },
        ],
      },
    ],
  },
  {
    id: 'ja-jlpt-n5',
    lang: 'ja',
    title: 'JLPT N5 · 読解',
    subtitle: '短文とお知らせ',
    courseOnly: true,
    resources: [
      {
        id: 'ja-jlpt-today-plan',
        name: '今日の予定',
        level: 1,
        minutes: 5,
        desc: '练习时间与行动顺序。',
        paragraphs: [
          '今日は九時から学校で日本語を勉強します。昼は友だちと食堂でご飯を食べます。',
          '午後三時に授業が終わります。そのあと、本屋で辞書を買ってから家に帰ります。',
        ],
        vocabulary: [
          { term: '食堂', reading: 'しょくどう', meaning: '食堂' },
          { term: '授業', reading: 'じゅぎょう', meaning: '课；课程' },
          { term: '辞書', reading: 'じしょ', meaning: '词典' },
        ],
        questions: [
          {
            id: 'ja-jlpt-today-plan-1',
            prompt: '昼はどこでご飯を食べますか。',
            options: ['学校の食堂', '家', '本屋'],
            answer: 0,
            explanation: '「友だちと食堂でご飯を食べます」とあります。',
          },
          {
            id: 'ja-jlpt-today-plan-2',
            prompt: '授業のあと、何を買いますか。',
            options: ['本', '辞書', 'ご飯'],
            answer: 1,
            explanation: '本屋で辞書を買ってから家に帰ります。',
          },
        ],
      },
      {
        id: 'ja-jlpt-library-notice',
        name: '図書館のお知らせ',
        level: 1,
        minutes: 5,
        desc: '练习日期、时间与通知信息。',
        paragraphs: [
          '図書館は月曜日から土曜日まで開いています。平日は午前九時から午後七時までです。',
          '土曜日は午後五時に閉まります。日曜日と来週の水曜日は休みです。',
        ],
        vocabulary: [
          { term: '図書館', reading: 'としょかん', meaning: '图书馆' },
          { term: '平日', reading: 'へいじつ', meaning: '工作日' },
          { term: '閉まります', reading: 'しまります', meaning: '关闭' },
        ],
        questions: [
          {
            id: 'ja-jlpt-library-notice-1',
            prompt: '土曜日は何時に閉まりますか。',
            options: ['午後五時', '午後七時', '午前九時'],
            answer: 0,
            explanation: '土曜日は「午後五時に閉まります」。',
          },
          {
            id: 'ja-jlpt-library-notice-2',
            prompt: '図書館が休みなのはいつですか。',
            options: ['月曜日', '来週の水曜日', '土曜日'],
            answer: 1,
            explanation: '日曜日と来週の水曜日は休みです。',
          },
        ],
      },
    ],
  },
];
