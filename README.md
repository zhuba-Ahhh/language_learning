# LinguaDesk

英日双语训练室：以今日、口语、阅读、复习、记录五个入口组织学习。英语和日语分别保存路线与进度，训练页面、正文、译文、题目与解析全部在项目内；音频使用预生成 CDN 资源，学习流程没有外部页面跳转。

阅读正文、口语示范与句型例句支持点词听读、从词开始播放、播放到词末停止、同步高亮、语速选择和重点词句划线。已收录词可查看释义、加入复习。运行时不调用配音生成接口，也不使用系统朗读；所有 650 条配音通过 CDN 播放，61 段训练文本带配套字幕时间轴。补配音只在内容制作阶段运行 `pnpm audio:generate --align`。

当前包含 12 个原创完整单元、37 道阅读题、25 个口语任务、229 个去重词条和 104 个假名音节。覆盖英语起步、雅思专项、技术沟通、日语入门、N5 读解与生活场景，不代表完整考试题库。

练习记录与偏好保存在 localStorage，个人录音保存在 IndexedDB。支持含录音备份、恢复和旧版记录归档；原有存储键保留。桌面与移动浏览器均支持，原生安装包与 PWA 安装暂未实施。

## 技术栈与命令

React 19、TypeScript 5、Vite 7、React Router 7、Less Modules。
运行时直接依赖仅 `react`、`react-dom`、`react-router`。PostCSS 仅使用 Autoprefixer，不再依赖 Tailwind 或模板 UI 库。

使用 Node.js 20.19+ 或 22.12+，pnpm 10.12.1；提交依赖变更时同步维护 `pnpm-lock.yaml`。

```bash
pnpm install --frozen-lockfile
pnpm build              # TypeScript 检查与生产打包
pnpm lint               # ESLint，包括模块依赖边界
pnpm format             # 使用 Prettier 格式化代码、Less 与文档
pnpm format:check       # 只检查格式，不写入文件
pnpm dev               # 开发服务，仅按需手动运行
pnpm preview           # 预览已构建的 dist
pnpm test:training     # 内容、判分、记录、复习、导入与音频覆盖检查，需 Node 22.12+
```

2026-10-07 重构检查：`build`、`lint` 与训练检查通过。范围与浏览器验收见[重构实施记录](./docs/rebuild-verification.md)。

格式化使用单引号、两空格缩进，配置见 `.prettierrc.json`；`.prettierignore` 排除依赖目录、构建产物、覆盖率目录和 pnpm 锁文件。首次运行 `format:check` 可能报告既有文件的格式差异，可运行 `pnpm format` 统一格式。

## 目录与样式约定

| 目录                   | 职责                                                      |
| ---------------------- | --------------------------------------------------------- |
| `src/pages`            | 今日、练习、目标、进度四个入口的页面组合                  |
| `src/features`         | 各项学习能力及其私有组件                                  |
| `src/study`            | Provider、Context、学习状态 Hook、共享任务列表            |
| `src/content`          | 内置材料及纯数据类型                                      |
| `src/components`       | 通过 props 复用的标题、筛选、朗读控件                     |
| `src/hooks`、`src/lib` | 通用行为、日期与语音能力                                  |
| `src/styles`           | 全局入口、主题 token、基础样式、行为动画与少量 Less mixin |

组件放在独立文件夹，入口为 `index.tsx`，样式共置为 `index.module.less`。TS/TSX 文件不超过 200 行，Less 文件不超过 300 行。
全局样式只从 `src/main.tsx` 导入 `styles/index.less`；颜色和字体定义在 `tokens.less`，组件使用语义类名。`patterns.less` 通过 reference import 复用已有布局，不生成全局选择器。

ESLint 同时检查别名、相对路径、转发导出与字面量动态导入：功能不得访问另一功能的私有实现，下层模块不得反向引用页面或学习功能。

## 文档

- [文档导航](./docs/README.md)
- [功能重构设计](./docs/product-refactor.md)
- [重构实施与验收](./docs/rebuild-verification.md)
- [训练数据维护](./src/content/training/README.md)
- [目录整理与迁移记录](./docs/directory-organization.md)
- [架构、依赖与 Less 实施记录](./docs/architecture-less-plan.md)
- [功能现状与后续规划](./docs/functional-roadmap.md)
