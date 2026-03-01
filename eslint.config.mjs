// See: https://eslint.org/docs/latest/use/configure/configuration-files

import {FlatCompat} from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from 'typescript-eslint'
import globals from 'globals'

const compat = new FlatCompat()

export default typescriptEslint.config(
  js.configs.recommended,
  ...compat.extends('plugin:jest/recommended', 'plugin:prettier/recommended'),
  ...typescriptEslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-unused-vars': 'off'
    }
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/lib/**']
  }
)
