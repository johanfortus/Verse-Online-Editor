import { describe, expect, it } from 'vitest';
import { compileIntoVerse } from '../src/utils/compileIntoVerse.js';

function analyze(source) {
	return compileIntoVerse(source);
}

describe('semantic analysis - Print string-convertibility', () => {
	it.todo('rejects interpolating a logic value in a Print string');
	it.todo('rejects printing an array value');
});

describe('semantic analysis - decides effect / failure contexts', () => {
	it('rejects calling a decides function with ()', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        if (IsGreater(10, 5)):
            Print("yes")
        else:
            Print("no")

    IsGreater(A:int, B:int)<transacts><decides>:void=
        A > B
`;

		expect(() => analyze(source)).toThrow();
	});

	it('rejects calling a decides function with [] outside a failure context', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var Result : logic = IsGreater[10, 5]

    IsGreater(A:int, B:int)<transacts><decides>:void=
        A > B
`;

		expect(() => analyze(source)).toThrow();
	});

	it('rejects calling Floor[] outside a failure context', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /Verse.org/Verse }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var Result : int = Floor[4.0]
`;

		expect(() => analyze(source)).toThrow();
	});

	it('accepts calling a decides function with [] inside an if condition', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        if (IsGreater[10, 5]):
            Print("yes")
        else:
            Print("no")

    IsGreater(A:int, B:int)<transacts><decides>:void=
        A > B
`;

		expect(() => analyze(source)).not.toThrow();
	});
});
