import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Fonction pour introduire un délai (optionnel)
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour remplacer chaque symbole └, │, ─, et ├ par un espace
function preprocessStructure(lines: string[]): string[] {
    return lines.map(line => {
        // Remplacer chaque occurrence de └, │, ─, et ├ par un espace unique
        let newLine = line.replace(/└|─|│|├/g, ' '); // Remplacer chaque symbole par un espace
        return newLine;
    });
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
        let lines = fileContent.split('\n');

        // Étape de prétraitement pour remplacer les symboles par des espaces
        lines = preprocessStructure(lines);
        

        // Vérifier le premier élément sans indentation (racine si aucun autre élément au même niveau)
        const rootFolderName = lines[0].trim();
        lines.shift(); // Supprimer le dossier racine de la liste pour traiter le reste
        let hasIndentation = lines.some(line => line.search(/\S/) > 0); // Vérifier s'il y a des indentations

        // Écrire le fichier converti pour vérifier la structure nettoyée
        const convertedFilePath = path.join(path.dirname(filePath), 'structure_converted_with_spaces.txt');
        fs.writeFileSync(convertedFilePath, lines.join('\n'));

        // Demander à l'utilisateur de choisir le dossier où le dossier racine sera créé
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage("Aucun dossier cible sélectionné.");
            return;
        }

        // Si aucun fichier n'est à la même indentation que la racine, traiter comme parent unique
        const rootFolder = path.join(folderUri[0].fsPath, rootFolderName);

        // Créer le dossier racine s'il n'existe pas encore
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder, { recursive: true });
        }

        // Pile pour suivre les dossiers parents en fonction de l'indentation
        let stack: string[] = [rootFolder];
        let previousIndentation = 0;

        // Boucle sur les lignes pour traiter les dossiers et fichiers
        for (const line of lines) {
            const trimmedLine = line.trim();

            // Ignorer les lignes vides
            if (!trimmedLine) {
                continue;
            }

            // Calculer l'indentation actuelle
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

        vscode.window.showInformationMessage(`Structure de fichier créée avec succès dans ${rootFolderName} !`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
