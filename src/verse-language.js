// verse-language.js
// This file defines how the Verse syntax is recognized by the Monaco editor.
// Keywords & Operators - Specifies syntax elements like keywords and operators
// Tokenizer: Defines rules for tokenizing the Verse language:
// root: Describes the primary structure, including keywords, identifiers, and string literals.
// comment, string, and whitespace: Define how to handle comments, strings, and whitespace.


// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export function registerVerseLanguage(monaco) {

	// Register the 'verse' language with Monaco
	console.log("Before registering language");
	monaco.languages.register({ id: 'verse' });
	console.log("Verse language registered");

	// Set the language rules for syntax highlighting using Monarch Tokens Provider
	monaco.languages.setMonarchTokensProvider('verse', {

		// Keywords
		keywords: [
			'function', 'var', 'let', 'if', 'else', 'for', 'return', 'Print'
		],
		typeKeywords: [
			'string', 'number', 'boolean', 'void'
		],

		// Operators
		operators: [
			'=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
			'&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
			'<<', '>>', '>>>'
		],

		// Symbols
		symbols: /[=><!~?:&|+\-*\/\^%]+/,

		// Escapes
		escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

		// Tokenizer rules 
		tokenizer: {
			root: [

				// Rules for identifiers (variables, functions, etc) which are classified by cases
				[/[a-z_$][\w$]*/, {
					cases: {
						'@typeKeywords': 'keyword',
						'@keywords': 'keyword',
						'@default': 'identifier'
					}
				}],

				// Identifies type identifiers that start with an uppercase letter
				[/[A-Z][\w\$]*/, 'type.identifier'],

				// Include whitespace rules
				{ include: '@whitespace' },

				// Recognizes brackets for grouping code
				[/[{}()\[\]]/, '@brackets'],

				// Recognizes angle brackets in contexts other than as symbols
				[/[<>](?!@symbols)/, '@brackets'],

				// Recognizes operators based on the defined list
				[/@symbols/, {
					cases: {
						'@operators': 'operator',
						'@default': ''
					}
				}],

				// Recognizes floating-point numbers
				[/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],

				// Recognizes hexadecimal numbers
				[/0[xX][0-9a-fA-F]+/, 'number.hex'],

				// Recognizes integer numbers
				[/\d+/, 'number'],

				// Recognizes delimiters such as semicolons and commas
				[/[;,.]/, 'delimiter'],

				// Identifies unterminated strings as invalid
				[/"([^"\\]|\\.)*$/, 'string.invalid'],

				// Recognizes strings starting with a double quote
				[/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
			],

			// Defines how comments are handled
			comment: [
				[/[^\#]+/, 'comment'],
				[/#/, 'comment', '@pop']
			],

			// Rules for string tokenization
			string: [

				// Recognizes valid string content
				[/[^\\"]+/, 'string'],

				// Recognizes escape sequences within strings
				[/@escapes/, 'string.escape'],

				// Recognizes invalid escape sequences
				[/\\./, 'string.escape.invalid'],

				// Closes strings when encountering a closing quote
				[/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
			],

			// Defines handling of whitespace and comments
			whitespace: [
				[/[ \t\r\n]+/, 'white'],
				[/#.*$/, 'comment'],
			],
		},
	});
	console.log("Verse tokenizer loaded");

	monaco.editor.defineTheme('verse-theme', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'keyword', foreground: '#569CD6' },
			{ token: 'type', foreground: '#4EC9B0' },
			{ token: 'number', foreground: '#B5CEA8' },
			{ token: 'string', foreground: '#CE9178' },
			{ token: 'comment', foreground: '#6A9955' },
			{ token: 'operator', foreground: '#D4D4D4' },
			{ token: 'identifier', foreground: '#9CDCFE' },
			{ token: '@brackets', foreground: '#FFD700' }
		],
		colors: {
			'editor.background': '#1E1E1E',
		}
	});
	console.log('verse theme loaded');
}
