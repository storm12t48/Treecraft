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

        // The target folder is where everything will be created
        const targetFolder = folderUri[0].fsPath;

        // Regex to identify file extensions
        const fileExtensionRegex = /\.[a-zA-Z0-9]+$/;

        // Stack to maintain the current directory hierarchy
        const stack: string[] = [targetFolder];

        // Start processing the file content
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Ignore the first line if it starts with '/'
            if (index === 0 && trimmedLine.startsWith('/')) {
                return; // Skip the root folder name
            }

            if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine === '│') {
                return; // Skip comments, empty lines, and formatting lines
            }

            const depth = (line.match(/│|├|└/g) || []).length; // Calculate depth based on '│', '├', and '└'
            
            const relativePath = trimmedLine.replace(/^[├─└│]+/g, '').trim();
            const fullPath = path.join(...stack.slice(0, depth), relativePath.replace(/\/$/, ''));

            // Check if it's a file or a directory
            if (!fileExtensionRegex.test(relativePath)) {
                // Create directory (no extension)
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    stack[depth] = fullPath; // Add to stack as a directory
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
