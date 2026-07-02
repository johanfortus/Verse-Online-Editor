export function injectEnds(sourceCode) {
    const lines = sourceCode.replace(/\r\n?/g, '\n').split('\n');
    const indentStack = [0];
    const outputLines = [];
    let braceBlockDepth = 0;
    let pendingBraceHeader = false;

    function stripLineComment(line) {
        return line.replace(/#.*$/, '');
    }

    function isBraceBlockHeader(trimmedLine) {
        return (
            /^if\b/.test(trimmedLine) ||
            /^for\b/.test(trimmedLine) ||
            /^loop\b/.test(trimmedLine) ||
            /^else\b/.test(trimmedLine) ||
            /^[A-Za-z_][A-Za-z0-9_]*\s*:=\s*class\b/.test(trimmedLine) ||
            /^[A-Za-z_][A-Za-z0-9_]*(?:\s*<[^>\n]+>)*\s*\(.*\)\s*(?:<[^>\n]+>\s*)*:\s*[A-Za-z_[]][A-Za-z0-9_[]]*\s*=$/.test(trimmedLine)
        );
    }

    for(const raw of lines) {
        const codePortion = stripLineComment(raw);
        const indentWidth = (/^[ \t]*/.exec(raw)[0]).length;
        const trimmed = codePortion.trim();
        const isBlankLine = trimmed === '';
        const continuesConditional = /^(else|then)\b/.test(trimmed);
        const opensBraceBlock = trimmed === '{'
            ? pendingBraceHeader
            : trimmed.endsWith('{') && isBraceBlockHeader(trimmed.slice(0, -1).trim());
        const closesBraceBlock = trimmed === '}';

        if(!isBlankLine && braceBlockDepth === 0) {
            while (
                indentWidth < indentStack[indentStack.length - 1] &&
                !continuesConditional
            ) {
                indentStack.pop();
                outputLines.push('end');
            }
            if (indentWidth > indentStack[indentStack.length - 1]) {
                indentStack.push(indentWidth);
            }
        }
        outputLines.push(raw);

        if (opensBraceBlock) {
            braceBlockDepth += 1;
            pendingBraceHeader = false;
            continue;
        }

        if (closesBraceBlock && braceBlockDepth > 0) {
            braceBlockDepth -= 1;
            pendingBraceHeader = false;
            continue;
        }

        if (!isBlankLine) {
            pendingBraceHeader = isBraceBlockHeader(trimmed);
        }
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        outputLines.push('end');
    }

    return outputLines.join('\n');
}
