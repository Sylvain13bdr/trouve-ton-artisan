/**
 * Contrôleur : catégories d'artisanat.
 * Sert principalement à alimenter le menu du header.
 */
const { Category, Specialty } = require('../models');

async function listCategories(req, res, next) {
    try {
        const categories = await Category.findAll({
            order: [['id', 'ASC']],
            attributes: ['id', 'name'],
        });
        return res.json(categories);
    } catch (err) {
        return next(err);
    }
}

async function getCategoryWithSpecialties(req, res, next) {
    try {
        const id = Number(req.params.id);
        const category = await Category.findByPk(id, {
            attributes: ['id', 'name'],
            include: [
                {
                    model: Specialty,
                    as: 'specialties',
                    attributes: ['id', 'name'],
                },
            ],
        });

        if (!category) {
            return res.status(404).json({ error: 'NotFound', message: 'Catégorie introuvable.' });
        }
        return res.json(category);
    } catch (err) {
        return next(err);
    }
}

module.exports = { listCategories, getCategoryWithSpecialties };
