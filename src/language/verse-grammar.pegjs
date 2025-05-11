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
  
  function Program(body) { return { type: "Program", body: body }; }
  
  function VariableDeclaration(name, varType, value) { return { type: "VariableDeclaration", name: name, varType: varType, value: value }; }

  function SetStatement(name, operator, value) { return { type: "SetStatement", name: name, operator: operator, value: value }; }

  function PrintStatement(value) { return { type: "PrintStatement", value: value }; }

  function InterpolatedString(parts) { return { type: "InterpolatedString", parts: parts }; }

  function TextPart(text) { return { type: "TextPart", text: text }; }

  function InterpolatedExpression(expression) { return { type: "InterpolatedExpression", expression: expression }; }

  function StringLiteral(value) { return { type: "StringLiteral", value: value }; }

  function IntegerLiteral(value) { return { type: "IntegerLiteral", value: parseInt(value, 10) }; }

  function FloatLiteral(value) { return { type: "FloatLiteral", value: parseFloat(value) }; }

  function BooleanLiteral(value) { return { type: "BooleanLiteral", value }; }

  function Identifier(name) { return { type: "Identifier", name: name }; }

  function Type(name) { return { type: "Type", name: name }; }

  function BinaryExpression(left, operator, right) { return { type: "BinaryExpression", left: left, operator: operator, right: right }; }

  function UnaryExpression(operator, expression) { return { type: "UnaryExpression", operator: operator, expression: expression }; }

  function IfStatement(condition, body) { return { type: "IfStatement", condition: condition, body: body }; }

  function LoopStatement(body) { return { type: "LoopStatement", body: body }; }

  function ForStatement(variable, start, end, body) { return { type: "ForStatement", variable: variable, range: {type : "Range", start, end}, body: body }; }

  function Range(start, end) { return { type: "Range", start, end }; }

  function BreakStatement() { return { type: "BreakStatement" }; }

  function ArrayLiteral(elements) { return { type: "ArrayLiteral", elements: elements || [] }; };

  function ArrayType(elementType) { return { type: "ArrayType", elementType: elementType }; }

  function ArrayAccess(array, index) { return { type: "ArrayAccess", array: array, index: index }; }

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

Identifier
  = !ReservedKeyword h:[a-zA-Z_] t:[a-zA-Z0-9_]* {
      console.log("Captured Identifier:", h + t.join(''));
      return { type: "Identifier", name: h + t.join('') };
    }

ReservedKeyword
  = "array"

VariableDeclaration
  = ("var" _)? name:Identifier _ ":" _ varType:(Type / ArrayType) _ "=" _ value:Expression _ {
      console.log(`Variable Declaration - Name: ${name.name}, Type: ${varType.type}`);
      return VariableDeclaration(name, varType, value);
    }


SetStatement
  = "set" _ name:Identifier _ operator:AssignmentOperator _ value:Expression _ {
      return SetStatement(name, operator, value);
    }


PrintStatement
  = "Print" _ "(" _ value:InterpolatedString _ ")" _ {
      return PrintStatement(value);
    }

IfStatement
  = "if" _ "(" _ condition:(AssignmentExpression / LogicalExpression) _ ")" _ ":" _ body:Statement+ "end" _ {
      return IfStatement(condition, body);
    }

AssignmentExpression
  = variable:Identifier _ ":=" _ value:Expression {
      return { type: "AssignmentExpression", variable: variable, value: value };
  }

LoopStatement
  = "loop" _ ":" _ body:Statement+ "end" _ {
      return LoopStatement(body);
    }


ForStatement
  = "for" _ "(" _ variable:Identifier _ ":=" _ start:Expression _ ".." _ end:Expression _ ")" _ ":" _ body:Statement+ "end" _ {
      return ForStatement(variable, start, end, body);
    }
    

Range
  = start:IntegerLiteral _ ".." _ end:IntegerLiteral {
      return Range(start, end);
    }


BreakStatement
  = "break" _ { return BreakStatement(); }


InterpolatedString
  = '"' parts:InterpolatedPart* '"' { return InterpolatedString(parts); }


InterpolatedPart
  = TextPart
  / InterpolatedExpression


TextPart
  = text:$[^"{]+ { return TextPart(text); }


InterpolatedExpression
  = "{" _ expr:Expression _ "}" {
      console.log("Captured InterpolatedExpression:", expr);
      return InterpolatedExpression(expr);
    }


Expression
  = LogicalExpression
  / ArrayLiteral


LogicalExpression
  = left:ComparisonExpression _ operator:LogicalOperator _ right:LogicalExpression {
      return BinaryExpression(left, operator, right);
    }
  / ComparisonExpression


ComparisonExpression
  = left:AdditiveExpression _ operator:ComparisonOperator _ right:ComparisonExpression {
      return BinaryExpression(left, operator, right);
    }
  / AdditiveExpression


AdditiveExpression
  = left:MultiplicativeExpression _ operator:AdditiveOperator _ right:AdditiveExpression {
      return BinaryExpression(left, operator, right);
    }
  / MultiplicativeExpression


MultiplicativeExpression
  = left:UnaryExpression _ operator:MultiplicativeOperator _ right:MultiplicativeExpression {
      return BinaryExpression(left, operator, right);
    }
  / UnaryExpression


UnaryExpression
  = operator:UnaryOperator _ expression:UnaryExpression {
      return UnaryExpression(operator, expression);
    }
  / PostfixExpression


PostfixExpression
  = expression:PrimaryExpression "." "Length" { 
      return { type: "ArrayLength", array: expression };
    }
  / expression:PrimaryExpression "?" {
      return UnaryExpression("?", expression);
  }
  / PrimaryExpression


PrimaryExpression
  = StringLiteral
  / FloatLiteral
  / IntegerLiteral
  / BooleanLiteral
  / ArrayAccess
  / Identifier
  / "(" _ expr:Expression _ ")" { return expr; }


LogicalOperator
  = "and" / "or"


ComparisonOperator
  = ">" / "<" / ">=" / "<="


AdditiveOperator
  = "+" / "-"


MultiplicativeOperator
  = "*" / "/"


UnaryOperator
  = "not"


AssignmentOperator
  = "=" / "+=" {
      console.log("Captured AssignmentOperator:", text());
      return text();
  }


StringLiteral
  = '"' value:$[^"]* '"' { return StringLiteral(value); }


IntegerLiteral
  = value:$("-"? [0-9]+) { return IntegerLiteral(value); }


FloatLiteral
  = value:$("-"? [0-9]+ "." [0-9]+) { return FloatLiteral(value); }


BooleanLiteral
  = "true" { return BooleanLiteral(true); }
  / "false" { return BooleanLiteral(false); }


ArrayLiteral
  = "array" _ "{" _ elements:ArrayElements? _ "}" {
      console.log("Captured ArrayLiteral:", elements);
      return ArrayLiteral(elements !== null ? elements : []);
    }


ArrayElements
  = head:Expression tail:(_ "," _ Expression)* {
      console.log("Captured ArrayElements:", [head, ...tail.map(item => item[3])]);
      return [head, ...tail.map(item => item[3])];
    }


ArrayType
  = "[]" Type {
      return { type: "ArrayType", elementType: Type };
    }


ArrayAccess
  = array:Identifier "[" _ index:Expression _ "]" {
      console.log("Captured ArrayAccess:", array.name, index);
      return { type: "ArrayAccess", array: array, index: index };
    }



Type
  = name:$("float" / "int" / "string" / "logic") { 
      console.log("Captured Type: ", name);
      return { type: "Type", name };
   }


_ "whitespace"
  = [ \t\n\r]*
