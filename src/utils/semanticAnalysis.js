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

	lookup(name) {
		if (this.symbols.has(name)) {
			return this.symbols.get(name);
		}

		return this.parent ? this.parent.lookup(name) : null;
	}
}

function collectTopLevelDeclaration(statement, scope) {
	switch (statement.type) {
		case 'VariableDeclaration':
			scope.define(statement.name.name, {
				type: statement.type,
				verseType: resolveDeclaredType(statement.varType),
			});
			break;
		case 'ConstDeclaration':
			scope.define(statement.name.name, {
				type: statement.type,
				verseType: resolveDeclaredType(statement.constType),
			});
			break;
		case 'ClassDefinition':
			scope.define(statement.name.name, { type: statement.type });
			break;
		case 'FunctionDeclaration':
			scope.define(statement.name.name, {
				type: statement.type,
				returnType: resolveDeclaredType(statement.returnType),
			});
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
			if (statement.value.type === 'InterpolatedString') {
				analyzeExpression(statement.value, scope);
				return;
			}

			analyzeExpression(statement.value, scope);
			ensureStringConvertible(statement.value, scope);
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
		functionScope.define(parameter.name.name, {
			type: 'Parameter',
			verseType: resolveDeclaredType(parameter.paramType),
		});
	}

	analyzeBlock(statement.body, functionScope);
}

function analyzeForStatement(statement, scope) {
	const loopScope = new Scope(scope);
	loopScope.define(statement.variable.name, {
		type: 'LoopVariable',
		verseType: resolveDeclaredType(statement.varType),
	});
	analyzeBlock(statement.body, loopScope);
}

function analyzeBlock(statements, scope) {
	for (const statement of statements) {
		if (statement.type === 'VariableDeclaration' || statement.type === 'ConstDeclaration') {
			analyzeStatement(statement, scope);
			const declaredType = statement.type === 'VariableDeclaration'
				? resolveDeclaredType(statement.varType)
				: resolveDeclaredType(statement.constType);
			scope.define(statement.name.name, {
				type: statement.type,
				verseType: declaredType || resolveExpressionType(statement.value, scope),
			});
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
				if (part.type === 'InterpolatedExpression') {
					ensureStringConvertible(part.expression, scope);
				}
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

function resolveDeclaredType(typeNode) {
	if (!typeNode) {
		return null;
	}

	if (typeNode.type === 'Type') {
		return { kind: 'primitive', name: typeNode.name };
	}

	if (typeNode.type === 'ArrayType') {
		return {
			kind: 'array',
			elementType: resolveDeclaredType(typeNode.elementType),
		};
	}

	return null;
}

function resolveExpressionType(expression, scope) {
	switch (expression.type) {
		case 'StringLiteral':
			return { kind: 'primitive', name: 'string' };
		case 'IntegerLiteral':
			return { kind: 'primitive', name: 'int' };
		case 'FloatLiteral':
			return { kind: 'primitive', name: 'float' };
		case 'BooleanLiteral':
			return { kind: 'primitive', name: 'logic' };
		case 'ArrayLiteral': {
			const elementType = expression.elements.length > 0
				? resolveExpressionType(expression.elements[0], scope)
				: null;
			return { kind: 'array', elementType };
		}
		case 'Identifier':
			return scope.lookup(expression.name)?.verseType || null;
		case 'ArrayLength':
			return { kind: 'primitive', name: 'int' };
		case 'ArrayAccess': {
			const arrayType = resolveExpressionType(expression.array, scope);
			return arrayType?.kind === 'array' ? arrayType.elementType : null;
		}
		case 'BinaryExpression':
			return resolveBinaryExpressionType(expression, scope);
		case 'UnaryExpression':
			return resolveUnaryExpressionType(expression, scope);
		case 'AssignmentExpression':
			return resolveExpressionType(expression.value, scope);
		case 'FunctionCall': {
			const symbol = scope.lookup(expression.name.name);
			if (!symbol) {
				return null;
			}

			if (symbol.returnType) {
				return symbol.returnType;
			}

			if (symbol.type === 'NativeFunction') {
				return normalizeRuntimeTypeName(symbol.returnType);
			}

			return null;
		}
		case 'InterpolatedExpression':
			return resolveExpressionType(expression.expression, scope);
		default:
			return null;
	}
}

function resolveBinaryExpressionType(expression, scope) {
	switch (expression.operator) {
		case '>':
		case '<':
		case '>=':
		case '<=':
		case 'and':
		case 'or':
			return { kind: 'primitive', name: 'logic' };
		case '+':
		case '-':
		case '*':
		case '/': {
			const leftType = resolveExpressionType(expression.left, scope);
			const rightType = resolveExpressionType(expression.right, scope);
			if (leftType?.name === 'float' || rightType?.name === 'float') {
				return { kind: 'primitive', name: 'float' };
			}
			if (leftType?.name === 'int' && rightType?.name === 'int') {
				return { kind: 'primitive', name: 'int' };
			}
			return null;
		}
		default:
			return null;
	}
}

function resolveUnaryExpressionType(expression, scope) {
	if (expression.operator === 'not' || expression.operator === '?') {
		return { kind: 'primitive', name: 'logic' };
	}

	return resolveExpressionType(expression.expression, scope);
}

function normalizeRuntimeTypeName(typeName) {
	if (!typeName) {
		return null;
	}

	if (typeName === 'array') {
		return { kind: 'array', elementType: null };
	}

	return { kind: 'primitive', name: typeName };
}

function ensureStringConvertible(expression, scope) {
	const verseType = resolveExpressionType(expression, scope);
	if (!verseType) {
		return;
	}

	if (isStringConvertibleType(verseType)) {
		return;
	}

	throw new SemanticError(
		buildToStringOverloadError(verseType),
		3509,
	);
}

function isStringConvertibleType(verseType) {
	if (verseType.kind !== 'primitive') {
		return false;
	}

	return ['int', 'float', 'string'].includes(verseType.name);
}

function buildToStringOverloadError(verseType) {
	return [
		`No overload of the function \`ToString\` matches the provided arguments (:${formatVerseType(verseType)}). Could be any of:`,
		'    function (/Verse.org/Verse:)ToString(:float) in package Verse',
		'    function (/Verse.org/Verse:)ToString(:int) in package Verse',
		'    function (/Verse.org/Verse:)ToString(:string) in package Verse(3509)',
	].join('\n');
}

function formatVerseType(verseType) {
	if (!verseType) {
		return 'unknown';
	}

	if (verseType.kind === 'array') {
		return `[]${formatVerseType(verseType.elementType)}`;
	}

	return verseType.name;
}
