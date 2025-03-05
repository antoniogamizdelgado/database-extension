import * as vscode from "vscode";
import * as commands from "./commands";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(commands.createFileCommand);
}

export function deactivate() {}
