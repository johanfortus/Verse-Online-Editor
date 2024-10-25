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
      case 'BreakStatement':
        this.breakEncountered = true;
        break;
      default:
        throw new Error(`Unsupported statement type: ${statement.type}`);
    }
  }

  visitVariableDeclaration(declaration) {
    const value = this.evaluateExpression(declaration.value);
    console.log(`Declaring variable ${declaration.name.name} with type ${declaration.varType.name} and value ${value}`);
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
    if (condition) {
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
    const collection = this.evaluateExpression(forStatement.collection);
    let iterable;

    if (forStatement.collection.type === 'Range') {
      const start = this.evaluateExpression(forStatement.collection.start);
      const end = this.evaluateExpression(forStatement.collection.end);
      iterable = Array.from({length: end - start + 1}, (_, i) => start + i);
    } 
    else if (Array.isArray(collection)) {
      iterable = collection;
    } 
    else if (typeof collection === 'object') {
      iterable = Object.entries(collection);
    } 
    else {
      throw new Error(`Unsupported collection type for 'for' loop: ${typeof collection}`);
    }

    for (const item of iterable) {
      this.symbolTable.set(forStatement.variable.name, { type: 'any', value: item });
      
      for (const statement of forStatement.body) {
        this.visitStatement(statement);
        if (this.breakEncountered) {
          this.breakEncountered = false;
          return;
        }
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
        result = expression.value === 'true';
        break;
      case 'Identifier':
        if (this.symbolTable.has(expression.name)) {
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
        result = {type: 'Range', start, end};
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