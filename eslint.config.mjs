// Syntax/error guard for TypeScript and JS. Type safety is checked separately by tsc.
// Use existing @typescript-eslint/parser; avoid fixing unrelated style in this evidence pass.
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'test-results/**',
    'tests/e2e/reports/**', 'temp_github/**'] },
  {
    files: ['src/**/*.{ts,tsx}', 'packages/core/src/**/*.{ts,tsx}',
      'tests/unit/**/*.{ts,tsx}', 'server.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unreachable': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-case': 'error',
    },
  },
];
