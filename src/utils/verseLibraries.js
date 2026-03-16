const VERSE_LIBRARY_REGISTRY = {
	'/Fortnite.com/Devices': {
		symbols: {
			creative_device: {
				type: 'NativeClass',
				name: 'creative_device',
			},
		},
	},
	'/Verse.org/Simulation': {
		symbols: {},
	},
	'/UnrealEngine.com/Temporary/Diagnostics': {
		symbols: {},
	},
};

const SYMBOL_IMPORT_SUGGESTIONS = new Map();

for (const [libraryPath, library] of Object.entries(VERSE_LIBRARY_REGISTRY)) {
	for (const symbolName of Object.keys(library.symbols)) {
		SYMBOL_IMPORT_SUGGESTIONS.set(symbolName, libraryPath);
	}
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

		for (const [symbolName, symbol] of Object.entries(library.symbols)) {
			symbols.set(symbolName, { ...symbol, importedFrom: importPath });
		}
	}

	return symbols;
}

export { VERSE_LIBRARY_REGISTRY };
