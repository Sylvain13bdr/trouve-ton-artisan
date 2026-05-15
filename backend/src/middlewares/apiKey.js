/**
 * Middleware d'authentification par clé d'API.
 * Restreint l'accès de l'API à l'application frontend (cf. brief).
 * La clé attendue est lue dans l'en-tête `x-api-key`.
 * Comparaison à temps constant pour éviter les attaques par timing.
 */
const crypto = require('crypto');
const env = require('../config/env');

function safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = function apiKeyMiddleware(req, res, next) {
    const provided = req.get('x-api-key');
    if (!provided || !safeCompare(provided, env.apiKey)) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Clé d\'API manquante ou invalide.',
        });
    }
    return next();
};
