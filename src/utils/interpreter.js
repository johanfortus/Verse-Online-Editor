// interpreter.js
// This file contains the VerseInterpreter class and responsible for interpreting an Abstract Syntax Tree (AST).
// The AST is created by the parser generated using PEG.js based on the Verse grammar definition.
// PEG.js generates parser.js, and given code input, constructs an AST following the defined grammar rules.
// The AST is then used by this interpreter to execute the program logic.

export class VerseInterpreter {
	constructor() {
		this.output = '';
		this.symbolTable = new Map();
		this.breakEncountered = false;
	}

	interpret(ast) {
		this.output = '';
		console.log('Interpreter received AST:', JSON.stringify(ast, null, 2));

		if (!ast || typeof ast !== 'object' || !Array.isArray(ast.body)) {
			throw new Error('Invalid AST structure: Expected an object with a body array');
		}

		this.visitProgram(ast);
		return this.output;
	}

	visitProgram(program) {
		for (const statement of program.body) {
			this.visitStatement(statement);
		}
	}

	visitStatement(statement) {
		console.log('Visiting statement:', JSON.stringify(statement, null, 2));
		switch (statement.type) {
			case 'VariableDeclaration':
				this.visitVariableDeclaration(statement);
				break;
			case 'ConstDeclaration':
				this.visitConstDeclaration(statement);
				break;
			case 'SetStatement':
				this.visitSetStatement(statement);
				break;
			case 'PrintStatement':
				this.visitPrintStatement(statement);
				break;
			case 'IfStatement':
				this.visitIfStatement(statement);
				break;
			case 'LoopStatement':
				this.visitLoopStatement(statement);
				break;
			case 'ForStatement':
				this.visitForStatement(statement);
				break;
			case 'BreakStatement':
				this.visitBreakStatement();
				break;
			default:
				throw new Error(`Unsupported statement type: ${statement.type}`);
		}
	}

	visitBreakStatement() {
		this.breakEncountered = true;
	}

	visitVariableDeclaration(declaration) {
		console.log('VariableDeclaration - Name: ', declaration.name.name);
		const varName = declaration.name.name;
		if(this.symbolTable.has(varName)) {
			throw new Error(`Variable '${varName}' is already declared`);
		}

		const value = this.evaluateExpression(declaration.value);
		console.log(`Declaring variable ${declaration.name.name} of type '${declaration.varType.name}' with value ${value} (Type: ${typeof value})`);
		this.symbolTable.set(declaration.name.name, { type: declaration.varType.name, value, isConstant: false });
	}

	visitConstDeclaration(declaration) {
		const constName = declaration.name.name;
		if (this.symbolTable.has(constName)) {
			throw new Error(`Variable '${constName}' is already declared`);
		}
		const value = this.evaluateExpression(declaration.value);
		let resolvedType;
		if (declaration.constType && declaration.constType.name) {
			resolvedType = declaration.constType.name;
		}
		else {
			resolvedType = this.inferVerseTypeFromValue(value);
		}
		console.log(`Declaring constant ${constName} of type '${resolvedType}' with value ${value}`);
		this.symbolTable.set(constName, { type: resolvedType, value, isConstant: true });
	}

	inferVerseTypeFromValue(value) {
		if (Array.isArray(value)) {
			return 'array';
		}
		switch (typeof value) {
			case 'number':
				return Number.isInteger(value) ? 'int' : 'float';
			case 'string':
				return 'string';
			case 'boolean':
				return 'logic';
			default:
				return 'dynamic';
		}
	}

	visitSetStatement(setStatement) {
		const value = this.evaluateExpression(setStatement.value);
		const varName = setStatement.name.name;
		if (this.symbolTable.has(varName)) {
			let newValue;
			switch (setStatement.operator) {
				case '=':
					newValue = value;
					break;
				case '+=':
					const currentValue = this.symbolTable.get(varName).value;
					newValue = currentValue + value;
					break;
				default:
					throw new Error(`Unsupported assignment operator: ${setStatement.operator}`);
			}
			console.log(`Setting variable ${varName} to value ${newValue}`);
			this.symbolTable.set(varName, { ...this.symbolTable.get(varName), value: newValue });
		}
		else {
			throw new Error(`Cannot set undeclared variable: ${varName}`);
		}
	}

	visitPrintStatement(printStatement) {
		try {
			const value = this.evaluateInterpolatedString(printStatement.value);
			console.log('Evaluated Print Statement:', value);
			this.output += value + '\n';
		}
		catch (error) {
			console.error('Error in Print Statement:', error.message);
			this.output += `Error: ${error.message}\n`;
		}
	}

	visitIfStatement(ifStatement) {
		const condition = this.evaluateExpression(ifStatement.condition);
		if (condition !== null && condition) {
			for (const statement of ifStatement.body) {
				this.visitStatement(statement);
			}
		}
	}

	visitLoopStatement(loopStatement) {
		while (true) {
			for (const statement of loopStatement.body) {
				this.visitStatement(statement);
				if (this.breakEncountered) {
					this.breakEncountered = false;
					return;
				}
			}
		}
	}

	visitForStatement(forStatement) {
		const start = this.evaluateExpression(forStatement.range.start);
		const end = this.evaluateExpression(forStatement.range.end);

		if (typeof start !== "number" || typeof end !== "number") {
			throw new Error("Range values must be integers");
		}

		for (let i = start; i <= end; i++) {
			this.symbolTable.set(forStatement.variable.name, { type: "int", value: i });
			for (const statement of forStatement.body) {
				this.visitStatement(statement);
				if (this.breakEncountered) {
					this.breakEncountered = false;
					return;
				}
			}
		}
	}

