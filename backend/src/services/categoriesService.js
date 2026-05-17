/**
 * Service : logique métier des catégories.
 */
const { Category, Specialty } = require('../models');

async function listCategories() {
    const results = await Category.findAll({
        order: [['id', 'ASC']],
        attributes: ['id', 'name'],
    });
    return results || [];
}

async function findCategoryWithSpecialties(id) {
    return Category.findByPk(id, {
        attributes: ['id', 'name'],
        include: [
            {
                model: Specialty,
                as: 'specialties',
                attributes: ['id', 'name'],
            },
        ],
    });
}

module.exports = {
    listCategories,
    findCategoryWithSpecialties,
};
