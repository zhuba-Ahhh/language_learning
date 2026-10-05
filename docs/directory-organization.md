# LinguaDesk 目录整理方案

更新日期：2026-10-05  
状态：A+B 已实施；C/D 尚未实施。验证结果见第 12 节。  
关联文档：[功能现状与演进规划](./functional-roadmap.md)

## 1. 整理目标

让开发者能够根据业务功能定位界面、交互和私有组件，同时明确内容数据、个人学习状态和通用能力的边界。

分批实施范围：

1. A 批：以移动和引用更新为主，建立功能边界，保留现有行为。
2. B 批：按职责拆分大文件、抽取已经存在的重复逻辑、整理组件样式。
3. C 批：独立核验并清理模板残留、无用依赖和说明文档。
4. D 批：随实际功能需求增加考试内容与练习能力。

目录整理不同时切换状态库、路由方案、CSS 方案或构建工具，不初始化尚未使用的模块。

## 2. 迁移前结构与问题

```text
src/
├── main.tsx
├── App.tsx
├── pages/Home.tsx
├── sections/               # 七个学习功能区
├── data/                   # 内置材料，类型与数据放在一起
├── hooks/                  # 通用 Hook 与业务状态混合
├── components/
│   ├── FlipCard.tsx        # 目前只被闪卡功能使用
│   ├── SpeakButton.tsx     # 被多个功能使用
│   └── ui/                # 53 个模板 UI 文件
├── lib/utils.ts            # shadcn 样式工具 cn
├── utils/speech.ts         # 浏览器语音工具
├── index.css               # 全局与业务组件样式混合
└── App.css                 # 未被引用的模板样式
```

迁移前识别的问题（前五项已在 A+B 中处理，模板与根说明文档留到 C 批）：

- `sections` 只表达页面区块，后续增加录音、错题和测验时，缺少明确的功能归属。
- `useStudyState.tsx` 承担任务、打卡和词汇状态，属于共享业务模块，放在通用 `hooks` 下不够清晰。
- `FlipCard` 是闪卡私有组件，`SpeakButton` 才是跨功能组件。
- `lib` 与 `utils` 语义重叠，可以收敛到现有 `lib`，保留 shadcn 的 `utils.ts` 约定。
- 今日与计划中的任务行、闪卡与词库中的语言筛选有重复实现。
- `FlashcardsSection.tsx`（218 行）、`KanaSection.tsx`（203 行）、`PlanSection.tsx`（226 行）和 `words.ts`（292 行）超过业务 TS/TSX 200 行目标。
- `components/ui` 当前只有内部相互引用，没有被业务入口引用；需要独立决定是否保留，不能仅因目录较大就认定它们全部进入产物。
- README 和 `info.md` 仍带有模板内容，后者包含旧生成路径和当前不存在的目录描述。

当前目录未被 Git 识别为仓库。本轮迁移前已备份源码、文档与根配置，未初始化仓库或提交代码。

## 3. A+B 完成后的实际目录

以下目录已经落地；Ring 保留在 Today 内部，未额外拆分。

```text
docs/
├── README.md
├── functional-roadmap.md
└── directory-organization.md

src/
├── main.tsx
├── App.tsx
├── index.css                       # 全局主题、基础样式、公共工具类
│
├── pages/
│   └── Home/
│       └── index.tsx               # 页面组合、导航、StudyProvider 挂载
│
├── features/
│   ├── today/
│   │   └── index.tsx
│   ├── flashcards/
│   │   ├── index.tsx
│   │   ├── useFlashcardQueue.ts                  # 队列与当前轮次
│   │   └── components/FlipCard/
│   │       ├── index.tsx
│   │       └── index.module.css                 # 组件私有翻卡样式
│   ├── vocabulary/
│   │   └── index.tsx
│   ├── speaking/
│   │   └── index.tsx
│   ├── reading/
│   │   └── index.tsx
│   ├── kana/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── KanaChart/index.tsx              # 字表视图
│   │       └── KanaQuiz/index.tsx               # 受控测验视图
│   └── plan/
│       ├── index.tsx
│       └── components/Heatmap/index.tsx          # 热力图
│
├── study/
│   ├── useStudyState.tsx           # 首批保留现有 Provider 与状态逻辑
│   └── components/TaskList/
│       └── index.tsx              # 今日/计划共享任务列表
│
├── content/
│   ├── plan.ts
│   ├── kana.ts
│   ├── speaking.ts
│   ├── reading.ts
│   └── words/
│       ├── index.ts               # 组装 DECKS、TOTAL_WORDS
│       ├── types.ts               # Word、Deck
│       ├── en.ts                  # 英语内置词条，保留原有分组
│       └── ja.ts                  # 日语内置词条，保留原有分组
│
├── components/
│   ├── SpeakButton/index.tsx
│   ├── LanguageFilter/index.tsx    # 共享受控语言筛选
│   └── ui/                        # A 批原位保留，C 批决定保留范围
│
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useScrollFx.ts
│   └── use-mobile.ts              # 当前仅供模板 Sidebar 使用
│
└── lib/
    ├── speech.ts
    └── utils.ts                   # 保留 cn 和 shadcn 引用约定
```

