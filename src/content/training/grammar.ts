import type { Question } from './types';

export const GRAMMAR: Record<
  string,
  {
    tips: string[];
    chunks: { text: string; role: string }[];
    questions: Question[];
  }
> = {
  'en-my-major': {
    tips: [
      'chose 是 choose 的过去式，描述已经作出的选择。',
      'because 后接一个完整的原因，不只放一个名词。',
    ],
    chunks: [
      { text: 'I chose computer science ', role: '选择' },
      { text: 'because ', role: '原因连接词' },
      { text: 'I like building useful things.', role: '具体原因' },
    ],
    questions: [
      {
        id: 'choice-tense',
        kind: 'gap',
        prompt:
          '按例句填空：I _____ computer science because I like building useful things.',
        answer: 'chose',
        maxWords: 1,
        evidence: 0,
        explanation: '这里描述已经作出的选择，用 choose 的过去式 chose。',
      },
      {
        id: 'because-role',
        kind: 'choice',
        prompt: 'because 后面的部分说明什么？',
        options: ['选择的原因', '事情的结果', '下一个步骤'],
        answer: '选择的原因',
        evidence: 0,
        explanation: '先说选择了什么，再用 because 说明原因。',
      },
    ],
  },
  'en-study-day': {
    tips: [
      'First 引出第一步，Then 引出后续步骤。',
      'in my own words 表示用自己的话，而不是逐字背诵。',
    ],
    chunks: [
      { text: 'First, I read a short text. ', role: '第一步' },
      { text: 'Then I explain it ', role: '下一步' },
      { text: 'in my own words.', role: '表达方式' },
    ],
    questions: [
      {
        id: 'step-order',
        kind: 'choice',
        prompt: '例句中的两个步骤是什么顺序？',
        options: ['先解释，再阅读', '先阅读，再解释', '同时阅读和解释'],
        answer: '先阅读，再解释',
        evidence: 0,
        explanation: 'First 后是 read；Then 后是 explain。',
      },
      {
        id: 'own-words',
        kind: 'gap',
        prompt: '按例句填空：Then I explain it in my own _____.',
        answer: 'words',
        maxWords: 1,
        evidence: 0,
        explanation: 'in my own words 是“用我自己的话”。',
      },
    ],
  },
  'en-readme': {
    tips: [
      'Before + 动词 -ing，表示做某件事之前。',
      'check … 是操作指令，说明要先确认什么。',
    ],
    chunks: [
      { text: 'Before starting the server, ', role: '操作前' },
      { text: 'check ', role: '指令' },
      { text: 'your Node.js version.', role: '确认对象' },
    ],
    questions: [
      {
        id: 'before-form',
        kind: 'gap',
        prompt:
          '按例句填空：Before _____ the server, check your Node.js version.',
        answer: 'starting',
        maxWords: 1,
        evidence: 0,
        explanation: 'Before 后这里用动词 -ing 形式 starting。',
      },
      {
        id: 'before-order',
        kind: 'choice',
        prompt: '例句要求先做什么？',
        options: ['启动服务器', '检查 Node.js 版本', '关闭项目'],
        answer: '检查 Node.js 版本',
        evidence: 0,
        explanation: '版本检查发生在启动服务器之前。',
      },
    ],
  },
  'en-bug-report': {
    tips: [
      'expected … to … 说明预期发生的动作。',
      'Instead 引出与预期不同的实际结果。',
    ],
    chunks: [
      { text: 'I expected the page to update. ', role: '预期' },
      { text: 'Instead, ', role: '转折' },
      { text: 'it showed the old data.', role: '实际结果' },
    ],
    questions: [
      {
        id: 'instead-role',
        kind: 'choice',
        prompt: 'Instead 后的句子在这里说明什么？',
        options: ['预期结果', '实际出现的不同结果', '下一步操作'],
        answer: '实际出现的不同结果',
        evidence: 0,
        explanation: '前句说预期更新，后句说实际显示了旧数据。',
      },
      {
        id: 'expect-form',
        kind: 'gap',
        prompt: '按例句填空：I expected the page _____ update.',
        answer: 'to',
        maxWords: 1,
        evidence: 0,
        explanation: 'expect + 对象 + to + 动词原形：预期某人或某物做某事。',
      },
    ],
  },
  'en-ielts-learning': {
    tips: [
      '先给观点，再用 For example 引出具体经历。',
      '例子中的 built 描述已经完成的项目。',
    ],
    chunks: [
      { text: 'I enjoy practical courses. ', role: '观点' },
      { text: 'For example, ', role: '举例' },
      { text: 'I built a website in a programming class.', role: '具体经历' },
    ],
    questions: [
      {
        id: 'example-function',
        kind: 'choice',
        prompt: '第二句与第一句的关系是什么？',
        options: ['用经历支持观点', '否定前面的观点', '说明未来计划'],
        answer: '用经历支持观点',
        evidence: 0,
        explanation: '编程课做网站的经历支持“喜欢实践课程”的观点。',
      },
      {
        id: 'example-connector',
        kind: 'gap',
        prompt:
          '按例句填空：For _____, I built a website in a programming class.',
        answer: 'example',
        maxWords: 1,
        evidence: 0,
        explanation: 'For example 用来引出例子。',
      },
    ],
  },
  'en-ielts-city': {
    tips: [
      'may + 动词原形表示可能，不是所有人都如此。',
      'while 在这里对比两个群体的不同需求。',
    ],
    chunks: [
      { text: 'Families may need a play area, ', role: '家庭的需求' },
      { text: 'while ', role: '对比' },
      { text: 'older residents may need shade.', role: '老年居民的需求' },
    ],
    questions: [
      {
        id: 'while-role',
        kind: 'choice',
        prompt: 'while 在这个例句中表达什么？',
        options: ['两件事发生的时间', '不同群体之间的对比', '因果关系'],
        answer: '不同群体之间的对比',
        evidence: 0,
        explanation: '这里对比家庭与老年居民，不是说明时间。',
      },
      {
        id: 'may-form',
        kind: 'gap',
        prompt: '按例句填空：Families may _____ a play area.',
        answer: 'need',
        maxWords: 1,
        evidence: 0,
        explanation: '情态动词 may 后接动词原形 need。',
      },
    ],
  },
  'ja-first-intro': {
    tips: [
      'は 标出正在谈论的话题，作助词时读 wa。',
      '名词 + です 是礼貌的身份或状态说明。',
    ],
    chunks: [
      { text: '私は', role: '话题：我' },
      { text: '大学生', role: '身份' },
      { text: 'です。', role: '礼貌结尾' },
    ],
    questions: [
      {
        id: 'topic-particle',
        kind: 'gap',
        prompt: '按例句填空：私 _____ 大学生です。',
        answer: 'は',
        maxWords: 1,
        evidence: 0,
        explanation: 'は 标出话题“我”，这里读 wa。',
      },
      {
        id: 'desu-function',
        kind: 'choice',
        prompt: '「です」在这里的作用是什么？',
        options: ['表示过去', '礼貌地说明身份', '提出疑问'],
        answer: '礼貌地说明身份',
        evidence: 0,
        explanation: '「大学生です」礼貌地说明自己是大学生。',
      },
    ],
  },
  'ja-this-is': {
    tips: [
      'これ 指靠近说话人的事物。',
      '问句「何ですか」询问是什么，回答时用具体名词。',
    ],
    chunks: [
      { text: 'これは', role: '话题：这个' },
      { text: '本', role: '物品' },
      { text: 'です。', role: '礼貌说明' },
    ],
    questions: [
      {
        id: 'kore-position',
        kind: 'choice',
        prompt: '「これ」一般指哪一侧的物品？',
        options: ['靠近说话人', '靠近听话人', '离双方都远'],
        answer: '靠近说话人',
        evidence: 0,
        explanation: 'これ 靠近说话人，それ 靠近听话人，あれ 离双方较远。',
      },
      {
        id: 'object-statement',
        kind: 'gap',
        prompt: '按例句填空：これは _____ です。',
        answer: '本',
        maxWords: 1,
        evidence: 0,
        explanation: '例句用 本 回答物品是什么。',
      },
    ],
  },
  'ja-my-day': {
    tips: [
      'を 标记「勉強します」学习的对象。',
      '动词放在句末，「ます」用于礼貌表达。',
    ],
    chunks: [
      { text: '夜、', role: '时间' },
      { text: '日本語を', role: '学习对象' },
      { text: '勉強します。', role: '动作' },
    ],
    questions: [
      {
        id: 'object-particle',
        kind: 'gap',
        prompt: '按例句填空：夜、日本語 _____ 勉強します。',
        answer: 'を',
        maxWords: 1,
        evidence: 0,
        explanation: '日本語 是学习的对象，用助词 を 连接。',
      },
      {
        id: 'verb-position',
        kind: 'choice',
        prompt: '例句中「勉強します」表示什么？',
        options: ['时间', '学习的动作', '学习地点'],
        answer: '学习的动作',
        evidence: 0,
        explanation: '前面说明时间和对象，句末说明动作。',
      },
    ],
  },
  'ja-at-station': {
    tips: ['〜はどこですか 用于询问地点。', 'か 放在礼貌问句末尾，表示疑问。'],
    chunks: [
      { text: '駅は', role: '询问对象' },
      { text: 'どこ', role: '在哪里' },
      { text: 'ですか。', role: '礼貌问句' },
    ],
    questions: [
      {
        id: 'where-word',
        kind: 'gap',
        prompt: '按例句填空：駅は _____ ですか。',
        answer: 'どこ',
        maxWords: 1,
        evidence: 0,
        explanation: 'どこ 询问在哪里；何 询问是什么。',
      },
      {
        id: 'question-ending',
        kind: 'choice',
        prompt: '「駅はどこですか」中的「か」表示什么？',
        options: ['过去发生', '疑问', '否定'],
        answer: '疑问',
        evidence: 0,
        explanation: 'か 让礼貌陈述变成问句。',
      },
    ],
  },
  'ja-library-notice': {
    tips: [
      'から 表示起点，まで 表示终点。',
      '先找时间边界，再确认通知中的例外日期。',
    ],
    chunks: [
      { text: '午前九時から', role: '开始时间' },
      { text: '午後七時まで', role: '结束时间' },
      { text: 'です。', role: '礼貌说明' },
    ],
    questions: [
      {
        id: 'start-particle',
        kind: 'gap',
        prompt: '按例句填空：午前九時 _____ 午後七時までです。',
        answer: 'から',
        maxWords: 1,
        evidence: 0,
        explanation: '九点是开始时间，用 から；七点是结束时间，用 まで。',
      },
      {
        id: 'made-role',
        kind: 'choice',
        prompt: '例句中的「午後七時まで」表示什么？',
        options: ['从下午七点开始', '到下午七点为止', '下午七点以后'],
        answer: '到下午七点为止',
        evidence: 0,
        explanation: 'まで 标记范围的终点。',
      },
    ],
  },
  'ja-team-message': {
    tips: [
      '確認したい 表示想确认，不是已经确认。',
      'ことがあります 在这里表示有一件这样的事。',
    ],
    chunks: [
      { text: '一つ', role: '数量：一件' },
      { text: '確認したいことが', role: '想确认的事' },
      { text: 'あります。', role: '有这样的事' },
    ],
    questions: [
      {
        id: 'want-form',
        kind: 'choice',
        prompt: '「確認したい」表达哪种意思？',
        options: ['已经确认', '想确认', '不能确认'],
        answer: '想确认',
        evidence: 0,
        explanation: 'たい 表示想做某事，这里是想确认。',
      },
      {
        id: 'existence-form',
        kind: 'gap',
        prompt: '按例句填空：一つ確認したいことが _____。',
        answer: 'あります',
        maxWords: 1,
        evidence: 0,
        explanation: '这里用 あります 表示有一件想确认的事。',
      },
    ],
  },
};
