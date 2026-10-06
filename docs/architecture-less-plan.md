# 架构、依赖与 Less 整理方案

日期：2026-10-05  
状态：已按用户确认完成三批实施；原方案保留如下，实际落地与验收见第 7 节。

## 1. 结论与范围

保留已经落地的 `pages / features / study / content / components / hooks / lib` 分层。
以 Less Modules 编写组件样式、CSS 自定义属性管理主题，按功能逐步退出 Tailwind。
不引入新的状态库、UI 框架、依赖注入容器或构建工具。

实施分三批，每批独立验证：

1. 清理模板依赖，恢复标准构建，接入 Less。
2. 按共享组件、页面、功能的顺序迁移样式。
3. 核验无剩余消费者后移除 Tailwind，收口工程规范。

## 2. 代码依据

对全部源码的 import、export-from、字面量动态 import 和 require 建图，并从 `src/main.tsx` 遍历：

- 未发现源码循环依赖。
- `package.json` 声明 46 个直接运行时依赖；业务入口可达的包只有 `react`、`react-dom`、`react-router`。
- 53 个 `components/ui` 模板文件未被业务入口引用。
- `src/App.css`、`src/hooks/use-mobile.ts`、`src/lib/utils.ts` 不在业务入口可达图中。
- 其余 43 个直接运行时依赖仅供模板使用，或未发现代码消费者；删除必须与模板清理配套。
- `tw-animate-css` 未发现导入；`tailwindcss-animate` 仍由 Tailwind 配置加载，不能仅凭业务源码无 import 删除。
- `components.json` 仅服务 shadcn 生成流程；其中 Tailwind config 还指向了 PostCSS 配置。
- 同时存在 npm 与 pnpm 锁文件；后续统一 pnpm。

这反映安装和维护负担，不表示上述 43 个包全部进入了当前生产 JS。样式扫描仍覆盖模板文件，模板 utility 类可能扩大生成的 CSS。

已有标准构建失败来自 `kimi-plugin-inspect-react` 引用缺失的 Babel 插件。它服务检查标记生成，不属于学习功能；建议移除该插件及 Vite 注册，恢复普通 React/Vite 构建，而非为模板检查链补齐更多依赖。

## 3. 业务依赖约束

| 模块        | 保留职责                   | 边界                                  |
| ----------- | -------------------------- | ------------------------------------- |
| pages       | 页面、导航和 Provider 挂载 | 通过功能入口组合界面                  |
| features    | 单个学习功能及私有组件     | 不引用另一个 feature 的私有实现       |
| study       | 学习状态、任务与词汇记录   | 不依赖 features 或 pages              |
| content     | 内容、课程与数据类型       | 不依赖 React、浏览器或个人状态        |
| components  | 共享控件                   | 通过 props 接收业务信息，不读取 study |
| hooks / lib | 通用行为、日期和语音能力   | 不依赖功能页面或课程                  |

需要补充的拆分：

- `todayStr` 移到 `lib/date.ts`，热力图不再为日期格式化依赖整个状态模块。
- `StudyProvider` 放到 `study/StudyProvider/index.tsx`。
- Context 与现有状态类型放到 `study/context.ts`。
- `useStudy` 放到 `study/useStudy.ts`，统一更新调用方，删除原混合导出文件。
- 保留 Provider 内既有状态、存储 key 和写入语义，不在此批修改打卡或复习规则。
- 用现有 ESLint 的 import 限制约束跨层引用；同时核验相对路径，避免只约束 `@/` 别名。不新增依赖图工具链。

## 4. Less 组织方式

```text
src/
├── styles/
│   ├── index.less       # 唯一全局入口；迁移期保留 Tailwind 指令
│   ├── tokens.less      # 颜色、字体、圆角等 CSS 自定义属性
│   ├── base.less        # 基础排版、页面底色、滚动条
│   └── utilities.less   # 确有跨组件调用的工具与动画
├── components/
│   └── SpeakButton/
│       ├── index.tsx
│       └── index.module.less
├── pages/Home/
│   ├── index.tsx
│   └── index.module.less
└── features/
    └── flashcards/components/FlipCard/
        ├── index.tsx
        └── index.module.less
```

