import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './Editor.css';

const CodeEditor = ({ code, setCode, handleEditorMount, runCode }) => {

    const handleEditorChange = (value) => {
		setCode(value);
	};


    return (  
        <div className='editor-container'>

        <div className='editor-header' >
            <button style={{ marginLeft: '10px' }} onClick={runCode}>Run Code</button>
        </div>

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
                    scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'hidden',
                    },
                    minimap: {
                        enabled: false
                    },
                    overviewRulerLanes: 0,
                }}
            />
        </div>
    );
};

export default CodeEditor;