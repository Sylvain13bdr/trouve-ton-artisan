/**
 * Contrôleur : artisans.
 * Reçoit la requête HTTP, délègue toute la logique au service,
 * met en forme la réponse HTTP. Aucun appel direct aux modèles.
 */
const artisansService = require('../services/artisansService');

async function listArtisans(req, res, next) {
    try {
        const { category, q } = req.query;
        const artisans = await artisansService.listArtisans({ category, q });
        // Cas vide explicite : 200 OK + tableau vide (le filtre est valide,
        // mais sans résultat → ce n'est pas une erreur 404).
        return res.json(artisans);
    } catch (err) {
        return next(err);
    }
}

async function getArtisan(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ValidationError', message: 'ID invalide.' });
        }
        const artisan = await artisansService.findArtisanById(id);
        if (!artisan) {
            return res.status(404).json({ error: 'NotFound', message: 'Artisan introuvable.' });
        }
        return res.json(artisan);
    } catch (err) {
        return next(err);
    }
}

async function getTopOfMonth(req, res, next) {
    try {
        const artisans = await artisansService.getTopOfMonth(3);
        return res.json(artisans);
    } catch (err) {
        return next(err);
    }
}

module.exports = { listArtisans, getArtisan, getTopOfMonth };
