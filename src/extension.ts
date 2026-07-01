import * as vscode from 'vscode';

import { LanguageClient, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient | null = null;

export async function activate(context: vscode.ExtensionContext) {
  client = new LanguageClient(
    'protols',
    'Protols',
    {
      command: 'protols',
      transport: TransportKind.stdio,
    },
    {
      documentSelector: [{ scheme: 'file', language: 'proto' }],
    }
  );

  context.subscriptions.push(client);

  await client?.start();
}
