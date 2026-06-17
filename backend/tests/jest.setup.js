/**
 * Setup Jest exécuté avant la suite de tests.
 * Si un binaire `mongod` est déjà installé sur la machine, on le réutilise
 * pour `mongodb-memory-server` (évite tout téléchargement). Sinon, la
 * librairie télécharge la version requise automatiquement.
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
