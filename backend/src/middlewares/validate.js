/**
 * Petit utilitaire pour transformer les erreurs `express-validator`
 * en réponse JSON cohérente, et stopper la chaîne si nécessaire.
 */
const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    return res.status(400).json({
        error: 'ValidationError',
        details: result.array().map((e) => ({
            field: e.path || e.param,
            message: e.msg,
        })),
    });
};
