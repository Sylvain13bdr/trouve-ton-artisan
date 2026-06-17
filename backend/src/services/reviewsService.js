/**
 * Service : logique métier des avis clients (NoSQL / MongoDB).
 * Pendant NoSQL de `artisansService` (SQL) : même rôle de couche métier
 * isolant le contrôleur de l'accès aux données.
 */
const Review = require('../models/Review');
const { Artisan } = require('../models');

/**
 * Liste les avis d'un artisan (du plus récent au plus ancien) et calcule la
 * note moyenne via une agrégation MongoDB.
 * @param {number} artisanId
 * @returns {Promise<{items: object[], count: number, average: number|null}>}
 */
async function listReviewsByArtisan(artisanId) {
    const items = await Review.find({ artisanId }).sort({ createdAt: -1 }).lean();

    const [stats] = await Review.aggregate([
        { $match: { artisanId } },
        { $group: { _id: '$artisanId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    return {
        items,
        count: stats ? stats.count : 0,
        average: stats ? Math.round(stats.average * 10) / 10 : null,
    };
}

/**
 * Crée un avis pour un artisan, après avoir vérifié son existence côté SQL.
 * Illustre la complémentarité SQL (vérification de l'artisan) + NoSQL (avis).
 * @returns {Promise<{notFound?: boolean, review?: object}>}
 */
async function createReview(artisanId, { authorName, rating, comment }) {
    const artisan = await Artisan.findByPk(artisanId);
    if (!artisan) return { notFound: true };

    const review = await Review.create({ artisanId, authorName, rating, comment });
    return { review };
}

module.exports = { listReviewsByArtisan, createReview };
