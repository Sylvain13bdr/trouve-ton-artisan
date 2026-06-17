/**
 * Setup Mocha exécuté avant la suite de tests (via .mocharc.json « require »).
 * Réutilise un binaire mongod local s'il existe (évite tout téléchargement par
 * mongodb-memory-server). Sinon, la librairie télécharge la version requise.
 */
const fs = require('fs');

if (!process.env.MONGOMS_SYSTEM_BINARY) {
    const candidates = [
        'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
        'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
        '/usr/bin/mongod',
        '/usr/local/bin/mongod',
        '/opt/homebrew/bin/mongod',
    ];
    const found = candidates.find((p) => {
        try {
            return fs.existsSync(p);
        } catch {
            return false;
        }
    });
    if (found) {
        process.env.MONGOMS_SYSTEM_BINARY = found;
    }
}
