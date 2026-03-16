import { getImportedSymbols, getLibrary, getSuggestedUsingForSymbol } from './verseLibraries.js';

class SemanticError extends Error {
	constructor(message, code = 3506) {
		super(message);
		this.name = 'SemanticError';
		this.code = code;
	}
}

export function analyzeProgram(ast) {
	const usingDeclarations = ast.body.filter(statement => statement.type === 'UsingDeclaration');
	const importPaths = usingDeclarations.map(statement => statement.path);

	for (const importPath of importPaths) {
		if (!getLibrary(importPath)) {
			throw new SemanticError(`Unknown module '${importPath}'.`);
		}
	}

	const globalScope = new Scope();
	const importedSymbols = getImportedSymbols(importPaths);

	for (const [symbolName, symbol] of importedSymbols.entries()) {
		globalScope.define(symbolName, symbol);
	}

	for (const statement of ast.body) {
		collectTopLevelDeclaration(statement, globalScope);
	}

	for (const statement of ast.body) {
		analyzeStatement(statement, globalScope);
	}

	return {
		importPaths,
	};
}

class Scope {
	constructor(parent = null) {
		this.parent = parent;
		this.symbols = new Map();
	}

	define(name, value) {
		this.symbols.set(name, value);
	}

	has(name) {
		if (this.symbols.has(name)) {
			return true;
		}

		return this.parent ? this.parent.has(name) : false;
	}
}

function collectTopLevelDeclaration(statement, scope) {
	switch (statement.type) {
		case 'VariableDeclaration':
		case 'ConstDeclaration':
		case 'ClassDefinition':
		case 'FunctionDeclaration':
			scope.define(statement.name.name, { type: statement.type });
			break;
		default:
			break;
	}
}

function analyzeStatement(statement, scope) {
	switch (statement.type) {
		case 'UsingDeclaration':
			return;
		case 'VariableDeclaration':
			analyzeExpression(statement.value, scope);
			return;
		case 'ConstDeclaration':
			analyzeExpression(statement.value, scope);
			return;
		case 'ClassDefinition':
			ensureKnownIdentifier(statement.parentClass.name, scope);
			analyzeClassDefinition(statement, scope);
			return;
		case 'FunctionDeclaration':
			analyzeFunctionDeclaration(statement, scope);
			return;
		case 'SetStatement':
			analyzeSetStatement(statement, scope);
			return;
		case 'PrintStatement':
			analyzeExpression(statement.value, scope);
			return;
		case 'IfStatement':
			analyzeExpression(statement.condition, scope);
			analyzeBlock(statement.body, new Scope(scope));
			analyzeBlock(statement.elseBody || [], new Scope(scope));
			return;
		case 'LoopStatement':
			analyzeBlock(statement.body, new Scope(scope));
			return;
		case 'ForStatement':
			analyzeExpression(statement.range.start, scope);
			analyzeExpression(statement.range.end, scope);
			analyzeForStatement(statement, scope);
			return;
		case 'ReturnStatement':
			if (statement.value) {
				analyzeExpression(statement.value, scope);
			}
			return;
		case 'FunctionCallStatement':
			analyzeExpression(statement.functionCall, scope);
			return;
		case 'ExpressionStatement':
			analyzeExpression(statement.expression, scope);
			return;
		case 'BreakStatement':
			return;
		default:
			return;
	}
}

function analyzeClassDefinition(statement, scope) {
	const classScope = new Scope(scope);

	for (const member of statement.members) {
		if (member.name?.name) {
			classScope.define(member.name.name, { type: member.type });
		}
	}

	analyzeBlock(statement.members, classScope);
}

function analyzeFunctionDeclaration(statement, scope) {
	const functionScope = new Scope(scope);

	for (const parameter of statement.parameters) {
		functionScope.define(parameter.name.name, { type: 'Parameter' });
	}

	analyzeBlock(statement.body, functionScope);
}

function analyzeForStatement(statement, scope) {
	const loopScope = new Scope(scope);
	loopScope.define(statement.variable.name, { type: 'LoopVariable' });
	analyzeBlock(statement.body, loopScope);
}

function analyzeBlock(statements, scope) {
	for (const statement of statements) {
		if (statement.type === 'VariableDeclaration' || statement.type === 'ConstDeclaration') {
			analyzeStatement(statement, scope);
			scope.define(statement.name.name, { type: statement.type });
			continue;
		}

		analyzeStatement(statement, scope);
	}
}

function analyzeSetStatement(statement, scope) {
	if (statement.name.type === 'ArrayAccess') {
		analyzeExpression(statement.name, scope);
	} else {
		ensureKnownIdentifier(statement.name.name, scope);
	}

	analyzeExpression(statement.value, scope);
}

function analyzeExpression(expression, scope) {
	switch (expression.type) {
		case 'StringLiteral':
		case 'IntegerLiteral':
		case 'FloatLiteral':
		case 'BooleanLiteral':
			return;
		case 'ArrayLiteral':
			for (const element of expression.elements) {
				analyzeExpression(element, scope);
			}
			return;
		case 'Identifier':
			ensureKnownIdentifier(expression.name, scope);
			return;
		case 'ArrayLength':
			analyzeExpression(expression.array, scope);
			return;
		case 'ArrayAccess':
			analyzeExpression(expression.array, scope);
			analyzeExpression(expression.index, scope);
			return;
		case 'BinaryExpression':
			analyzeExpression(expression.left, scope);
			analyzeExpression(expression.right, scope);
			return;
		case 'UnaryExpression':
			analyzeExpression(expression.expression, scope);
			return;
		case 'AssignmentExpression':
			analyzeExpression(expression.value, scope);
			scope.define(expression.variable.name, { type: 'DynamicVariable' });
			return;
		case 'Range':
			analyzeExpression(expression.start, scope);
			analyzeExpression(expression.end, scope);
			return;
		case 'FunctionCall':
			ensureKnownIdentifier(expression.name.name, scope);
			for (const argument of expression.arguments) {
				analyzeExpression(argument, scope);
			}
			return;
		case 'InterpolatedString':
			for (const part of expression.parts) {
				analyzeExpression(part, scope);
			}
			return;
		case 'InterpolatedExpression':
			analyzeExpression(expression.expression, scope);
			return;
		case 'TextPart':
			return;
		default:
			return;
	}
}

function ensureKnownIdentifier(name, scope) {
	if (scope.has(name)) {
		return;
	}

	const suggestedUsing = getSuggestedUsingForSymbol(name);
	if (suggestedUsing) {
		throw new SemanticError(
			`Unknown identifier \`${name}\`. Did you forget to specify using { ${suggestedUsing} }? (${3506})`
		);
	}

	throw new SemanticError(`Unknown identifier \`${name}\`. (${3506})`);
}
