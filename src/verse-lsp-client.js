import { MonacoLanguageClient, CloseAction, ErrorAction, createConnection } from 'monaco-languageclient';
import { WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';

const url = 'ws://localhost:3001';
const webSocket = new WebSocket(url);

webSocket.onopen = () => {
  const reader = new WebSocketMessageReader(webSocket);
  const writer = new WebSocketMessageWriter(webSocket);

  const connection = createConnection(reader, writer, {
    error: () => ErrorAction.Continue,
    close: () => CloseAction.DoNotRestart
  });

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
