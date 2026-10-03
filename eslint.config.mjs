// See: https://eslint.org/docs/latest/use/configure/configuration-files

import js from '@eslint/js'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import typescriptEslint from 'typescript-eslint'

export default typescriptEslint.config(
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  prettierPluginRecommended,
  {
    languageOptions: {globals: globals.node}
  },
  {files: ['**/*.ts'], rules: {'no-unused-vars': 'off'}},
  {ignores: ['**/dist/**', '**/node_modules/**', '**/lib/**']}
)
