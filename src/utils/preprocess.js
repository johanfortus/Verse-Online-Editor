export function injectEnds(sourceCode) {
    const lines = sourceCode.replace(/\r\n?/g, '\n').split('\n');
    const indentStack = [0];
    const outputLines = [];

    for(const raw of lines) {
        const indentWidth = (/^[ \t]*/.exec(raw)[0]).length;
        const isBlankLine = /^\s*$/.test(raw);

        if(!isBlankLine) {
            while (indentWidth < indentStack[indentStack.length - 1]) {
                indentStack.pop();
                outputLines.push('end');
            }
            if (indentWidth > indentStack[indentStack.length - 1]) {
                indentStack.push(indentWidth);
            }
        }
        outputLines.push(raw);
    }

    while (indentStack.length > 1) {
        indentStack.pop();
        outputLines.push('end');
    }

    return outputLines.join('\n');
}