- `main.tsx` 只导入 `styles/index.less`；该入口通过 Less import 汇总全局文件。
- 迁移期的 `@tailwind`、`@layer` 放在同一全局编译链中，保留原有层级与覆盖顺序。
- 组件使用语义类名与嵌套选择器，显式引用 `styles.xxx`；不把长串 Tailwind 类机械搬进 `@apply`。
- CSS 自定义属性作为共享主题值的唯一来源；迁移期 Tailwind 配置引用同一颜色通道，并保留 `/15`、`/40` 等透明度行为。
- Less 用于嵌套和编译期复用；不再复制一份同名 Less 主题变量。
- 不用 `additionalData` 向每个组件重复注入会生成 CSS 的文件，也不启用无必要的 `javascriptEnabled`。
- `reveal`、`in-view`、`header-hidden` 被 Hook 以字符串操作：迁移时保留这些行为类，或同步改造 Hook 入参，不能直接改成不可匹配的哈希类。
- `slide-card-in` 属于闪卡功能，可随功能迁移共置；真正跨功能的动画保留一处定义。
- 单个 TS/TSX 不超过 200 行，Less 不超过 300 行；不提前建立大型 mixin 或工具类库。

## 5. 文件与依赖变更清单

| 批次 | 文件                                                                                | 操作                                                                                                    |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1    | `package.json`、`pnpm-lock.yaml`                                                    | 新增开发依赖 `less`；移除 43 个模板运行时依赖、Kimi 检查插件和未引用的 `tw-animate-css`；明确 pnpm 版本 |
| 1    | `vite.config.ts`                                                                    | 移除 `inspectAttr` 导入与注册；保留 React 插件和别名；Vite 原生处理 Less                                |
| 1    | `src/components/ui/`                                                                | 删除 53 个未使用模板文件                                                                                |
| 1    | `src/hooks/use-mobile.ts`、`src/lib/utils.ts`、`src/App.css`                        | 随消费者核验结果删除                                                                                    |
| 1    | `components.json`、`info.md`                                                        | 删除失去使用场景的模板生成配置与说明                                                                    |
| 1    | `package-lock.json`                                                                 | pnpm 安装与锁文件校验通过后删除                                                                         |
| 1    | `src/styles/{index,tokens,base,utilities}.less`                                     | 新增全局 Less 文件，迁入现有全局样式并去重主题值                                                        |
| 1    | `src/index.css`、`src/main.tsx`                                                     | 删除旧样式入口，更新入口引用                                                                            |
| 1    | `FlipCard/index.module.css`、`FlipCard/index.tsx`                                   | 样式改为 `index.module.less`，更新引用并使用嵌套                                                        |
| 1    | `tailwind.config.js`                                                                | 迁移期保留扫描与工具类支持，统一主题值引用                                                              |
| 2    | `src/study/useStudyState.tsx`                                                       | 拆分 Provider、Context、Hook 与日期函数后删除                                                           |
| 2    | `src/study/StudyProvider/index.tsx`、`context.ts`、`useStudy.ts`、`src/lib/date.ts` | 按职责新增文件，不改持久化格式                                                                          |
| 2    | `src/pages/Home/index.tsx`、功能文件与 Heatmap                                      | 更新状态和日期引用                                                                                      |
| 2    | `SpeakButton`、`LanguageFilter`、`TaskList` 的 TSX 与新增 Less Module               | 优先迁移共享样式，保留变体及尺寸差异                                                                    |
| 2    | `pages/Home`、七个 feature 及其私有组件的 TSX 与新增 Less Module                    | 逐功能替换 utility 类，保留断点、交互状态和布局                                                         |
| 3    | `src/styles/index.less`、`tailwind.config.js`、`package.json`、锁文件               | 无剩余 utility 消费者后删除 Tailwind 指令、配置和相关依赖                                               |
| 3    | `postcss.config.js`                                                                 | 删除 Tailwind 插件，保留 Autoprefixer；其依赖随实际配置保留                                             |
| 3    | `eslint.config.js`                                                                  | 增加依赖边界约束，不通过关闭规则消除原有业务问题                                                        |
| 各批 | `README.md`、`docs/README.md`、目录文档                                             | 更新真实技术栈、命令、目录和验证记录                                                                    |

