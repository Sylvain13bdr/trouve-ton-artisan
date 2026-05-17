/**
 * Service : logique métier des artisans.
 * Cette couche isole les controllers des modèles Sequelize :
 * - les controllers se contentent de parser la requête et de mettre en forme
 *   la réponse HTTP ;
 * - le service connaît la logique métier (filtres, includes, règles).
 */
const { Op } = require('sequelize');
const { Artisan, Specialty, Category, City } = require('../models');

const fullInclude = [
    {
        model: Specialty,
        as: 'specialty',
        attributes: ['id', 'name'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    },
    {
        model: City,
        as: 'city',
        attributes: ['id', 'name'],
    },
];

/**
 * Liste des artisans, filtrée éventuellement par nom de catégorie
 * et par sous-chaîne du nom d'artisan.
 * @param {object} filters
 * @param {string} [filters.category] - nom exact d'une catégorie
 * @param {string} [filters.q] - sous-chaîne à chercher dans le nom
 * @returns {Promise<Artisan[]>} liste (jamais null, tableau vide si rien)
 */
async function listArtisans({ category, q } = {}) {
    const where = {};
    const include = [...fullInclude];

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

    if (q && q.trim().length > 0) {
        where.name = { [Op.like]: `%${q.trim()}%` };
    }

    const results = await Artisan.findAll({
        where,
        include,
        order: [['rating', 'DESC'], ['name', 'ASC']],
    });
    return results || [];
}

async function findArtisanById(id) {
    return Artisan.findByPk(id, { include: fullInclude });
}

async function getTopOfMonth(limit = 3) {
    const results = await Artisan.findAll({
        where: { isTopOfMonth: true },
        include: fullInclude,
        order: [['rating', 'DESC']],
        limit,
    });
    return results || [];
}

module.exports = {
    listArtisans,
    findArtisanById,
    getTopOfMonth,
};
