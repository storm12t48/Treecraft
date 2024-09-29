import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('treecraft.createFileTree', async () => {
        // Open file dialog to select the text file containing the structure
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Text files': ['txt']
            }
        });

        if (!fileUri || fileUri.length === 0) {
            vscode.window.showErrorMessage("No file selected.");
            return;
        }

        const filePath = fileUri[0].fsPath;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        // Ask user for the target directory
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage("No target folder selected.");
            return;
        }

        const targetFolder = folderUri[0].fsPath;

        // Regex to identify file extensions
        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;

        // Parse the file content and create folders/files
        const stack: string[] = [];
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine === '│') {
                return; // Skip empty lines, comments, and formatting lines
            }

            const depth = line.search(/\S/);

            // Adjust stack based on indentation level
            while (stack.length > depth) {
                stack.pop();
            }

            const relativePath = trimmedLine.replace(/^[├─└│]+/g, '').trim();
            const fullPath = path.join(targetFolder, ...stack, relativePath);

            // Check if it's a file or a directory
            if (!fileExtensionRegex.test(relativePath)) {
                // Create directory (no extension)
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    stack.push(relativePath); // Add to stack as a directory
                }
            } else {
                // Create file (has extension)
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