第一批运行时直接依赖目标为 `react`、`react-dom`、`react-router`。
开发工具保留 TypeScript、Vite、React 插件、ESLint 与类型包；样式工具以 Less 为主，Tailwind/PostCSS 相关包按迁移阶段收口。
不同时升级 React/Vite/TypeScript 的主版本。

## 6. 验证要求

1. 迁移前保留新备份；依赖变更后执行 pnpm 安装及 frozen-lockfile 校验。
2. 每批执行 TypeScript、标准生产构建和 ESLint；区分删除模板消失的 lint 项与仍存在的业务问题。
3. 核验无悬空 import、循环依赖、层级反向引用、旧 CSS 路径和已删除包的消费者。
4. 词条、ID、课程任务顺序、五个 localStorage key 及格式保持一致。
5. 比较桌面/移动端布局、短屏、按钮尺寸、浅深任务行、透明度、翻卡和动画；接入 Less 本身不改变视觉设计。
6. 最后移除 Tailwind 前，覆盖七个功能的全部视图与状态，不只检查首页。
7. 不提交代码、不启动开发服务器；需要浏览器验证时使用隔离的临时生产静态产物。

## 7. 实施与验证记录

实施日期：2026-10-05。三批已完成，未增加考试功能或修改学习规则。

### 7.1 实际落地

- 删除 53 个未使用 UI 模板文件、旧样式入口、模板 Hook/工具、Kimi 检查插件及生成配置。
- 运行时直接依赖由 46 个降为 3 个：React、React DOM、React Router。仅新增 Less 开发依赖，移除 Tailwind 及动画插件，保留 Autoprefixer；统一 pnpm 锁文件。
- 全部业务样式迁为语义 Less Modules，无 `@apply`、Tailwind 指令、utility 消费者或旧 CSS 引用。
- `styles/index.less` 汇总 token、基础重置和全局行为动画；`patterns.less` 仅复用已有的区块间距、横向选项布局，不输出全局规则。
- 共享 `FeatureHeader` 统一六个功能标题区；朗读按钮的三种配色归入组件；任务列表与语言筛选继续复用。
- Provider、Context、Hook、日期函数分别归位；Provider 主体及日期函数与备份逐字比较一致（仅 Context 名称变化）。
- ESLint 检查别名、相对路径、转发导出及字面量动态导入的依赖边界。

### 7.2 验证结果

| 检查                             | 结果                                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | 通过，锁文件与依赖声明一致                                                                                             |
| `pnpm build`                     | 通过，包含 TypeScript 检查和标准 Vite 构建                                                                             |
| `pnpm lint`                      | 2 errors、0 warnings；两处均为迁移前已有的闪卡 Effect 同步更新状态问题                                                 |
| 同工具链 lint 基线               | 备份代码仍为 14 errors；删除模板与拆分混合导出消除 12 项，无新增问题                                                   |
| 引用图                           | 34 个 TS/TSX 文件，无悬空引用、无循环依赖                                                                              |
| 内容兼容                         | 8 个内容文件与备份逐字一致；13 卡组、148 词及 ID、课程顺序保持不变                                                     |
| 学习记录                         | 五个存储 key 与格式不变；任务同步、刷新持久化、词汇标记及假名成绩通过浏览器对照                                        |
| 浏览器                           | 36 个状态的正文、学习记录一致，未捕获 JavaScript 异常或 `console.error`                                                |
| 布局与样式                       | 同一状态下逐元素比较位置、尺寸（容差 0.15 CSS px）、字体、行高、边框、间距、配色、阴影、透明度与动画时长，最终差异为 0 |
| 文件规模                         | 全部业务 TS/TSX ≤200 行，Less ≤300 行                                                                                  |

