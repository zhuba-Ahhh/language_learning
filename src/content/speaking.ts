/** 英日口语场景、练习提示与双语句子。 */
export interface Scenario {
  id: string;
  lang: 'en' | 'ja';
  title: string;
  subtitle: string;
  tip: string;
  sentences: { text: string; zh: string }[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'en-standup',
    lang: 'en',
    title: '站会汇报',
    subtitle: 'Daily Standup',
    tip: '站会三板斧：昨天做了什么 → 今天要做什么 → 有什么阻塞。语速放慢，说清楚比说得快重要。',
    sentences: [
      {
        text: 'Yesterday I worked on the login page and finished the form validation.',
        zh: '昨天我做了登录页，完成了表单校验。',
      },
      {
        text: "Today I'll continue with the API integration.",
        zh: '今天我会继续做接口联调。',
      },
      {
        text: "I'm blocked by the payment module — the docs are unclear.",
        zh: '支付模块把我卡住了——文档写得不清楚。',
      },
      { text: 'No blockers on my side.', zh: '我这边没有阻塞。' },
      {
        text: 'Could someone help me review this pull request?',
        zh: '有人能帮我看一下这个 PR 吗？',
      },
      {
        text: "I'll follow up on that offline.",
        zh: '这个问题我会后单独跟进。',
      },
    ],
  },
  {
    id: 'en-interview',
    lang: 'en',
    title: '面试自我介绍',
    subtitle: 'Self Introduction',
    tip: '结构：背景一句话 → 技术栈 → 最有成就感的项目 → 为什么想要这个机会。控制在 90 秒以内。',
    sentences: [
      {
        text: "I'm a computer science graduate with a focus on web development.",
        zh: '我是计算机专业毕业生，主攻 Web 开发。',
      },
      {
        text: 'My main stack is TypeScript, React and Node.js.',
        zh: '我的主要技术栈是 TypeScript、React 和 Node.js。',
      },
      {
        text: 'In my final year project, I built a real-time collaboration tool.',
        zh: '毕业设计中，我做了一个实时协作工具。',
      },
      {
        text: 'I reduced the page load time by forty percent through code splitting.',
        zh: '通过代码分割，我把页面加载时间缩短了 40%。',
      },
      {
        text: "I'm comfortable reading English documentation and technical articles.",
        zh: '我可以流畅阅读英文文档和技术文章。',
      },
      {
        text: "I'm looking for a role where I can grow into a full-stack engineer.",
        zh: '我希望找到一个能成长为全栈工程师的岗位。',
      },
    ],
  },
  {
    id: 'en-review',
    lang: 'en',
    title: 'Code Review',
    subtitle: 'Code Review',
    tip: '多用 "suggest / could we / what do you think" 这类委婉句式，对事不对人。',
    sentences: [
      {
        text: 'I suggest we extract this logic into a separate function.',
        zh: '我建议把这段逻辑抽成单独的函数。',
      },
      {
        text: 'Could we rename this variable to make it clearer?',
        zh: '能不能给这个变量换个更清晰的名字？',
      },
      {
        text: 'This looks good to me overall. Just one small thing.',
        zh: '整体没问题，只有一个小地方。',
      },
      {
        text: 'What do you think about handling the edge case here?',
        zh: '你觉得这里的边界情况要不要处理一下？',
      },
      {
        text: 'This might cause a memory leak in long-running processes.',
        zh: '这在长时间运行的进程里可能导致内存泄漏。',
      },
      { text: 'Nice catch — I missed that.', zh: '好眼力，这点我没注意到。' },
    ],
  },
  {
    id: 'ja-intro',
    lang: 'ja',
    title: '自我介绍',
    subtitle: '自己紹介',
    tip: '开头固定用「はじめまして」，结尾固定用「よろしくお願いいたします」。',
    sentences: [
      {
        text: 'はじめまして。ソフトウェアエンジニアの○○と申します。',
        zh: '初次见面，我是软件工程师 ○○。',
      },
      {
        text: '大学ではコンピューターサイエンスを専攻していました。',
        zh: '大学学的是计算机科学专业。',
      },
      {
        text: 'Web開発が得意で、Reactをよく使っています。',
        zh: '擅长 Web 开发，经常使用 React。',
      },
      {
        text: '前のプロジェクトでは、パフォーマンス改善を担当しました。',
        zh: '在上一个项目中负责性能优化。',
      },
      {
        text: '日本語は今勉強中で、毎日練習しています。',
        zh: '日语正在学习中，每天都在练习。',
      },
      { text: 'どうぞよろしくお願いいたします。', zh: '请多多关照。' },
    ],
  },
  {
    id: 'ja-work',
    lang: 'ja',
    title: '职场沟通',
    subtitle: '職場コミュニケーション',
    tip: '职场日语的核心是敬语缓冲：〜いたします、〜てもよろしいですか、〜させていただきます。',
    sentences: [
      {
        text: 'おはようございます。今日もよろしくお願いします。',
        zh: '早上好，今天也请多关照。',
      },
      {
        text: 'この件について、確認してもよろしいですか。',
        zh: '关于这件事，可以确认一下吗？',
      },
      {
        text: '修正が完了しましたので、ご確認お願いいたします。',
        zh: '修复已完成，请您确认。',
      },
      { text: '進捗はいかがですか。', zh: '进度怎么样了？' },
      {
        text: '少々お待ちいただけますか。今調べております。',
        zh: '能稍等一下吗？我正在查。',
      },
      { text: 'お疲れさまでした。', zh: '辛苦了。（下班/会议结束用）' },
    ],
  },
  {
    id: 'en-smalltalk',
    lang: 'en',
    title: '日常闲聊',
    subtitle: 'Small Talk',
    tip: '闲聊的核心不是词汇量，而是反应速度。先背熟固定开场句，用熟了再自由发挥。',
    sentences: [
      { text: "Hey, how's it going?", zh: '嘿，最近怎么样？' },
      { text: 'What did you do over the weekend?', zh: '周末干嘛了？' },
      {
        text: "The weather's been crazy lately, hasn't it?",
        zh: '最近天气真是反复无常，是吧？',
      },
      { text: "I'm really into cooking these days.", zh: '我最近迷上了做饭。' },
      {
        text: 'Have you watched anything good recently?',
        zh: '最近有看什么好剧吗？',
      },
      { text: "Let's grab coffee sometime.", zh: '改天一起喝咖啡吧。' },
    ],
  },
  {
    id: 'en-daily',
    lang: 'en',
    title: '生活办事',
    subtitle: 'Daily Errands',
    tip: "点餐、问路、购物是开口性价比最高的场景。注意礼貌句式：Could I… / I'd like…",
    sentences: [
      {
        text: "I'd like to make a reservation for two at seven.",
        zh: '我想订七点的两人位。',
      },
      { text: 'Could I have the menu, please?', zh: '请给我菜单。' },
      {
        text: 'Excuse me, how do I get to the subway station?',
        zh: '请问地铁站怎么走？',
      },
      { text: 'Is this seat taken?', zh: '这个座位有人吗？' },
      {
        text: 'Could you say that again more slowly?',
        zh: '能慢点再说一遍吗？',
      },
      { text: 'How much is this?', zh: '这个多少钱？' },
    ],
  },
  {
    id: 'ja-daily',
    lang: 'ja',
    title: '日常寒暄',
    subtitle: '日常会話',
    tip: '日语寒暄是固定模块：见面、天气、周末、约饭。语调平缓、句尾上扬是关键。',
    sentences: [
      { text: 'おはようございます。', zh: '早上好。' },
      { text: '元気ですか。', zh: '你好吗？' },
      { text: '週末は何をしましたか。', zh: '周末做了什么？' },
      { text: '今日はいい天気ですね。', zh: '今天天气真好。' },
      { text: '今度一緒にご飯を食べませんか。', zh: '下次一起吃饭吧？' },
      { text: 'また連絡しますね。', zh: '回头再联系。' },
    ],
  },
  {
    id: 'ja-life',
    lang: 'ja',
    title: '生活办事',
    subtitle: '買い物・道案内',
    tip: '万能句型：〜をください（请给我…）、〜はどこですか（…在哪里）、〜てもいいですか（可以…吗）。',
    sentences: [
      { text: 'すみません、駅はどこですか。', zh: '请问车站在哪里？' },
      { text: 'これをください。', zh: '请给我这个。' },
      { text: 'お会計をお願いします。', zh: '麻烦结账。' },
      { text: '予約したいのですが。', zh: '我想预约一下。' },
      { text: '写真を撮ってもいいですか。', zh: '可以拍照吗？' },
      { text: 'もう一度ゆっくり言ってください。', zh: '请再慢一点说一遍。' },
    ],
  },
];
