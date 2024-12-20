import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { parse } from './verse-parser.js';
import { VerseInterpreter } from './verse-interpreter.js';
import { registerVerseLanguage } from './verse-language.js';

// registerVerseLanguage();

function App() {
	const [code, setCode] = useState('// Write your Verse code here');
	const [output, setOutput] = useState('');
	const [astOutput, setAstOutput] = useState('');
	const interpreter = new VerseInterpreter();

	const handleEditorMount = (editor, monaco) => {
		console.log('monaco is ready');
		registerVerseLanguage(monaco);
		monaco.editor.setTheme('verse-dark');
	}

	const handleEditorChange = (value) => {
		setCode(value);
	};

	const runCode = () => {
		try {
			console.log("Raw Input Code:", code);
			const ast = parse(code);
			console.log('Parsed AST:', ast);
			setAstOutput(JSON.stringify(ast, null, 2));

			const result = interpreter.interpret(ast);
			setOutput(result);
		}
		catch (e) {
			// setOutput("Compilation Error");
			setOutput(`Parse error: ${e.message}`);
		}
		// setOutput(`Code ${code}`)
	}

	return (
		<div style={{ margin: 0, padding: 0, height: '100%', boxSizing: '100%' }}>


			<div style={{ display: 'flex', backgroundColor: 'lightgray', height: '100vh' }}>


				{/* Code Editor Container */}
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
							fontSize: 14
						}}
					/>
				</div>


				{/* Output Area Container */}
				<div style={{ display: "flex", flexDirection: "column", width: '50%', padding: '10px' }}>
					<h2 style={{ marginBottom: "10px" }}>Output: </h2>

					<div style={{ border: '1px solid #ddd', height: '80%', overflowY: 'scroll', color: '#FFFFFF', backgroundColor: '#000000', paddingLeft: '20px', fontSize: '14px' }}>
						<pre>{output}</pre>
					</div>

				</div>

			</div>

		</div>
	);

}

export default App;
