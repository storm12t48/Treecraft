import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Fonction pour introduire un délai (optionnel)
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour remplacer chaque symbole └, │, ─, et ├ par un espace et supprimer les "/"
function preprocessStructure(lines: string[]): string[] {
    return lines
        .filter(line => !line.includes(']') && !line.includes('(ignored)'))  // Ignorer les lignes avec "]" ou "(ignored)"
        .map(line => {
            // Remplacer chaque occurrence de └, │, ─, et ├ par un espace unique, puis supprimer "/"
            let newLine = line.replace(/└|─|│|├/g, ' ').replace(/\//g, ''); // Supprimer les "/"
            return newLine;
        });
}

// Fonction pour vérifier si c'est un fichier ou un dossier en fonction des critères
function isFile(line: string): boolean {
    const trimmedLine = line.trim();
    // Liste des fichiers spécifiques sans extension à considérer comme des fichiers
    const specialFiles = ['Dockerfile', 'Makefile', 'LICENSE', 'README', 'Gemfile', 'Capfile', 'Procfile', 'Rakefile', 'Vagrantfile'];

    // Si le nom est "Dockerfile", c'est toujours un fichier
    if (trimmedLine === 'Dockerfile') {
        return true;
    }

    // Si le nom contient "ignore", c'est un fichier
    if (trimmedLine.includes('ignore')) {
        return true;
    }

    // Si le nom se termine par "/", c'est un dossier
    if (trimmedLine.endsWith('/')) {
        return false;
    }

    // Si le nom a une extension (ex. .mjs, .js, .txt), c'est un fichier
    if (path.extname(trimmedLine)) {
        return true;
    }

    // Par défaut, si aucune condition n'est remplie, c'est un dossier
    return false;
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

        // Étape de prétraitement pour remplacer les symboles par des espaces et supprimer les "/"
        lines = preprocessStructure(lines);

        // Vérifier le premier élément sans indentation (racine si aucun autre élément au même niveau)
        const rootFolderName = lines[0].trim(); // Assurez-vous que c'est uniquement un nom de dossier
        //vscode.window.showInformationMessage(`Nom du dossier racine : ${rootFolderName}`); // Debug: Afficher le nom du dossier racine
        lines.shift(); // Supprimer le dossier racine de la liste pour traiter le reste

        // Écrire le fichier converti pour vérifier la structure nettoyée
        const convertedFilePath = path.join(path.dirname(filePath), 'structure_converted_with_spaces.txt');
        fs.writeFileSync(convertedFilePath, lines.join('\n'));

        // Demander à l'utilisateur de choisir le dossier cible où le dossier racine sera créé
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage("Aucun dossier cible sélectionné.");
            return;
        }

        // Utiliser uniquement le chemin choisi par l'utilisateur
        const rootFolder = folderUri[0].fsPath; // Utilisez uniquement le chemin du dossier cible sélectionné

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

            // Si l'indentation est inférieure à la précédente, ajuster la pile
            if (currentIndentation < previousIndentation && stack.length > 1) {
                stack.pop(); // Remonter dans la hiérarchie
            }

            // Construire le chemin complet pour le dossier ou fichier
            const fullPath = path.join(stack[stack.length - 1], trimmedLine);

            // Vérifier si c'est un fichier ou un dossier selon les nouvelles règles
            if (isFile(trimmedLine)) {
                // C'est un fichier
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullPath, ''); // Créer un fichier vide
            } else {
                // C'est un dossier
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                stack.push(fullPath); // Ajouter ce dossier à la pile
            }

            // Mettre à jour l'indentation précédente
            previousIndentation = currentIndentation;

            // Introduire un petit délai pour éviter les problèmes de performance (optionnel)
            await wait(100); // Attendre 100ms avant de continuer (facultatif)
        }

        vscode.window.showInformationMessage(`Structure de fichier créée avec succès dans ${rootFolder} !`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
