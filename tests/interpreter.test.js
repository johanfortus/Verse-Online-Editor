import { describe, it } from 'vitest';
import { compileIntoVerse } from '../src/utils/compileIntoVerse.js';
import { VerseInterpreter } from '../src/utils/interpreter.js';

function run(source) {
	const ast = compileIntoVerse(source);
	return new VerseInterpreter().interpret(ast);
}

describe('VerseInterpreter output', () => {
	it.todo('prints hello world and evaluates a string-interpolated expression');
});
