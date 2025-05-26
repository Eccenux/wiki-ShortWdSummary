module.exports = {
	"env": {
		"node": true,
		"browser": true,
		"es2020": true,	// note that even using async/await (ES2017) might not be supported in MW minifier: https://phabricator.wikimedia.org/T277675
		"mocha": true,
	},
	"globals": {
		"$": false,
		"mw": true,
	},
	"ignorePatterns": [
		"dist/*",
	],
	"extends": "eslint:recommended",
	"overrides": [
		{
			"env": {
				"node": true,
				"browser": true,
			},
			"files": [
				".eslintrc.{js,cjs}"
			],
			"parserOptions": {
				"sourceType": "script"
			}
		},
		{
			"env": {
				"node": true,
				"browser": false,
				"es2021": true,
			},
			"files": [
				"*.mjs",
			],
			"parserOptions": {
				"sourceType": "module"
			}
		},
	],
	"rules": {
		"no-prototype-builtins": "off",
		"indent": [
			"error",
			"tab",
			{
				"SwitchCase": 1,
			},
		],
		//"array-bracket-newline": ["error", { "multiline": true, "minItems": 3 }],
		//"array-element-newline": ["error", { "multiline": true }]
		"array-element-newline": ["error", "consistent"]
	}
}