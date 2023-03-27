module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	extends: [
		'plugin:vue/vue3-essential',
		'plugin:vuetify/recommended',
		'eslint:recommended',
		'@vue/eslint-config-typescript',
	],
	rules: {
		'vue/multi-word-component-names': 'off',
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1
			}
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'vue/html-indent': [
			'warn',
			'tab'
		],
		'vue/html-quotes': [
			'warn',
			'single'
		],
		'vue/max-attributes-per-line': [
			'warn',
			{singleline: 3}
		]
	},
};
