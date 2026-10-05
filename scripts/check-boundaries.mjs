/** 用最小样例验证跨层规则，避免相对路径或转发导出绕过边界。 */
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';

const eslint = new ESLint();
const cases = [
  ['src/pages/Home/index.tsx', "import View from '@/features/kana';", false],
  [
    'src/pages/Home/index.tsx',
    "import View from '@/features/kana/components/KanaQuiz';",
    true,
  ],
  [
    'src/features/kana/index.tsx',
    "import View from './components/KanaQuiz';",
    false,
  ],
  [
    'src/features/kana/index.tsx',
    "import View from '../plan/components/Heatmap';",
    true,
  ],
  [
    'src/features/kana/components/KanaQuiz/index.tsx',
    "export { default } from '../../../plan/components/Heatmap';",
    true,
  ],
  ['src/study/useStudy.ts', "import View from '../features/plan';", true],
  [
    'src/components/FeatureHeader/index.tsx',
    "import { useStudy } from '../../study/useStudy';",
    true,
  ],
  [
    'src/components/FeatureHeader/index.tsx',
    "import type { Word } from '@/content/words';",
    false,
  ],
  [
    'src/components/FeatureHeader/index.tsx',
    "import { DECKS } from '@/content/words';",
    true,
  ],
  ['src/lib/date.ts', "const view = import('../features/plan');", true],
  ['src/content/plan.ts', "export { useState } from 'react';", true],
  ['src/content/plan.ts', 'const browser = window;', true],
];

for (const [filePath, code, shouldFail] of cases) {
  const [result] = await eslint.lintText(code, { filePath });
  const failed = result.messages.some((m) =>
    ['architecture/boundaries', 'no-restricted-globals'].includes(m.ruleId),
  );
  assert.equal(failed, shouldFail, `${filePath}: ${code}`);
}
console.log(`PASS: ${cases.length} 个依赖边界样例`);
