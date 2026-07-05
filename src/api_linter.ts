import * as vscode from 'vscode';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import { Disposable } from 'vscode-languageclient';
import { resolvePath } from './util';

const execFileAsync = promisify(execFile);

export class ApiLinter implements Disposable {
  private config: vscode.WorkspaceConfiguration;
  private diagnostics: vscode.DiagnosticCollection;
  private cancelationToken: vscode.CancellationTokenSource | null = null;

  private executable: string;
  private args: string[];

  public constructor() {
    const diagnostics = vscode.languages.createDiagnosticCollection('api-linter');
    const config = vscode.workspace.getConfiguration('protobuf');

    const executable = config.get<string>('apiLinter.path', 'api-linter');
    const args = [...config.get<string[]>('apiLinter.args', [])];
    const configFile = config.get<string>('apiLinter.config', '');

    args.push('--output-format', 'json');

    if (configFile.length > 0) {
      args.push('--config', configFile);
    }

    this.diagnostics = diagnostics;
    this.config = config;
    this.executable = executable;
    this.args = args;
  }

  private get enabled(): boolean {
    return this.config.get<boolean>('apiLinter.enabled', false);
  }

  private get isCancellationRequested(): boolean {
    return this.cancelationToken?.token.isCancellationRequested ?? false;
  }

  public async run(document: vscode.TextDocument): Promise<void> {
    if (!this.enabled) return;

    const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
    const config = vscode.workspace.getConfiguration('protobuf');

    this.resetCancelationToken();

    const args = [...this.args];

    const includePaths = config.get<string[]>('includePaths', []);
    for (const path of includePaths) {
      args.push('--proto-path', resolvePath(workspace, path));
    }

    if (workspace) {
      args.push('--proto-path', workspace.uri.fsPath); // workspace root
      args.push(path.relative(workspace.uri.fsPath, document.uri.fsPath));
    }

    let stdout: string;
    let message: string | null = null;

    try {
      const result = await execFileAsync(this.executable, args);
      stdout = result.stdout;
    } catch (error: any) {
      stdout = error.stdout ?? '';
      message = error.stderr?.trim() || error.message || String(error);
    }

    if (this.isCancellationRequested) return;

    if (message) {
      vscode.window.showErrorMessage(message);
      this.diagnostics.delete(document.uri);
      return;
    }

    try {
      this.diagnostics.set(document.uri, this.parseDiagnostics(stdout));
    } catch {
      vscode.window.showErrorMessage(message ?? 'Unexpected behaviour.');
    }
  }

  public dispose(): void {
    this.cancelationToken?.cancel();
    this.cancelationToken?.dispose();

    this.diagnostics?.dispose();
  }

  private resetCancelationToken(): void {
    this.cancelationToken?.cancel();
    this.cancelationToken = new vscode.CancellationTokenSource();
  }

  private parseDiagnostics(stdout: string): vscode.Diagnostic[] {
    if (!stdout.trim()) {
      return [];
    }

    const result = JSON.parse(stdout);

    const diagnostics: vscode.Diagnostic[] = [];

    for (const file of result) {
      for (const problem of file.problems) {
        const start = problem.location.start_position;
        const end = problem.location.end_position;

        const range = new vscode.Range(
          start.line_number - 1,
          start.column_number - 1,
          end.line_number - 1,
          end.column_number - 1
        );

        const diagnostic = new vscode.Diagnostic(
          range,
          problem.message,
          vscode.DiagnosticSeverity.Warning
        );

        diagnostic.source = 'api-linter';
        diagnostic.code = problem.rule_id;

        if (problem.rule_doc_uri) {
          diagnostic.code = {
            value: problem.rule_id,
            target: vscode.Uri.parse(problem.rule_doc_uri),
          };
        }

        if (problem.suggestion) {
          diagnostic.message += `\nSuggested replacement: ${problem.suggestion}`;
        }

        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }
}
