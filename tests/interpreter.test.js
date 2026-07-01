import { describe, expect, it } from 'vitest';
import { compileIntoVerse } from '../src/utils/compileIntoVerse.js';
import { injectEnds } from '../src/utils/preprocess.js';
import { parse } from '../src/utils/parser.js';
import { VerseInterpreter } from '../src/utils/interpreter.js';

function run(source) {
	const ast = compileIntoVerse(source);
	return new VerseInterpreter().interpret(ast);
}

// skip analyzeProgram() so interpreter evaluation can be tested on constructs
// (e.g. printing logic/array values) that real Verse's semantic checks reject.
function runInterpreterOnly(source) {
	const ast = parse(injectEnds(source));
	return new VerseInterpreter().interpret(ast);
}

describe('VerseInterpreter output', () => {
	it('prints hello world and evaluates a string-interpolated expression', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

# See https://dev.epicgames.com/documentation/en-us/uefn/create-your-own-device-in-verse for how to create a verse device.

# A Verse-authored creative device that can be placed in a level
hello_world_device := class(creative_device):

    # Runs when the device is started in a running game
    OnBegin<override>()<suspends>:void=
        # TODO: Replace this with your code
        Print("Hello, world!")
        Print("2 + 2 = {2 + 2}")
`;

		const expected = [
			'Hello, world!',
			'2 + 2 = 4',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});

	
	it('evaluates arithmetic, logic, and compound assignment expressions', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var x : int = 10
        var y : int = 5
        var z : float = 2.5
        var isTrue : logic = true
        var isFalse : logic = false

        Print("x + y = {x + y}")
        Print("x - y = {x - y}")
        Print("x * y = {x * y}")
        Print("x / y = {x / y}")
        Print("x > y is {x > y}")
        Print("x < y is {x < y}")
        Print("isTrue and isFalse is {isTrue and isFalse}")
        Print("isTrue or isFalse is {isTrue or isFalse}")
        Print("not isTrue is {not isTrue}")
        Print("isTrue? evaluates to {isTrue?}")

        set x += 5
        Print("After x += 5, x is {x}")

        if (z > 2.0 and x > 10):
            Print("Both conditions are true!")
`;

		const expected = [
			'x + y = 15',
			'x - y = 5',
			'x * y = 50',
			'x / y = 2',
			'x > y is true',
			'x < y is false',
			'isTrue and isFalse is false',
			'isTrue or isFalse is true',
			'not isTrue is false',
			'isTrue? evaluates to true',
			'After x += 5, x is 15',
			'Both conditions are true!',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
});
