/**
 * Contrôleur : artisans.
 * Liste filtrable par catégorie et par recherche sur le nom,
 * détail d'un artisan, et top 3 du mois pour la page d'accueil.
 */
const { Op } = require('sequelize');
const { Artisan, Specialty, Category } = require('../models');

const artisanFullInclude = [
    {
        model: Specialty,
        as: 'specialty',
        attributes: ['id', 'name'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    },
];

async function listArtisans(req, res, next) {
    try {
        const { category, q } = req.query;
        const where = {};
        const include = [...artisanFullInclude];

        // Filtre par nom de catégorie (le menu envoie le slug textuel)
        if (category) {
            include[0] = {
                ...include[0],
                required: true,
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name'],
                        where: { name: category },
                        required: true,
                    },
                ],
            };
        }

        // Recherche par sous-chaîne du nom de l'artisan (insensible à la casse côté MySQL)
        if (q && q.trim().length > 0) {
            where.name = { [Op.like]: `%${q.trim()}%` };
        }

        const artisans = await Artisan.findAll({
            where,
            include,
            order: [['rating', 'DESC'], ['name', 'ASC']],
        });
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
        const artisan = await Artisan.findByPk(id, { include: artisanFullInclude });
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
        const artisans = await Artisan.findAll({
            where: { isTopOfMonth: true },
            include: artisanFullInclude,
            order: [['rating', 'DESC']],
            limit: 3,
        });
        return res.json(artisans);
    } catch (err) {
        return next(err);
    }
}

module.exports = { listArtisans, getArtisan, getTopOfMonth };
