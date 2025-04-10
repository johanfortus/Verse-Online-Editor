import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode, handleEditorMount, runCode }) => {

    const handleEditorChange = (value) => {
		setCode(value);
	};


    return (  
        <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: '10px' }}>
        <h2 style={{ marginBottom: "10px" }} >
            <button style={{ marginLeft: '10px' }} onClick={runCode}>Run Code</button>
        </h2>
            <Editor
                height="80%"
                defaultLanguage="verse"
                language='verse'
                theme="verse-dark"
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                    fontSize: 14,
                    autoClosingBrackets: 'always',
                }}
            />
        </div>
    );
};

export default CodeEditor;