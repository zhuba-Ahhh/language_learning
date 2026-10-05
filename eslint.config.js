import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';

// 按解析后的源码路径检查依赖，别名、相对路径和转发导出使用同一套边界。
const sourceRoot = path.resolve(import.meta.dirname, 'src');
const allowedLayers = {
  pages: [
    'pages',
    'features',
    'study',
    'content',
    'components',
    'hooks',
    'lib',
  ],
  features: ['features', 'study', 'content', 'components', 'hooks', 'lib'],
  study: ['study', 'content', 'components', 'hooks', 'lib'],
  content: ['content'],
  components: ['components', 'hooks', 'lib'],
  hooks: ['hooks', 'lib'],
  lib: ['lib'],
};
const boundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      invalid:
        '不允许的模块依赖：{{from}} → {{to}}。请通过公开入口或共享下层模块复用。',
    },
  },
  create(context) {
    const filename = context.filename;
    const [layer, feature] = path
      .relative(sourceRoot, filename)
      .split(path.sep);
    function check(node, source) {
      if (!allowedLayers[layer] || typeof source?.value !== 'string') return;
      const specifier = source.value;
      if (specifier.endsWith('.less')) return;
      const local = specifier.startsWith('@/') || specifier.startsWith('.');
      const target = local
        ? path.relative(
            sourceRoot,
            specifier.startsWith('@/')
              ? path.resolve(sourceRoot, specifier.slice(2))
              : path.resolve(path.dirname(filename), specifier),
          )
        : specifier;
      const [targetLayer, targetFeature, ...rest] = target.split(path.sep);
      const typeOnly =
        node.importKind === 'type' ||
        node.exportKind === 'type' ||
        (node.specifiers?.length > 0 &&
          node.specifiers.every((s) => s.importKind === 'type'));
      const contentType =
        layer === 'components' && targetLayer === 'content' && typeOnly;
      const privateFeature =
        targetLayer === 'features' &&
        (layer !== 'features' || targetFeature !== feature) &&
        rest.length > 0 &&
        !(rest.length === 1 && /^index(?:\.[cm]?[jt]sx?)?$/.test(rest[0]));
      const invalid = local
        ? (!allowedLayers[layer].includes(targetLayer) && !contentType) ||
          privateFeature
        : layer === 'content';
      if (invalid)
        context.report({
          node: source,
          messageId: 'invalid',
          data: { from: layer, to: target },
        });
    }
    return {
      ImportDeclaration: (node) => check(node, node.source),
      ExportNamedDeclaration: (node) => check(node, node.source),
      ExportAllDeclaration: (node) => check(node, node.source),
      ImportExpression: (node) => check(node, node.source),
      CallExpression: (node) => {
        if (node.callee.name === 'require') check(node, node.arguments[0]);
      },
    };
  },
};

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: { architecture: { rules: { boundaries } } },
    rules: { 'architecture/boundaries': 'error' },
  },
  {
    files: ['src/content/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'navigator',
        'fetch',
      ],
    },
  },
]);
