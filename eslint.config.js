// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

// Layer boundaries from docs/architecture/frontend.md §3. Later blocks replace the rule for the files they
// match, so each block lists the complete set of restrictions for its layer.
const mockImports = {
  group: ['**/data-access/mock', '**/data-access/mock/**'],
  message: 'The mock adapter is reached only through provideAtlasData() (frontend.md §6).',
};
const featureImports = {
  group: ['**/features/**'],
  message: 'core/ and shared/ must not depend on features; move shared code down a layer.',
};
const presentationalRestrictions = {
  paths: [
    {
      name: '@angular/common/http',
      message:
        'Presentational components take inputs and emit outputs; HTTP belongs in core/data-access/http.',
    },
  ],
  patterns: [
    {
      group: ['**/data-access', '**/data-access/**', '**/environments/**'],
      message:
        'Presentational components must not reach data access or build flags; pages and stores pass data in.',
    },
    featureImports,
  ],
};

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'atlas',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'atlas',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    ignores: ['src/app/core/data-access/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [mockImports] }],
    },
  },
  {
    files: ['src/app/core/**/*.ts'],
    ignores: ['src/app/core/data-access/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [mockImports, featureImports] }],
    },
  },
  {
    files: ['src/app/core/data-access/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [featureImports] }],
    },
  },
  {
    files: ['src/app/shared/**/*.ts', 'src/app/features/*/components/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', presentationalRestrictions],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
