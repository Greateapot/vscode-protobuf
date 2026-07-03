import * as vscode from 'vscode';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { ApiLinter } from './api_linter';

let client: LanguageClient | null = null;
let apiLinter: ApiLinter | null = null;

function createClient(): LanguageClient {
  const config = vscode.workspace.getConfiguration('protobuf');

  const protols = config.get<string>('protols.path', 'protols');
  const args = [...config.get<string[]>('protols.args', [])];

  const include = config.get<string[]>('includePaths', []);
  for (const path of include) {
    args.push('--include-paths', path);
  }

  return new LanguageClient(
    'protols',
    'Protols',
    {
      command: protols,
      args,
      transport: TransportKind.stdio,
    },
    {
      documentSelector: [{ scheme: 'file', language: 'proto' }],
    }
  );
}

async function onRestartLanguageServer() {
  if (client) {
    await client.stop();
    client.dispose();
  }

  apiLinter?.dispose();

  client = createClient();
  apiLinter = new ApiLinter();

  await client.start();
}

function onDidChangeConfiguration(event: vscode.ConfigurationChangeEvent) {
  if (event.affectsConfiguration('protobuf')) {
    onRestartLanguageServer();
  }
}

async function onDidSaveTextDocument(document: vscode.TextDocument) {
  if (document.languageId === 'proto') {
    await apiLinter?.run(document);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  client = createClient();
  apiLinter = new ApiLinter();

  context.subscriptions.push(client);
  context.subscriptions.push(apiLinter);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'protobuf.restartLanguageServer',
      onRestartLanguageServer
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration)
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(onDidSaveTextDocument)
  );

  await client.start();
}

export function deactivate() {}
