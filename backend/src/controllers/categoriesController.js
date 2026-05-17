/**
 * Contrôleur : catégories d'artisanat.
 * Sert principalement à alimenter le menu du header.
 * Délègue à categoriesService — aucun appel direct au modèle.
 */
const categoriesService = require('../services/categoriesService');

async function listCategories(req, res, next) {
    try {
        const categories = await categoriesService.listCategories();
        // Cas vide : 200 OK + tableau vide.
        return res.json(categories);
    } catch (err) {
        return next(err);
    }
}

async function getCategoryWithSpecialties(req, res, next) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ValidationError', message: 'ID invalide.' });
        }
        const category = await categoriesService.findCategoryWithSpecialties(id);
        if (!category) {
            return res.status(404).json({ error: 'NotFound', message: 'Catégorie introuvable.' });
        }
        return res.json(category);
    } catch (err) {
        return next(err);
    }
}

module.exports = { listCategories, getCategoryWithSpecialties };
