# LinguaDesk

英日双语学习台：以今日、练习、目标、进度四个入口组织学习，口语与阅读为核心能力，闪卡、词库、假名和复习作为基础工具。
学习材料内置，进度保存在当前浏览器的 localStorage；尚未实现账户同步、雅思或 JLPT 专项训练。

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
pnpm check:boundaries   # 验证边界规则的正反例
pnpm dev               # 开发服务，仅按需手动运行
pnpm preview           # 预览已构建的 dist
```

当前 `build` 与边界样例通过。`lint` 仍报告闪卡中两处既有的 `react-hooks/set-state-in-effect` 问题，详见[实施记录](./docs/architecture-less-plan.md#7-实施与验证记录)。

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
- [目录整理与迁移记录](./docs/directory-organization.md)
- [架构、依赖与 Less 实施记录](./docs/architecture-less-plan.md)
- [功能现状与后续规划](./docs/functional-roadmap.md)
