import { MonacoLanguageClient } from 'monaco-languageclient';
import { WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createMessageConnection } from 'vscode-jsonrpc/browser.js';
// import { createMessageConnection } from 'vscode-jsonrpc';
// import { connect } from 'http2';

const url = 'ws://localhost:3001';
const webSocket = new WebSocket(url);

webSocket.onopen = () => {
  const reader = new WebSocketMessageReader(webSocket);
  const writer = new WebSocketMessageWriter(webSocket);

  const connection = createConnection(reader, writer);
  connection.listen();

  const languageClient = new MonacoLanguageClient({
    name: 'Verse Language Client',
    clientOptions: {
      documentSelector: ['verse'],
      synchronize: {
        configurationSection: 'verse',
        fileEvents: []
      }
    },
    connectionProvider: {
      get: () => Promise.resolve(connection)
    }
  });

  languageClient.start();
};
