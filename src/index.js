import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';

import 'vscode/localExtensionHost';
import { initialize } from 'vscode/services';

(async () => {
    await initialize();
    // await import('./verse-lsp-client.js');
    ReactDOM.render(<App />, document.getElementById('root'));
})();

// import './verse-lsp-client.js';

// ReactDOM.render(<App />, document.getElementById('root'));