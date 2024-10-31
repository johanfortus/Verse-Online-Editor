/**
 * verse.pegjs
 * 
 * This file contains the grammar for parsing Verse code using PEG.js and is responsible for generating verse-parser.js
 * 
 * Defines how the different components of Verse code (statements, expressions, literals) are structured.

 * Organized into function definitions that return syntax node objects and grammar rules using PEG.js.
 * 
 */

{
  
  // Defines a program node, which contains a list of statements.
  function Program(body) { return { type: "Program", body: body }; }
  
  // Defines a variable declaration node.
  function VariableDeclaration(name, varType, value) { return { type: "VariableDeclaration", name: name, varType: varType, value: value }; }

  // Defines a set statement node to assign a value to a variable or array element.
  function SetStatement(name, operator, value) { return { type: "SetStatement", name: name, operator: operator, value: value }; }

  // Defines a print statement node.
  function PrintStatement(value) { return { type: "PrintStatement", value: value }; }

  // Defines an interpolated string node, containing text and expressions.
  function InterpolatedString(parts) { return { type: "InterpolatedString", parts: parts }; }

  // Defines a text part node within an interpolated string.
  function TextPart(text) { return { type: "TextPart", text: text }; }

  // Defines an interpolated expression node within an interpolated string.
  function InterpolatedExpression(expression) { return { type: "InterpolatedExpression", expression: expression }; }

  // Defines a node for string literals.
  function StringLiteral(value) { return { type: "StringLiteral", value: value }; }

  // Defines a node for integer literals.
  function IntegerLiteral(value) { return { type: "IntegerLiteral", value: parseInt(value, 10) }; }

  // Defines a node for float literals.
  function FloatLiteral(value) { return { type: "FloatLiteral", value: parseFloat(value) }; }

  // Defines a node for boolean literals.
  function BooleanLiteral(value) { return { type: "BooleanLiteral", value: value === "true" }; }

  // Defines a node for identifiers.
  function Identifier(name) { return { type: "Identifier", name: name }; }

  // Defines a node for type definitions.
  function Type(name) { return { type: "Type", name: name }; }

  // Defines a node for binary expressions with a left operand, operator, and right operand.
  function BinaryExpression(left, operator, right) { return { type: "BinaryExpression", left: left, operator: operator, right: right }; }

  // Defines a node for unary expressions with an operator and expression.
  function UnaryExpression(operator, expression) { return { type: "UnaryExpression", operator: operator, expression: expression }; }

  // Defines a node for 'if' statements with a condition and body.
  function IfStatement(condition, body) { return { type: "IfStatement", condition: condition, body: body }; }

  // Defines a node for loop statements with a body of statements.
  function LoopStatement(body) { return { type: "LoopStatement", body: body }; }

  // Defines a node for 'for' statements with a variable, start expression, end expression, and body.
  function ForStatement(variable, start, end, body) { return { type: "ForStatement", variable: variable, range: {type : "Range", start, end}, body: body }; }

  // Defines a range node with a start and end expression.
  function Range(start, end) { return { type: "Range", start, end }; }

  // Defines a node for break statements.
  function BreakStatement() { return { type: "BreakStatement" }; }

  // Defines a node for array literals.
  function ArrayLiteral(elements) { return { type: "ArrayLiteral", elements: elements || [] }; };

  // Defines a node for array types.
  function ArrayType(elementType) { return { type: "ArrayType", elementType: elementType }; }

  // Defines a node for array access, containing the array and the index expression.
  function ArrayAccess(array, index) { return { type: "ArrayAccess", array: array, index: index }; }

  // Combines the head element and a list of tail elements into a single array.
  function ArrayElements(head, tail) { return [head, ...tail.map(item => item[3])]; }

}





/* ============ PEG.js GRAMMAR DEFINITIONS ============ */

// Initiating with the main 'Program' rule.
Start
  = Program

// Defines the Program rule, which consists of multiple statements.
Program
  = statements:Statement* { return Program(statements); }

// Defines a statement like variable declaration, set statements, loops, etc.
Statement
  = VariableDeclaration
  / SetStatement
  / PrintStatement
  / IfStatement
  / LoopStatement
  / ForStatement
  / BreakStatement

// Defines a variable declaration with a type and an initial value.
VariableDeclaration
  = "var" _ name:Identifier _ ":" _ varType:Type _ "=" _ value:Expression _ {
      return VariableDeclaration(name, varType, value);
    }

// Defines a set statement for assigning values to variables or array elements.
SetStatement
  = "set" _ name:Identifier _ operator:AssignmentOperator _ value:Expression _ {
      return SetStatement(name, operator, value);
    }

// Defines a print statement that outputs an interpolated string.
PrintStatement
  = "Print" _ "(" _ value:InterpolatedString _ ")" _ {
      return PrintStatement(value);
    }

// Defines an if-statement with a condition and a body containing multiple statements.
IfStatement
  = "if" _ "(" _ condition:Expression _ ")" _ ":" _ body:Statement+ {
      return IfStatement(condition, body);
    }

// Defines a loop statement with a body of multiple statements.
LoopStatement
  = "loop" _ ":" _ body:Statement+ {
      return LoopStatement(body);
    }

