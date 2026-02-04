import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import svelteConfig from './svelte.config.mjs';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default defineConfig(
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.cjs',
      '*.config.mts',
      '*.ts',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      ...ts.configs.strict,
      ...ts.configs.stylistic,
      svelte.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,tsx,svelte}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        parser: ts.parser,
        extraFileExtensions: ['.svelte', '.svelte.ts'],
        svelteFeatures: {
          experimentalGenerics: true,
        },
        svelteConfig,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  prettier,
  prettierPlugin,
  {
    // XXX: 遇到冒号就报解析错误，无法使用
    files: ['**/*.svelte'],
    rules: {
      'prettier/prettier': 'off',
    },
  }
);