根目录的 Vite、TypeScript、Tailwind、ESLint 等配置保持原位。

不新增 `app/`、`shared/`、`core/` 等平行目录：现有 `App.tsx`、`components`、`hooks`、`lib` 已能表达对应职责。`features`、`study` 和 `content` 用来补足业务边界。

## 4. 模块职责与依赖

| 目录 | 职责 | 允许依赖 | 不应依赖 |
| --- | --- | --- | --- |
| `pages` | 路由页面、导航、功能组合 | features、study、公共组件与 Hook | 其他页面的内部实现 |
| `features` | 单个学习功能的界面与交互 | study、content、components、hooks、lib | 其他 feature 的私有组件和内部状态 |
| `study` | 个人学习状态、跨功能学习规则与业务组件 | content、通用 Hook/工具/组件 | features、pages |
| `content` | 类型、内置材料、课程定义、内容元数据 | 同目录内的纯数据和纯函数 | React 状态、浏览器 API、study、features |
| `components` | 跨功能复用的展示和交互控件 | 通用 Hook/工具，必要的内容类型 | study 状态、feature 内部实现、特定课程 |
| `hooks`、`lib` | 通用行为和浏览器能力 | 基础依赖与浏览器 API | 课程、目标、学习状态等业务规则 |

补充约束：

- 依赖关系从页面组合向下展开，`content` 不反向读取个人进度。
- 跨功能共享状态继续通过现有 StudyProvider/useStudy 访问，不为整理目录引入新状态库。
- feature 的 `index.tsx` 就是功能组件入口，不再额外创建只做转发的同名包装组件。
- 私有组件先留在 feature 内，出现实际复用时再提升。
- `study/components/TaskList` 可通过 props 接收任务、完成状态和回调，避免两处界面各自维护相同的勾选逻辑。
- `components/LanguageFilter` 接收选项、当前值和回调，不导入具体词库；语言集合由调用方提供。

## 5. A 批：文件移动记录

表中的“移动”包括必要的相对引用和 `@/` 引用更新；保持函数逻辑、导出名称、数据内容和存储格式不变。

| 迁移前路径 | A 批路径 | 说明 |
| --- | --- | --- |
| `src/pages/Home.tsx` | `src/pages/Home/index.tsx` | 页面组件独立目录 |
| `src/sections/TodaySection.tsx` | `src/features/today/index.tsx` | 今日功能入口 |
| `src/sections/FlashcardsSection.tsx` | `src/features/flashcards/index.tsx` | 闪卡功能入口 |
| `src/sections/VocabSection.tsx` | `src/features/vocabulary/index.tsx` | 目录使用完整业务名称 |
| `src/sections/SpeakingSection.tsx` | `src/features/speaking/index.tsx` | 口语功能入口 |
| `src/sections/ReadingSection.tsx` | `src/features/reading/index.tsx` | 阅读功能入口 |
| `src/sections/KanaSection.tsx` | `src/features/kana/index.tsx` | 假名功能入口 |
| `src/sections/PlanSection.tsx` | `src/features/plan/index.tsx` | 计划功能入口 |
| `src/components/FlipCard.tsx` | `src/features/flashcards/components/FlipCard/index.tsx` | 归入唯一使用方 |
| `src/components/SpeakButton.tsx` | `src/components/SpeakButton/index.tsx` | 保留跨功能复用 |
| `src/hooks/useStudyState.tsx` | `src/study/useStudyState.tsx` | 明确共享业务状态 |
| `src/data/plan.ts` | `src/content/plan.ts` | 原样移动内容 |
| `src/data/kana.ts` | `src/content/kana.ts` | 原样移动内容 |
| `src/data/speaking.ts` | `src/content/speaking.ts` | 原样移动内容 |
| `src/data/reading.ts` | `src/content/reading.ts` | 原样移动内容 |
| `src/data/words.ts` | `src/content/words.ts` | 本批不拆分 |
| `src/utils/speech.ts` | `src/lib/speech.ts` | 收敛工具目录 |

需要检查或更新的引用：