// Defines a for-statement that iterates over a range.
ForStatement
  = "for" _ "(" _ variable:Identifier _ ":=" _ start:Expression _ ".." _ end:Expression _ ")" _ ":" _ body:Statement+ {
      return ForStatement(variable, start, end, body);
    }
    
// Defines a range, consisting of a start and end integer.
Range
  = start:IntegerLiteral _ ".." _ end:IntegerLiteral {
      return Range(start, end);
    }

// Defines a break statement to exit loops or other constructs.
BreakStatement
  = "break" _ { return BreakStatement(); }

// Defines an interpolated string, which may include text and expressions.
InterpolatedString
  = '"' parts:InterpolatedPart* '"' { return InterpolatedString(parts); }

// Defines a part of an interpolated string, which could be text or an expression.
InterpolatedPart
  = TextPart
  / InterpolatedExpression

// Defines plain text within an interpolated string.
TextPart
  = text:$[^"{]+ { return TextPart(text); }

// Defines an interpolated expression wrapped in curly braces within a string.
InterpolatedExpression
  = "{" _ expr:Expression _ "}" { return InterpolatedExpression(expr); }

// Defines an expression, starting with the highest precedence (logical expression).
Expression
  = LogicalExpression

// Defines a logical expression involving comparisons and logical operators.
LogicalExpression
  = left:ComparisonExpression _ operator:LogicalOperator _ right:LogicalExpression {
      return BinaryExpression(left, operator, right);
    }
  / ComparisonExpression

// Defines a comparison expression with comparison operators.
ComparisonExpression
  = left:AdditiveExpression _ operator:ComparisonOperator _ right:ComparisonExpression {
      return BinaryExpression(left, operator, right);
    }
  / AdditiveExpression

// Defines an additive expression with addition or subtraction operators.
AdditiveExpression
  = left:MultiplicativeExpression _ operator:AdditiveOperator _ right:AdditiveExpression {
      return BinaryExpression(left, operator, right);
    }
  / MultiplicativeExpression

// Defines a multiplicative expression with multiplication or division operators.
MultiplicativeExpression
  = left:UnaryExpression _ operator:MultiplicativeOperator _ right:MultiplicativeExpression {
      return BinaryExpression(left, operator, right);
    }
  / UnaryExpression

// Defines a unary expression with a single operand.
UnaryExpression
  = operator:UnaryOperator _ expression:UnaryExpression {
      return UnaryExpression(operator, expression);
    }
  / PostfixExpression

// Defines a postfix expression with an optional '?' for nullable types.
PostfixExpression
  = expression:PrimaryExpression "?" { return UnaryExpression("?", expression); }
  / PrimaryExpression

// Defines the most basic types of expressions, such as literals or identifiers.
PrimaryExpression
  = StringLiteral
  / FloatLiteral
  / IntegerLiteral
  / BooleanLiteral
  / Identifier
  / "(" _ expr:Expression _ ")" { return expr; }

// Defines logical operators.
LogicalOperator
  = "and" / "or"

// Defines comparison operators.
ComparisonOperator
  = ">" / "<" / ">=" / "<="

// Defines additive operators.
AdditiveOperator
  = "+" / "-"

// Defines multiplicative operators.
MultiplicativeOperator
  = "*" / "/"

// Defines the available unary operators.
UnaryOperator
  = "not"

// Defines the available assignment operators.
AssignmentOperator
  = "=" / "+="

// Defines a string literal wrapped in double quotes.
StringLiteral
  = '"' value:$[^"]* '"' { return StringLiteral(value); }

// Defines an integer literal.
IntegerLiteral
  = value:$("-"? [0-9]+) { return IntegerLiteral(value); }

// Defines a float literal.
FloatLiteral
  = value:$("-"? [0-9]+ "." [0-9]+) { return FloatLiteral(value); }

// Defines a boolean literal, which can be true or false.
BooleanLiteral
  = value:("true" / "false") { return BooleanLiteral(value); }

// Defines an array literal with optional elements.
ArrayLiteral
  = "array" _ "{" _ elements:ArrayElements? _ "}" {
      return ArrayLiteral(elements !== null ? elements : []);
    }

// Defines the elements within an array literal.
ArrayElements
  = head:Expression tail:(_ "," _ Expression)* {
      return [head, ...tail.map(item => item[3])];
    }

// Defines an array type with an element type.
ArrayType
  = "[]" Type {
      return { type: "ArrayType", elementType: Type };
    }

// Defines access to an element of an array using an index.
ArrayAccess
  = array:Identifier "[" _ index:Expression _ "]" {
      return { type: "ArrayAccess", array: array, index: index };
    }

// Defines an identifier, consisting of letters, digits, and underscores.
Identifier
  = name:$[a-zA-Z_][a-zA-Z0-9_]* { return Identifier(name); }

// Defines a type such as float, int, string, or logic.
Type
  = name:$("float" / "int" / "string" / "logic") { return Type(name); }

// Defines whitespace characters, which are ignored in parsing.
_ "whitespace"
  = [ \t\n\r]*
