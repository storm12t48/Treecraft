import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createFileTree', async () => {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Text files': ['txt']
            }
        });

        if (!fileUri || fileUri.length === 0) {
            return;
        }

        const filePath = fileUri[0].fsPath;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        if (!folderUri || folderUri.length === 0) {
            return;
        }

        const targetFolder = folderUri[0].fsPath;

        // Parse the file structure and create directories and files
        const stack: string[] = [];
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine === '│') {
                return; // Skip empty lines, comments, and formatting lines
            }

            // Calculate the depth of the current line based on leading spaces
            const depth = line.search(/\S/);

            // Update the current directory level based on indentation
            while (stack.length > depth) {
                stack.pop();
            }

            const relativePath = trimmedLine.replace(/^[├─└│]+/g, '').trim();
            const fullPath = path.join(targetFolder, ...stack, relativePath.replace(/\/$/, ''));

            if (relativePath.endsWith('/')) {
                // Create a directory
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    stack.push(relativePath.replace('/', '')); // Push the folder into the stack
                }
            } else {
                // Create a file
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullPath, ''); // Create an empty file
            }
        });

        vscode.window.showInformationMessage('File structure created successfully!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
