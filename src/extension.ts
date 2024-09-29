import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Fonction pour introduire un délai (optionnel)
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('treecraft.createFileTree', async () => {
        // Ouvrir le fichier contenant l'arborescence
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Text files': ['txt']
            }
        });

        if (!fileUri || fileUri.length === 0) {
            vscode.window.showErrorMessage("Aucun fichier sélectionné.");
            return;
        }

        const filePath = fileUri[0].fsPath;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        // Demander à l'utilisateur de choisir le dossier cible
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage("Aucun dossier cible sélectionné.");
            return;
        }

        const targetFolder = folderUri[0].fsPath;

        // Pile pour suivre les dossiers parents en fonction de l'indentation
        let stack: string[] = [targetFolder];
        let previousIndentation = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Ignorer les lignes vides
            if (!trimmedLine) {
                continue;
            }

            // Calculer l'indentation (nombre d'espaces ou tabulations avant le texte)
            const currentIndentation = line.search(/\S/);

            // Si l'indentation est inférieure ou égale à la précédente, ajuster la pile
            while (currentIndentation <= previousIndentation && stack.length > 1) {
                stack.pop(); // Remonter dans la hiérarchie
                previousIndentation--; // Ajuster l'indentation
            }

            // Construire le chemin complet pour le dossier ou fichier
            const fullPath = path.join(stack[stack.length - 1], trimmedLine);

            if (!trimmedLine.includes('.')) {
                // C'est un dossier
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                stack.push(fullPath); // Ajouter ce dossier à la pile
            } else {
                // C'est un fichier
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullPath, ''); // Créer un fichier vide
            }

            // Mettre à jour l'indentation précédente
            previousIndentation = currentIndentation;

            // Introduire un petit délai pour éviter les problèmes de performance (optionnel)
            await wait(100); // Attendre 100ms avant de continuer (facultatif)
        }

        vscode.window.showInformationMessage('Structure de fichier créée avec succès !');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

