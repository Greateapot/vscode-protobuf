import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | null = null;

export async function activate(_: vscode.ExtensionContext) {
  const serverOptions: ServerOptions = {
    command: 'protols',
    args: ['--include-paths=/usr/local/include'],
    transport: TransportKind.stdio,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'proto3' }],

    // outputChannel: output,
  };

  client = new LanguageClient('protols', 'Protols', serverOptions, clientOptions);

  await client?.start();
}

export function deactivate() {
  client?.stop();
}