浏览器覆盖七个入口、任务双向同步、刷新、翻卡、认识/不熟队列、完成和重开、跨卡组复习、词库语言筛选和搜索、平片假名切换、测验作答后返回保留成绩、移动端七个入口与测验、640px 高度短屏，以及阅读资源 hover。
最终报告保留前后各 36 个状态共 72 张步骤截图；迁移中发现的移动任务行行高与勾选动画时长差异已校正。

产物对比（未压缩）：

| 产物       |    迁移前 |                 迁移后 |
| ---------- | --------: | ---------------------: |
| CSS        |  90,362 B | 42,596 B（减少约 53%） |
| JavaScript | 338,039 B |              337,362 B |

迁移前产物仅为对照临时排除故障 Kimi 插件；迁移后使用标准 `pnpm build`。不把模板依赖数量的减少等同于同等比例的 JS 包体收益。

### 7.3 保留问题与验证边界

- [FlipCard](../src/features/flashcards/components/FlipCard/index.tsx) 与 [useFlashcardQueue](../src/features/flashcards/useFlashcardQueue.ts) 的 `react-hooks/set-state-in-effect` 尚未修改；未禁用规则。
- 动态内容 reveal、复习计数与重置范围等既有业务问题仍按功能规划处理；嵌套按钮已在后续修复中处理，见第 8 节。
- 对照屏蔽了 Google Fonts 请求，使用相同的本地回退字体；实际发音、外部阅读站点和每一种浏览器不在本轮验证范围。
- 截图与样式属性对照不等同于所有设备上的逐像素保证；未新增单测框架。

### 7.4 本机回溯资料

- 源码备份：`/var/folders/9p/1z97bbp936v3mtsvpw8yqsyh0000gn/T/linguadesk-less-ehhzlexd`。
- [浏览器报告](file:///Users/bytedance/Library/Caches/web-debug-harness/debug-reports/linguadesk-less-20261005/report.html)。
- [逐状态记录](file:///Users/bytedance/Library/Caches/web-debug-harness/debug-reports/linguadesk-less-20261005/comparison.json)。
- [最终样式差异（空数组）](file:///Users/bytedance/Library/Caches/web-debug-harness/debug-reports/linguadesk-less-20261005/style-diff.json)。

上述备份和证据位于本机临时/缓存目录。未初始化 Git、未提交代码、未启动开发服务器；验证使用的临时生产静态服务已停止。

## 8. 后续修复：闪卡按钮嵌套

用户反馈 React 开发模式的 `button cannot be a descendant of button` 警告后，已将闪卡外层改为普通容器，独立的原生翻面按钮与卡面内容并列。整卡仍可点击翻面，朗读按钮单独接收点击。不可见卡面设置 `inert`，避免键盘和辅助技术访问隐藏的朗读控件。

修改限定于 `FlipCard/index.tsx` 与共置的 Less Module。朗读组件、词条状态与翻卡动画逻辑保持不变。

验证复用用户已运行的 3000 端口开发服务，在隔离浏览器上下文完成，未启动新开发服务或提交代码：

- `pnpm build` 通过；ESLint 仍为两处既有的 `react-hooks/set-state-in-effect`，无新增问题。
- 桌面与移动端共 24 个步骤截图；开发页面中的嵌套按钮数量为 0，未捕获 React DOM 嵌套警告或其他 `console.error`。
- 鼠标点击整卡、Enter／Space 翻面、正反面鼠标与键盘朗读、Tab／Shift+Tab 焦点切换均通过；不可见卡面的按钮不会进入 Tab 顺序。
- 卡片尺寸保持桌面 720×400、移动端 358×340 CSS px，键盘焦点环正常显示。
- 语音 API 使用测试替身核对词条和例句参数，未验证实际发声；外部字体请求在测试中屏蔽。

[开发模式验证报告](file:///Users/bytedance/Library/Caches/web-debug-harness/debug-reports/linguadesk-button-fix-20261005/report.html) · [断言记录](file:///Users/bytedance/Library/Caches/web-debug-harness/debug-reports/linguadesk-button-fix-20261005/checks.json)
