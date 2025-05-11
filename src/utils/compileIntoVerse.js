import { parse } from './parser.js';
import { injectEnds } from './preprocess.js';

export function compileIntoVerse(sourceCode) {
    const sourceCodeWithEnds = injectEnds(sourceCode);
    return parse(sourceCodeWithEnds);
}