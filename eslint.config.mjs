// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.angular/**', 'out-tsc/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // ------------------------------------------------------------------
      // Angular: seletores
      // ------------------------------------------------------------------
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      // ------------------------------------------------------------------
      // Angular: standalone e control flow são a norma
      // ------------------------------------------------------------------
      '@angular-eslint/prefer-standalone': 'error',
      // ------------------------------------------------------------------
      // Angular: OnPush (padrão explícito enquanto v21 não a torna default)
      // ------------------------------------------------------------------
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      // ------------------------------------------------------------------
      // Angular: boas práticas
      // ------------------------------------------------------------------
      '@angular-eslint/prefer-host-metadata-property': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/no-attribute-decorator': 'error',
      '@angular-eslint/no-forward-ref': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-pipe-impure': 'warn',
      // ------------------------------------------------------------------
      // TypeScript estrito
      // ------------------------------------------------------------------
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['arrowFunctions'] },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Control flow moderno obrigatório nos templates
      '@angular-eslint/template/prefer-control-flow': 'error',
      // Boas práticas nos templates
      '@angular-eslint/template/use-track-by-function': 'error',
      // Regras de acessibilidade (vindas de templateAccessibility)
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
  {
    // Regras mais permissivas para arquivos de teste (spec)
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@angular-eslint/no-inputs-metadata-property': 'off',
      '@angular-eslint/no-outputs-metadata-property': 'off',
      '@angular-eslint/no-queries-metadata-property': 'off',
      '@angular-eslint/prefer-inject': 'off',
    },
  },
);
