/**
 * Contrôleur : avis clients (NoSQL).
 * Vérifie la disponibilité de MongoDB, délègue au service, met en forme la
 * réponse HTTP. Aucun accès direct au modèle.
 */
const reviewsService = require('../services/reviewsService');
const { isMongoConnected } = require('../config/mongo');

function ensureMongo(res) {
    if (!isMongoConnected()) {
        res.status(503).json({
            error: 'ServiceUnavailable',
            message: 'Service des avis momentanément indisponible.',
        });
        return false;
    }
    return true;
}

async function listReviews(req, res, next) {
    try {
        if (!ensureMongo(res)) return undefined;
        const artisanId = Number(req.params.id);
        const data = await reviewsService.listReviewsByArtisan(artisanId);
        return res.json(data);
    } catch (err) {
        return next(err);
    }
}

async function postReview(req, res, next) {
    try {
        if (!ensureMongo(res)) return undefined;
        const artisanId = Number(req.params.id);
        const { authorName, rating, comment } = req.body;
        const result = await reviewsService.createReview(artisanId, {
            authorName,
            rating: Number(rating),
            comment,
        });
        if (result.notFound) {
            return res.status(404).json({ error: 'NotFound', message: 'Artisan introuvable.' });
        }
        return res.status(201).json({ success: true, review: result.review });
    } catch (err) {
        return next(err);
    }
}

module.exports = { listReviews, postReview };
