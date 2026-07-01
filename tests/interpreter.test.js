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

describe('variables and string interpolation', () => {
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


	it('handles variable initialization, string interpolation, and reassignment', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var playerName : string = "John Doe"
        var height : int = 100
        var strength : int = 100
        var charisma : string = "Uncharismatic"
        var favoriteFood : string = "Mac n Cheese"
        var totalXP : float = 1500.25

        Print("Name: {playerName}")
        Print("Height: {height}")
        Print("Strength: {strength}")
        Print("Charisma: {charisma}")
        Print("Favorite Food: {favoriteFood}")
        Print("Total XP: {totalXP}")

        set strength = 110
        Print("Updated Strength: {strength}")
`;

		const expected = [
			'Name: John Doe',
			'Height: 100',
			'Strength: 100',
			'Charisma: Uncharismatic',
			'Favorite Food: Mac n Cheese',
			'Total XP: 1500.25',
			'Updated Strength: 110',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});

	
	it('handles inline evaluation of logic variables', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var isTrue : logic = true
        var isFalse : logic = false
        Print("{isTrue}")
        Print("{isFalse}")
`;

		const expected = [
			'true',
			'false',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});


	it('handles initialization of primitive variable types', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var myName : string = "Johan"
        var x : int = 20
        var y : float = 21.0
        var isTrue : logic = true
        var isFalse : logic = false
`;

		const expected = [
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	})
});


describe('control flow', () => {
	it('evaluates a loop with a break statement', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var i : int = 0
        loop:
            Print("i is {i}")
            set i += 1
            if (i > 5):
                break
`;

		const expected = [
			'i is 0',
			'i is 1',
			'i is 2',
			'i is 3',
			'i is 4',
			'i is 5',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});


	it('evaluates for loop', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        for (x := 1..5):
            Print("x is {x}")
`;

		const expected = [
			'x is 1',
			'x is 2',
			'x is 3',
			'x is 4',
			'x is 5',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});

	it('evaluates multiple independent loops consecutively', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var i : int = 0
        loop:
            Print("i is {i}")
            set i += 1
            if (i > 5):
                break

        var j : int = 0
        loop:
            Print("j is {j}")
            set j += 1
            if (j > 5):
                break
`

		const expected = [
			'i is 0',
			'i is 1',
			'i is 2',
			'i is 3',
			'i is 4',
			'i is 5',
			'j is 0',
			'j is 1',
			'j is 2',
			'j is 3',
			'j is 4',
			'j is 5',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
});


describe('operators', () => {
	it('handles logical operators and the query/decision operator', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var isTrue : logic = true
        var isFalse : logic = false
        Print("isTrue and isFalse is {isTrue and isFalse}")
        Print("isTrue or isFalse is {isTrue or isFalse}")
        Print("not isTrue is {not isTrue}")
        Print("isTrue? evaluates to {isTrue?}")
`

		const expected = [
			'isTrue and isFalse is false',
			'isTrue or isFalse is true',
			'not isTrue is false',
			'isTrue? evaluates to true',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});


	it('evaluates and prints raw logical expressions', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var a : logic = true
        var b : logic = false
        Print("{a and b}")
        Print("{a or b}")
        Print("{not a}")
        Print("{a?}")
`

		const expected = [
			'false',
			'true',
			'false',
			'true',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});

	it('float variable initialization and compound arithmetic assignments', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

# See https://dev.epicgames.com/documentation/en-us/uefn/create-your-own-device-in-verse for how to create a verse device.

# A Verse-authored creative device that can be placed in a level
hello_world_device := class(creative_device):

    # Runs when the device is started in a running game
    OnBegin<override>()<suspends>:void=

        var X : float = 100.0
        set X += 10.0
        Print("{X}")

        set X -= 10.0
        Print("{X}")

        set X *= 10.0
        Print("{X}")

        set X /= 2.0
        Print("{X}")
`;

		const expected = [
			'110',
			'100',
			'1000',
			'500',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
});


describe('arrays', () => {
	it('handles array iteration and conditional element indexing', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var ExampleArray : []int = array{10, 20, 30, 40, 50}
        for (Index := 0..ExampleArray.Length - 1):
            if (Element := ExampleArray[Index]):
                Print("{Element} in ExampleArray at index {Index}")
`
		const expected = [
			'10 in ExampleArray at index 0',
			'20 in ExampleArray at index 1',
			'30 in ExampleArray at index 2',
			'40 in ExampleArray at index 3',
			'50 in ExampleArray at index 4',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
});


describe('functions', () => {
	it('handles custom function definition, invocation, and return values', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        result := Add(2, 2)
        Print("{result}")
        
    Add(a: int, b: int) : int=
        return a + b
`;

		const expected = [
			'4',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});


	it('calls a user-defined decides function and branches on success/failure', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        if (IsGreater[10, 5]):
            Print("The comparison was successful!")
        else:
            Print("The comparison failed.")
            
    IsGreater(A:int, B:int)<transacts><decides>:void=
        A > B
`;

		const expected = [
			'The comparison was successful!',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
})


describe('curly brace syntax', () => {
	it('handles curly brace block syntax', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var ExampleArray : []int = array{10, 20, 30, 40, 50, 60}
        for (Index := 0..ExampleArray.Length - 1) {
            if (Element := ExampleArray[Index]) {
                Print("{Element} in ExampleArray at index {Index}")
            }
        }

        if (3.0 > 2.0 and 20 > 10) {
            Print("Both conditions are true!")
        }
`;

		const expected = [
			'10 in ExampleArray at index 0',
			'20 in ExampleArray at index 1',
			'30 in ExampleArray at index 2',
			'40 in ExampleArray at index 3',
			'50 in ExampleArray at index 4',
			'60 in ExampleArray at index 5',
			'Both conditions are true!',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});

	it('handles newline curly brace formatting (Allman style)', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        var ExampleArray : []int = array{10, 20, 30, 40, 50, 60}
        for (Index := 0..ExampleArray.Length - 1)
        {
            if (Element := ExampleArray[Index])
            {
                Print("{Element} in ExampleArray at index {Index}")
            }
        }

        if (3.0 > 2.0 and 20 > 10)
        {
            Print("Both conditions are true!")
        }
`;

		const expected = [
			'10 in ExampleArray at index 0',
			'20 in ExampleArray at index 1',
			'30 in ExampleArray at index 2',
			'40 in ExampleArray at index 3',
			'50 in ExampleArray at index 4',
			'60 in ExampleArray at index 5',
			'Both conditions are true!',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
});


describe('integration', () => {
	it('evaluates a combination of features - control flow, expressions, loops, and arrays', () => {
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

        var i : int = 0
        loop:
            Print("i is {i}")
            set i += 1
            if (i > 5):
                break

        var ExampleArray : []int = array{10, 20, 30, 40, 50}
        for (Index := 0..ExampleArray.Length - 1):
            if (Element := ExampleArray[Index]):
                Print("{Element} in ExampleArray at index {Index}")
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
			'i is 0',
			'i is 1',
			'i is 2',
			'i is 3',
			'i is 4',
			'i is 5',
			'10 in ExampleArray at index 0',
			'20 in ExampleArray at index 1',
			'30 in ExampleArray at index 2',
			'40 in ExampleArray at index 3',
			'50 in ExampleArray at index 4',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});

	it('handles comments, constants, type inference, and control flow structures', () => {
		const source = `
using { /Fortnite.com/Devices }
using { /Verse.org/Simulation }
using { /UnrealEngine.com/Temporary/Diagnostics }

hello_world_device := class(creative_device):

    OnBegin<override>()<suspends>:void=
        # Write your Verse code here
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

        var i : int = 0
        loop:
            Print("i is {i}")
            set i += 1
            if (i > 5):
                break

        var ExampleArray : []int = array{10, 20, 30, 40, 50}
        for (Index := 0..ExampleArray.Length - 1):
            if (Element := ExampleArray[Index]):
                Print("{Element} in ExampleArray at index {Index}")

        AConstantInteger := 5
        Print("AnInteger: {AConstantInteger}")

        var AnInteger : int = 7
        Print("AnotherInteger: {AnInteger}")

        for (i : int = 0..10):
            Print("{i}")
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
			'i is 0',
			'i is 1',
			'i is 2',
			'i is 3',
			'i is 4',
			'i is 5',
			'10 in ExampleArray at index 0',
			'20 in ExampleArray at index 1',
			'30 in ExampleArray at index 2',
			'40 in ExampleArray at index 3',
			'50 in ExampleArray at index 4',
			'AnInteger: 5',
			'AnotherInteger: 7',
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'',
		].join('\n');

		expect(runInterpreterOnly(source)).toBe(expected);
	});
});