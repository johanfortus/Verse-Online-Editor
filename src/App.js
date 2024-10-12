import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import * as verseParser from './verse-parser';
import { VerseInterpreter } from './verse-interpreter';


function App() {
    const [code, setCode] = useState('// Write your Verse code here');
    const [output, setOutput] = useState('');
    const [astOutput, setAstOutput] = useState('');
    const interpreter = new VerseInterpreter();

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const runCode = () => {
        try {
            const ast = verseParser.parse(code);
            console.log('Parsed AST:', ast);
            setAstOutput(JSON.stringify(ast, null, 2));
            
            const result = interpreter.interpret(ast);
            setOutput(result);
        }
        catch(e){
            setOutput("Compilation Error");
            // setOutput(`Parse error: ${e.message}`);
        }
        // setOutput(`Code ${code}`)
    }

    return (
        <div>
            <h1>Verse Playground</h1>

            
            <div style={{ display: 'flex' }}>


                {/* Code Editor Container */}    
                <div style={{ display:'flex', flexDirection:'column', width:'50%', padding:'10px'}}>
                    <h2 style={{ margin:"0" }} >&lt;/&gt; Code: </h2>
                    <Editor
                        height="500px"
                        defaultLanguage="verse"
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                    />
                </div>
                
                
                {/* Output Area Container */}
                <div style={{ display:"flex", flexDirection: "column", width: '50%', padding:'10px'}}>
                    <h2 style={{ margin:"0" }}>Output: </h2>
                    <div style={{ border: '1px solid #ddd', height: '500px', overflowY: 'scroll', backgroundColor: '#f9f9f9'}}>
                        <pre>{output}</pre>
                    </div>
                </div>

            </div>
            <button style={{ marginLeft: '10px' }} onClick={runCode}>Run Code</button>
        </div>
    );

}

export default App;
