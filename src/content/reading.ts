/** 按语言与难度组织的外部阅读资源。 */
export interface ReadingResource {
  name: string;
  url: string;
  level: 1 | 2 | 3; // 入门 / 进阶 / 高级
  desc: string;
}

export interface ReadingGroup {
  id: string;
  lang: 'en' | 'ja';
  title: string;
  subtitle: string;
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
        name: 'freeCodeCamp News',
        url: 'https://www.freecodecamp.org/news/',
        level: 1,
        desc: '句子短、用词简单，配图多，适合每天一篇起步。',
      },
      {
        name: 'DEV Community',
        url: 'https://dev.to/',
        level: 1,
        desc: '开发者社区博客，氛围友好，可以按你学的技术栈挑标签看。',
      },
      {
        name: 'MDN Web Docs（教程区）',
        url: 'https://developer.mozilla.org/zh-CN/docs/Learn',
        level: 1,
        desc: '权威前端教程，英文版措辞规范，中英对照读效果好。',
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
        name: '你所用语言的官方文档',
        url: 'https://docs.python.org/3/tutorial/',
        level: 2,
        desc: 'Python / React / Docker 官方文档，工作中最真实的阅读场景。',
      },
      {
        name: 'Stack Overflow',
        url: 'https://stackoverflow.com/questions',
        level: 2,
        desc: '热门问答帖是学习「如何用英语描述 bug」的最佳范本。',
      },
      {
        name: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/',
        level: 2,
        desc: '前端与设计深度长文，句式复杂一些，适合进阶训练。',
      },
      {
        name: 'Hacker News',
        url: 'https://news.ycombinator.com/',
        level: 2,
        desc: '技术圈讨论区，评论区是地道口语化书面英语的宝库。',
      },
    ],
  },
  {
    id: 'en-tech-hard',
    lang: 'en',
    title: '原版书 · 高级',
    subtitle: 'English · Advanced',
    resources: [
      {
        name: 'The Pragmatic Programmer',
        url: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
        level: 3,
        desc: '程序员必读原版书，语言平实，章节短，适合通勤读。',
      },
      {
        name: 'Clean Code',
        url: 'https://www.oreilly.com/library/view/clean-code-a/9780136083238/',
        level: 3,
        desc: '经典之作，例子多、重复词多，读技术书的最好起点。',
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
        name: 'NHK Easy News',
        url: 'https://www3.nhk.or.jp/news/easy/',
        level: 1,
        desc: '汉字全部标注假名的简易新闻，每天更新，配音频。',
      },
      {
        name: 'Tofugu 学习指南',
        url: 'https://www.tofugu.com/japanese/learn-japanese/',
        level: 1,
        desc: '五十音和语法入门讲得生动，适合搭配教材看。',
      },
    ],
  },
  {
    id: 'podcast',
    lang: 'en',
    title: '听力与播客',
    subtitle: 'Listening · Podcasts',
    resources: [
      {
        name: 'Fireship（YouTube）',
        url: 'https://www.youtube.com/@Fireship',
        level: 1,
        desc: '语速快但用词简单的技术短视频，100 Seconds 系列最适合影子跟读。',
      },
      {
        name: 'Traversy Media（YouTube）',
        url: 'https://www.youtube.com/@TraversyMedia',
        level: 1,
        desc: '教学型技术频道，发音清晰、节奏慢，新手友好。',
      },
      {
        name: 'Syntax.fm',
        url: 'https://syntax.fm/',
        level: 2,
        desc: 'Web 开发闲聊播客，日常口语 + 技术词汇的绝佳混合。',
      },
      {
        name: 'Software Engineering Daily',
        url: 'https://softwareengineeringdaily.com/',
        level: 3,
        desc: '深度技术访谈，语速快、术语密，适合后期挑战。',
      },
    ],
  },
  {
    id: 'podcast-ja',
    lang: 'ja',
    title: '听力与播客',
    subtitle: 'リスニング',
    resources: [
      {
        name: 'JapanesePod101',
        url: 'https://www.japanesepod101.com/',
        level: 1,
        desc: '分级日语课程音频，入门期影子跟读的主力材料。',
      },
      {
        name: 'Bilingual News',
        url: 'https://bilingualnews.jp/',
        level: 2,
        desc: '日英双语新闻播客，两位主播用两种语言讨论同一话题。',
      },
      {
        name: 'NHK やさしい日本語',
        url: 'https://www3.nhk.or.jp/news/easy/',
        level: 1,
        desc: '简易新闻配原声朗读，可以边听边看文字。',
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
        name: 'Qiita',
        url: 'https://qiita.com/',
        level: 2,
        desc: '日本最大的技术社区，程序员写的日语句式简单，非常适合你。',
      },
      {
        name: 'Zenn',
        url: 'https://zenn.dev/',
        level: 2,
        desc: '新一代技术平台，文章质量高，代码示例多。',
      },
      {
        name: 'はてなブックマーク 技术榜',
        url: 'https://b.hatena.ne.jp/hotentry/it',
        level: 3,
        desc: '日本技术圈热门榜，能读到更地道的评论和吐槽。',
      },
    ],
  },
];