- `src/App.tsx`：确认 `./pages/Home` 解析到新的目录入口。
- `Home/index.tsx`：更新 feature 和学习状态引用。
- 所有功能组件、Flashcard 和状态文件：更新 `content`、`study`、`speech` 路径。
- 本目录三份文档中的现有源码链接：迁移完成后同步更新。
- `@/* → src/*` 保持不变；不需要因为新增 features 调整 Vite 和 TypeScript 的别名。
- Tailwind 现有 `src/**/*.{js,ts,jsx,tsx}` 能覆盖新目录，移动本身不要求修改扫描范围。
- `components.json` 中现有组件、工具和 Hook 别名保留；如 C 批改变生成目录，再同步调整。

旧 `sections`、`data`、`utils` 目录在引用迁移完成后自然清空，不长期保留转发文件和双份源码。

## 6. B 批：拆分与复用

### 6.1 大文件

| 文件 | 拆分方案 | 行为约束 |
| --- | --- | --- |
| `features/flashcards/index.tsx` | 队列和轮次逻辑抽为 `useFlashcardQueue.ts`；翻卡组件保持私有 | 拆分本身不改变掌握标记、队列规则或自动重置行为 |
| `features/kana/index.tsx` | 字表和测验抽为 `KanaChart`、`KanaQuiz` | 保持平片模式、分数及最佳记录的生命周期 |
| `features/plan/index.tsx` | 抽出 `Heatmap`，复用 `TaskList` | 保留展开状态、当前日显示和打卡行为 |
| `content/words.ts` | 按类型、英语、日语和聚合拆为四个文件 | 词条内容、顺序、ID 和分组保持一致 |

特别注意：当前假名分数在字表/测验切换时仍由父组件保存。拆出 `KanaQuiz` 时，应将需要保留的状态留在上层，避免因子组件卸载意外清零。

`Today` 当前不足 200 行，Ring 不必为了目录整齐强制抽取；文件增长或出现复用时再拆。

### 6.2 消除已有重复

- 今日和计划复用 `study/components/TaskList`，使用明确的外观选项适配浅色/深色背景。
- 闪卡和词库复用 `components/LanguageFilter`，选择状态仍由各自 feature 管理。
- 仅复用任务展示和切换行为，不把热力图、每日一句等不同职责塞入共享列表。
- 已经共用的 `SpeakButton`、`useLocalStorage` 和 `cn` 继续复用，不创建第二套实现。

### 6.3 样式归属

- 保留现有 Tailwind utilities 和主题配置。
- 全局 CSS 保留主题变量、基础字体、滚动条和真正跨组件的工具类。
- 翻卡样式迁入 `FlipCard/index.module.css`；其他样式在明确归属后逐项整理。
- 组件使用独立文件夹，入口为 `index.tsx`；有独立样式时同目录放置。
- 本批使用已有 CSS 能力，不为移动样式增加预处理依赖。后续若采用 SCSS/Less，再单独决定并配置。

业务 TS/TSX 以不超过 200 行为目标；样式以不超过 300 行为目标。为文件补充精简职责说明和关键函数注释，放在本批完成，不混入 A 批纯移动。

## 7. C 批：模板与依赖整理

| 对象 | 建议操作 | 前置核验 |
| --- | --- | --- |
| `src/App.css` | 确认无引用后删除 | 包括入口、样式 import 和工具配置 |
| `components/ui/*` | 根据实际保留计划裁剪；全部不用时可删除该子树 | 检查业务引用、动态加载及组件之间依赖 |
| `hooks/use-mobile.ts` | 随依赖它的 Sidebar 一起决定 | 不能仅凭业务入口未使用就单独删除依赖 |
| `lib/utils.ts` | 保留给实际使用的 UI；完全无调用时再决定删除 | 同步检查 `components.json` |
| `package.json` | 仅移除已经没有代码和工具使用的依赖 | 验证生产代码、配置、生成工具和构建链 |
| 锁文件 | 以 pnpm 为标准核对锁文件，再移除 npm 锁文件 | 先确认 pnpm 锁文件与 package.json 一致 |
| 根 `README.md` | 替换模板介绍，补充项目说明、命令和 docs 导航 | 命令与实际脚本一致 |
| `info.md` | 将有效信息合并到 README，保留需要的历史说明后再删除 | 识别旧路径、过时结构和重复说明 |

不因为源码未引用就宣称某依赖一定没有进入产物，也不把依赖删除和版本升级捆绑。

UI 模板若保留其上游生成结构，不为满足业务组件命名偏好机械拆成多个文件夹。对于超行数的模板文件，优先决定是否需要，再单独评估维护方式。

## 8. D 批：随功能增长增加目录

以下均为条件性扩展，不在本次目录整理中创建空目录。

