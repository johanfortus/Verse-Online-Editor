// verse-interpreter.js
// This file contains the VerseInterpreter class and responsible for interpreting an Abstract Syntax Tree (AST).
// The AST is created by the parser generated using PEG.js based on the Verse grammar definition.
// PEG.js generates verse-parser.js, and given code input, constructs an AST following the defined grammar rules.
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
		this.symbolTable.set(declaration.name.name, { type: declaration.varType.name, value });
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
		if (condition !== undefined && condition) {
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
			throw new Error(`Array ${arrayAccess.array.name} not found`);
		}
		const index = this.evaluateExpression(arrayAccess.index);
		if (index < 0 || index >= array.value.length) {
			throw new Error(`Index ${index} out of bounds`);
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
			console.log(`Setting array ${arrayAccess.array.name} at index ${index} to value ${newValue}`);
			array.value[index] = newValue;
		}
		else {
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
			case 'BinaryExpression':
				result = this.evaluateBinaryExpression(expression);
				break;
			case 'UnaryExpression':
				result = this.evaluateUnaryExpression(expression);
				break;
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
