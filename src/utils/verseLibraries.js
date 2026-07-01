import { VerseFailure } from './verseFailure.js';

function createNativeFunction(name, parameters, returnType, invoke, effects = []) {
	return {
		metadata: {
			type: 'NativeFunction',
			name,
			parameters,
			returnType,
			effects,
		},
		runtime: {
			invoke,
		},
	};
}

function convertFailableFloatToInt(name, value, convert) {
	if (!Number.isFinite(value)) {
		throw new VerseFailure(`${name}[${value}] failed: value is not finite`);
	}

	return convert(value);
}

function shuffleArray(values) {
	const shuffled = [...values];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
	}

	return shuffled;
}

const VERSE_LIBRARY_REGISTRY = {
	'/Fortnite.com/Devices': {
		exports: {
			creative_device: {
				type: 'NativeClass',
				name: 'creative_device',
			},
		},
	},
	'/Verse.org/Simulation': {
		exports: {},
	},
	'/Verse.org/Random': {
		exports: {
			GetRandomFloat: createNativeFunction(
				'GetRandomFloat',
				['float', 'float'],
				'float',
				(min, max) => Math.random() * (max - min) + min
			),
			GetRandomInt: createNativeFunction(
				'GetRandomInt',
				['int', 'int'],
				'int',
				(min, max) => Math.floor(Math.random() * (max - min + 1)) + min
			),
			Shuffle: createNativeFunction(
				'Shuffle',
				['array'],
				'array',
				values => {
					if (!Array.isArray(values)) {
						throw new Error('Shuffle expects an array');
					}

					return shuffleArray(values);
				}
			),
		},
	},
	'/UnrealEngine.com/Temporary/Diagnostics': {
		exports: {},
	},
	'/Verse.org/Verse': {
		exports: {
			Floor: createNativeFunction(
				'Floor',
				['float'],
				'int',
				value => convertFailableFloatToInt('Floor', value, Math.floor),
				['decides'],
			),
			Ceil: createNativeFunction(
				'Ceil',
				['float'],
				'int',
				value => convertFailableFloatToInt('Ceil', value, Math.ceil),
				['decides'],
			),
			Round: createNativeFunction(
				'Round',
				['float'],
				'int',
				value => convertFailableFloatToInt('Round', value, Math.round),
				['decides'],
			),
			Int: createNativeFunction(
				'Int',
				['float'],
				'int',
				value => convertFailableFloatToInt('Int', value, Math.trunc),
				['decides'],
			),
			Mod: createNativeFunction(
				'Mod',
				['int', 'int'],
				'int',
				(dividend, divisor) => {
					if (divisor === 0) {
						throw new VerseFailure(`Mod[${dividend}, ${divisor}] failed: division by zero`);
					}

					return ((dividend % divisor) + divisor) % divisor;
				},
				['decides'],
			),
		},
	},
};

const SYMBOL_IMPORT_SUGGESTIONS = new Map();

for (const [libraryPath, library] of Object.entries(VERSE_LIBRARY_REGISTRY)) {
	for (const symbolName of Object.keys(library.exports)) {
		SYMBOL_IMPORT_SUGGESTIONS.set(symbolName, libraryPath);
	}
}

// /Verse.org/Verse is the language prelude - real Verse makes it available
// in every file without an explicit `using`, so it's always in scope here too.
const IMPLICITLY_IMPORTED_PATHS = ['/Verse.org/Verse'];

export function resolveImportPaths(explicitImportPaths) {
	return [...new Set([...IMPLICITLY_IMPORTED_PATHS, ...explicitImportPaths])];
}

export function getLibrary(path) {
	return VERSE_LIBRARY_REGISTRY[path] || null;
}

export function getSuggestedUsingForSymbol(symbolName) {
	return SYMBOL_IMPORT_SUGGESTIONS.get(symbolName) || null;
}

export function getImportedSymbols(importPaths) {
	const symbols = new Map();

	for (const importPath of importPaths) {
		const library = getLibrary(importPath);
		if (!library) {
			continue;
		}

		for (const [symbolName, exportedSymbol] of Object.entries(library.exports)) {
			const symbol = exportedSymbol.metadata || exportedSymbol;
			if (!symbol) {
				continue;
			}

			symbols.set(symbolName, { ...symbol, importedFrom: importPath });
		}
	}

	return symbols;
}

export function getImportedRuntimeBindings(importPaths) {
	const nativeFunctions = new Map();

	for (const importPath of importPaths) {
		const library = getLibrary(importPath);
		if (!library) {
			continue;
		}

		for (const [symbolName, exportedSymbol] of Object.entries(library.exports)) {
			if (exportedSymbol.metadata?.type === 'NativeFunction') {
				nativeFunctions.set(symbolName, {
					...exportedSymbol.metadata,
					...exportedSymbol.runtime,
					importedFrom: importPath,
				});
				continue;
			}
		}
	}

	return {
		nativeFunctions,
	};
}

export { VERSE_LIBRARY_REGISTRY };
