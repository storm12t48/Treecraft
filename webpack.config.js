const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node', // Indique que l'environnement cible est Node.js (utilisé par VS Code)
    entry: './src/extension.ts', // Le point d'entrée de votre extension
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js', // Le fichier de sortie
        libraryTarget: 'commonjs2', // Utilisé pour les modules CommonJS (comme VS Code)
    },
    externals: [nodeExternals(), { vscode: 'commonjs vscode' }], // Exclure vscode du bundling
    resolve: {
        extensions: ['.ts', '.js'], // Les extensions à traiter
    },
    module: {
        rules: [
            {
                test: /\.ts$/, // Traiter les fichiers TypeScript
                exclude: /node_modules/, // Exclure les node_modules
                use: 'ts-loader', // Utiliser ts-loader pour compiler TypeScript
            },
        ],
    },
    devtool: 'source-map', // Inclure les sourcemaps pour faciliter le débogage
};
