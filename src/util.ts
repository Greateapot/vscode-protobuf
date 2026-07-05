import * as vscode from 'vscode';
import * as path from 'node:path';

export function resolvePath(
  workspace: vscode.WorkspaceFolder | undefined,
  value: string
): string {
  if (!value) return value;

  if (workspace) {
    value = value.replaceAll('${workspaceFolder}', workspace.uri.fsPath);

    if (!path.isAbsolute(value)) {
      value = path.join(workspace.uri.fsPath, value);
    }
  }

  return path.normalize(value);
}
