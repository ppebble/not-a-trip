import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Next.js 기본 설정 확장
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Prettier와 충돌하는 규칙 비활성화
  prettier,

  // 무시할 파일/폴더
  {
    ignores: [
      '.next/',
      'node_modules/',
      'out/',
      'public/',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '**/*.md',
    ],
  },

  // 커스텀 규칙
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript 규칙
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // 코드 품질
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // React 규칙
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
]

export default eslintConfig