	visitArrayLiteral(arrayLiteral) {
		return arrayLiteral.elements.map(element => this.evaluateExpression(element));
	}

	visitArrayAccess(arrayAccess) {
		const array = this.symbolTable.get(arrayAccess.array.name);
		if (!array || !Array.isArray(array.value)) {
			console.log(`Array ${arrayAccess.array.name} not found`);
			return null;
		}
		const index = this.evaluateExpression(arrayAccess.index);
		if (index < 0 || index >= array.value.length) {
			console.log(`Index ${index} out of bounds`);
			return null;
		}
		return array.value[index];
	}

	visitSetStatement(setStatement) {
		if (setStatement.name.type === 'ArrayAccess') {

			const arrayAccess = setStatement.name;
			const array = this.symbolTable.get(arrayAccess.array.name);

			if (!array || !Array.isArray(array.value)) {
				throw new Error(`Array ${arrayAccess.array.name} not found or not an array`);
			}

			const index = this.evaluateExpression(arrayAccess.index);
			if (index < 0 || index >= array.value.length) {
				throw new Error(`Index out of bounds: ${index}`);
			}

			const newValue = this.evaluateExpression(setStatement.value);
			if (array.isConstant) {
				throw new Error(`Cannot modify constant '${arrayAccess.array.name}'`);
			}
			console.log(`Setting array ${arrayAccess.array.name} at index ${index} to value ${newValue}`);
			array.value[index] = newValue;
		}
		else {
			const value = this.evaluateExpression(setStatement.value);
			const varName = setStatement.name.name;
			if (this.symbolTable.has(varName)) {
				const entry = this.symbolTable.get(varName);
				if (entry.isConstant) {
					throw new Error(`Cannot reassign constant '${varName}'`);
				}
				let newValue;
				switch (setStatement.operator) {
					case '=':
						newValue = value;
						break;
					case '+=':
						const currentValue = entry.value;
						newValue = currentValue + value;
						break;
					default:
						throw new Error(`Unsupported assignment operator: ${setStatement.operator}`);
				}
				console.log(`Setting variable ${varName} to value ${newValue}`);
				this.symbolTable.set(varName, { ...entry, value: newValue });
			}
			else {
				throw new Error(`Cannot set undeclared variable: ${varName}`);
			}
		}
	}

	evaluateInterpolatedString(interpolatedString) {
		return interpolatedString.parts.map(part => {
			if (part.type === 'TextPart') {
				return part.text;
			}
			else if (part.type === 'InterpolatedExpression') {
				try {
					return String(this.evaluateExpression(part.expression));
				}
				catch (error) {
					return `<${error.message}>`;
				}
			}
		}).join('');
	}

	evaluateExpression(expression) {
		console.log('Evaluating expression:', JSON.stringify(expression, null, 2));
		let result;
		switch (expression.type) {
			case 'StringLiteral':
			case 'IntegerLiteral':
			case 'FloatLiteral':
				result = expression.value;
				break;
			case 'BooleanLiteral':
				result = expression.value;
				break;
			case "ArrayLiteral":
				result = this.visitArrayLiteral(expression);
				break;
			case 'Identifier':
				if (this.symbolTable.has(expression.name)) {
					const variable = this.symbolTable.get(expression.name);
					console.log(`Retrieving variable '${expression.name}' with value: ${variable.value}`)
					result = this.symbolTable.get(expression.name).value;
				}
				else {
					throw new Error(`Undefined variable: ${expression.name}`);
				}
				break;
			case 'ArrayLength':
				const array = this.evaluateExpression(expression.array);
				if (!Array.isArray(array)) {
					throw new Error(`Cannot get .Length of a non-array value`);
				}
				result = array.length;
				break;
			case 'ArrayAccess':
				result = this.visitArrayAccess(expression);
				break;
			case 'BinaryExpression':
				result = this.evaluateBinaryExpression(expression);
				break;
			case 'UnaryExpression':
				result = this.evaluateUnaryExpression(expression);
				break;
			case 'AssignmentExpression':
				const value = this.evaluateExpression(expression.value);
				this.symbolTable.set(expression.variable.name, { type: "dynamic", value });
				return value;
			case 'Range':
				const start = this.evaluateExpression(expression.start);
				const end = this.evaluateExpression(expression.end);
				result = { type: 'Range', start, end };
				break;
			default:
				throw new Error(`Unsupported expression type: ${expression.type}`);
		}
		console.log(`Expression ${expression.type} evaluated to:`, result);
		return result;
	}

	evaluateBinaryExpression(expression) {
		const left = this.evaluateExpression(expression.left);
		const right = this.evaluateExpression(expression.right);
		switch (expression.operator) {
			case '+': return left + right;
			case '-': return left - right;
			case '*': return left * right;
			case '/': return left / right;
			case '>': return left > right;
			case '<': return left < right;
			case '>=': return left >= right;
			case '<=': return left <= right;
			case 'and': return left && right;
			case 'or': return left || right;
			default:
				throw new Error(`Unsupported binary operator: ${expression.operator}`);
		}
	}

	evaluateUnaryExpression(expression) {
		const operand = this.evaluateExpression(expression.expression);
		switch (expression.operator) {
			case 'not': return !operand;
			case '?': return !!operand;
			default:
				throw new Error(`Unsupported unary operator: ${expression.operator}`);
		}
	}
}