| 真实需求 | 建议落点 | 复用方式 |
| --- | --- | --- |
| 听力与精听 | `features/listening/` | 各目标共用播放器和练习交互 |
| 写作 | `features/writing/` | 共用编辑、草稿、提交与反馈；题目与规则独立 |
| 语法 | `features/grammar/` | 共用知识点与练习展示，内容按语言组织 |
| 目标管理 | `features/goals/`、`study/goals.ts` | 界面和持久化业务规则分开 |
| 复习调度 | `study/review.ts` | 服务今日和复习入口，不依赖具体考试页面 |
| 阶段测评 | `features/assessment/` | 共用作答记录、计时和提交能力 |
| 雅思课程 | `content/courses/ielts-academic.ts` 等 | 先用普通数据组合内容与规则 |
| JLPT 课程 | `content/courses/jlpt-n5.ts` 等 | 按实际支持等级添加 |
| 作答历史 | `study/attempts.ts` | 内容引用、作答和结果独立保存 |
| 备份与恢复 | `study/backup.ts` | 集中处理学习数据的导出、校验和迁移 |

先使用明确的类型和普通对象组织课程。多个目标出现真实的运行逻辑差异后，再评估是否需要独立考试模块；不提前实现插件注册中心、通用工作流引擎或多层存储接口。

功能规划中的五个导航入口属于产品演进，不要求目录一比一对应。`Today` 可以组合多种学习能力，但各 feature 不应互相读取私有状态。

## 9. 历史数据兼容

目录整理期间必须保持以下 localStorage key 与数据含义：

| Key | 当前内容 |
| --- | --- |
| `lingua.start` | 开始学习日期 |
| `lingua.checks` | 计划日对应的已完成任务下标 |
| `lingua.checkins` | 打卡日期列表 |
| `lingua.marks` | 单词 ID 对应的认识/不认识标记 |
| `lingua.kanaBest` | 假名最佳正确率和答题数量 |

- 移动与拆分文件不能改变序列化格式、读写时机和默认值。
- 当前词条 ID 由语言、分组和组内下标生成；拆分词库时必须保留分组标识及组内顺序。
- 当前任务完成记录使用任务下标；整理目录期间不能顺便重排计划任务。
- 后续增加自建词条或更新内容时，应设计稳定标识与版本化迁移，先验证旧记录映射，再切换新格式。
- 修复“重置全部”范围和打卡语义属于单独的行为变更，不作为移动文件的附带操作。

## 10. 验证与实施顺序

### 10.1 建立基线

1. 确认工作目录、版本管理或备份方式，识别用户已有改动。
2. 记录当前构建和 lint 结果；已有问题与迁移引入的问题分开。
3. 保存一份含任务完成、打卡、词汇标记和假名成绩的学习记录用于迁移后对照。
4. 不自动提交，不启动开发服务器。浏览器验证在用户允许的验证条件下进行。

现有脚本：

```bash
pnpm build
pnpm lint
```

这两条命令已在迁移前后执行，结果见第 12 节。

### 10.2 逐批验证

| 批次 | 检查重点 |
| --- | --- |
| A：移动 | TypeScript 与打包可解析新路径；旧路径无残余；内容导出一致 |
| B：拆分 | 共用任务切换、语言筛选、闪卡队列、假名状态生命周期保持正确 |
| C：清理 | 删除对象无消费者；pnpm 依赖可解析；构建、lint 与生成工具配置一致 |
| D：功能 | 为新业务规则设计验收场景，独立于目录迁移验收 |

现有项目未配置测试脚本或发现独立测试文件，不假定已有测试框架。纯移动先检查引用与构建；涉及队列、日期、调度或数据迁移的行为修改，再增加有实际保护价值的针对性测试。

### 10.3 页面与数据验收

- 七个功能入口可访问，桌面和移动端导航保持原有行为。
- 今日与计划中同一任务的状态同步，刷新后记录仍在。
- 闪卡的认识、不熟、换卡组和重开流程可用。
- 假名字表与测验切换、模式切换、历史最佳记录符合原有规则。
- 搜索和语言筛选正常，新增动态内容可见。
- 朗读与翻卡操作、键盘操作不互相干扰。
- 迁移前后的全部存储 key、主要值、词条 ID、词条总量和计划顺序一致。
- 控制台与构建输出没有迁移新增错误，发现原有问题时单独记录。

## 11. 评审建议

A+B 已按用户授权实施。C 批独立核验模板与依赖，D 批依据功能优先级逐项实施。

需要评审的核心选择：

1. 已采用 `features + study + content` 的业务边界，并保留已有公共目录。
2. 模板 UI 是保留供近期使用，还是在独立核验后裁剪。
3. 首个考试训练单元面向哪类用户，以及内容从哪里获得。

后续评审聚焦模板保留范围与首个训练单元，不需要重新决定已落地的 A+B 目录边界。
