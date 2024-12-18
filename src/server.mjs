import http from 'http';
import { spawn } from 'child_process';
import ws from 'ws';
const { Server: WebSocketServer } = ws;

import { toSocket } from 'vscode-ws-jsonrpc';
import { createConnection, forward } from 'vscode-ws-jsonrpc/server';
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node.js';

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  const wsSocket = toSocket(socket);

  const child = spawn('/usr/local/bin/verse-lsp');
  
  const reader = new StreamMessageReader(child.stdout);
  const writer = new StreamMessageWriter(child.stdin);

  const socketConnection = createConnection(wsSocket);
  forward(socketConnection, reader, writer, socketConnection);
});

server.listen(3001, () => {
  console.log('LSP server is listening on port 3001');
});
