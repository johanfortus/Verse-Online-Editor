import { parse } from './parser.js';
import { injectEnds } from './preprocess.js';
import { analyzeProgram } from './semanticAnalysis.js';

export function compileIntoVerse(sourceCode) {
    const sourceCodeWithEnds = injectEnds(sourceCode);
    const ast = parse(sourceCodeWithEnds);
    analyzeProgram(ast);
    return ast;
}
