/**
 * Gestionnaire d'erreurs centralisé.
 * Convertit les erreurs Sequelize/Validation en réponses JSON propres
 * et masque les détails techniques en production.
 */
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const isProd = env.nodeEnv === 'production';

    // Erreurs de validation Sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'ValidationError',
            details: err.errors?.map((e) => ({ field: e.path, message: e.message })),
        });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'ValidationError',
            message: 'Référence invalide vers une autre ressource.',
        });
    }

    // Log côté serveur, sans fuir les détails côté client
    // eslint-disable-next-line no-console
    console.error('[error]', err);

    return res.status(status).json({
        error: err.name || 'InternalServerError',
        message: isProd ? 'Une erreur est survenue.' : err.message,
    });
};
