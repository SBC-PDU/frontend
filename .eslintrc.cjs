/**
 * Copyright 2022-2023 Roman Ondráček
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	overrides: [
		{
			files: ['*.js', '*.vue', '*.ts'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				ecmaVersion: 'latest',
				sourceType: 'module',
				tsconfigRootDir: __dirname,
				project: ['./tsconfig.json'],
				extraFileExtensions: ['.vue'],
			},
			extends: [
				'eslint:recommended',
				'plugin:@typescript-eslint/stylistic-type-checked',
				'plugin:vue/vue3-recommended',
				'plugin:vuetify/recommended',
				'plugin:import/recommended',
				'plugin:import/typescript',
				'plugin:jsdoc/recommended-typescript',
				'plugin:promise/recommended',
				'plugin:typescript-sort-keys/recommended',
				'plugin:@intlify/vue-i18n/recommended',
				'@vue/eslint-config-typescript',
			],
			plugins: [
				'@typescript-eslint',
				'@stylistic',
			],
			rules: {
				'@stylistic/arrow-parens': ['error', 'always'],
				'@stylistic/arrow-spacing': [
					'error',
					{
						before: true,
						after: true,
					},
				],
				'@stylistic/comma-dangle': ['error', 'always-multiline'],
				'@stylistic/comma-spacing': ['error', { before: false, after: true }],
				'@stylistic/eol-last': ['error', 'always'],
				'@stylistic/object-curly-spacing': ['error', 'always'],
				'@stylistic/switch-colon-spacing': ['error', { after: true, before: false }],
				'@stylistic/type-annotation-spacing': ['error', { before: false, after: true }],
				'@stylistic/type-generic-spacing': 'error',
				'@typescript-eslint/ban-ts-comment': 'off',
				'@typescript-eslint/consistent-type-imports': [
					'error',
					{
						prefer: 'type-imports',
						fixStyle: 'inline-type-imports',
					},
				],
				'@typescript-eslint/explicit-member-accessibility': 'error',
				'@typescript-eslint/no-explicit-any': 'warn',
				'comma-dangle': [
					'error',
					'always-multiline',
				],
				'eqeqeq': [
					'error',
					'always',
				],
				'indent': [
					'error',
					'tab',
					{
						'SwitchCase': 1,
					},
				],
				'import/consistent-type-specifier-style': [
					'error',
					'prefer-inline',
				],
				'import/no-unresolved': [
					'error',
					{
						ignore: ['^virtual:'],
					},
				],
				'import/order': [
					'error',
					{
						'alphabetize': {
							'order': 'asc',
							'caseInsensitive': true,
						},
						'pathGroups': [
							{
								'pattern': '@/**',
								'group': 'internal',
							},
						],
						'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
						'newlines-between': 'always',
					},
				],
				'jsdoc/require-returns': [
					'warn', {
						'forceReturnsWithAsync': false,
					}
				],
				'vue/multi-word-component-names': 'off',
				'linebreak-style': [
					'error',
					'unix',
				],
				'no-use-before-define': 'error',
				'prefer-const': 'error',
				'promise/always-return': 'warn',
				'quotes': [
					'error',
					'single',
				],
				'semi': [
					'error',
					'always',
				],
				'vue/html-indent': [
					'warn',
					'tab',
				],
				'vue/html-quotes': [
					'warn',
					'single',
				],
			},
		},
		{
			files: ['*.json', '*.json5', '*.jsonc'],
			parser: 'jsonc-eslint-parser',
			extends: [
				'plugin:jsonc/recommended-with-json',
			],
			rules: {
				"jsonc/indent": ["error",
					'tab',
					{}
				],
				"jsonc/key-spacing": ["error",
					{
						"beforeColon": false,
						"afterColon": true,
						"mode": "strict"
					}
				],
				'jsonc/no-dupe-keys': 'error',
				'jsonc/no-useless-escape': 'error',
			},
		},
	],
	settings: {
		'jsdoc': {
			tagNamePreference: {
				'returns': 'return',
			},
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			'node': true,
			'typescript': {
				'alwaysTryTypes': true,
				'project': './tsconfig.json',
			},
		},
		'vue-i18n': {
			localeDir: './src/locales/*.json',
			messageSyntaxVersion: '^9.0.0',
		},
	},
};
