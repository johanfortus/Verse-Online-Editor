import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './Editor.css';

const CodeEditor = ({ code, setCode, handleEditorMount, runCode }) => {

    const handleEditorChange = (value) => {
		setCode(value);
	};


    return (  
        <div className='editor-container'>

        <div className='editor-header'>

            <div className='file-name'>
                test_device.verse
            </div>

            <div className='button-container'>
                <button className='run-btn' onClick={runCode}>Run</button>
            </div>
            
        </div>
    
            <Editor
                height="100vh"
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