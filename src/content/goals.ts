/** 学习目标目录；描述内容范围，不承载用户进度。 */
export type Skill = 'speaking' | 'reading' | 'listening' | 'writing';

export interface LearningGoal {
  id: string;
  language: 'en' | 'ja';
  title: string;
  subtitle: string;
  description: string;
  levels: string;
  skills: Skill[];
  available: boolean;
  note: string;
}

export const SKILL_LABELS: Record<Skill, string> = {
  speaking: '口语',
  reading: '阅读',
  listening: '听力',
  writing: '写作',
};

export const LEARNING_GOALS: LearningGoal[] = [
  {
    id: 'english-communication',
    language: 'en',
    title: '英语交流',
    subtitle: '日常与职场',
    description: '围绕真实场景练表达，通过分级材料积累阅读能力。',
    levels: '基础至进阶',
    skills: ['speaking', 'reading'],
    available: true,
    note: '现有口语场景、技术阅读和词汇可以直接使用。',
  },
  {
    id: 'ielts-academic',
    language: 'en',
    title: 'IELTS Academic',
    subtitle: '学术类雅思',
    description: '保留考试题型和计时规则，同时复用通用口语与阅读训练。',
    levels: '目标分 4.0—9.0',
    skills: ['speaking', 'reading', 'listening', 'writing'],
    available: false,
    note: '下一步需接入口语 Part 1—3、Academic Reading 题组与评分依据。',
  },
  {
    id: 'toefl-ibt',
    language: 'en',
    title: 'TOEFL iBT',
    subtitle: '留学英语',
    description: '围绕学术场景训练口语表达与长篇阅读。',
    levels: '目标分 0—120',
    skills: ['speaking', 'reading', 'listening', 'writing'],
    available: false,
    note: '计划接入口语任务、Reading 题组和计时练习。',
  },
  {
    id: 'japanese-communication',
    language: 'ja',
    title: '日语交流',
    subtitle: '生活与职场',
    description: '从假名和高频表达进入跟读、复述与真实材料阅读。',
    levels: '入门至进阶',
    skills: ['speaking', 'reading'],
    available: true,
    note: '现有假名、口语场景、日语词汇与阅读资源可以直接使用。',
  },
  {
    id: 'jlpt',
    language: 'ja',
    title: 'JLPT',
    subtitle: '日本语能力测试',
    description: '按等级组织语言知识、读解和听解，练习与模拟分别记录。',
    levels: 'N5—N1',
    skills: ['reading', 'listening'],
    available: false,
    note: 'JLPT 不考口语；口语训练继续归入“日语交流”目标。',
  },
  {
    id: 'j-test',
    language: 'ja',
    title: 'J.TEST',
    subtitle: '实用日本语鉴定',
    description: '以生活和职场材料训练读解、听解与语言知识。',
    levels: '入门至上级',
    skills: ['reading', 'listening'],
    available: false,
    note: '计划按级别接入读解题组与阶段测验。',
  },
];
