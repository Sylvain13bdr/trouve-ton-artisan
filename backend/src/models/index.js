/**
 * Point d'entrée des modèles : déclare les associations Sequelize
 * pour que les relations soient interrogeables (include).
 */
const sequelize = require('../config/database');
const Category = require('./Category');
const Specialty = require('./Specialty');
const City = require('./City');
const Artisan = require('./Artisan');
const ContactMessage = require('./ContactMessage');

// Catégorie 1,n Spécialités
Category.hasMany(Specialty, {
    foreignKey: 'categoryId',
    as: 'specialties',
    onDelete: 'RESTRICT',
});
Specialty.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});

// Spécialité 1,n Artisans
Specialty.hasMany(Artisan, {
    foreignKey: 'specialtyId',
    as: 'artisans',
    onDelete: 'RESTRICT',
});
Artisan.belongsTo(Specialty, {
    foreignKey: 'specialtyId',
    as: 'specialty',
});

// Ville 1,n Artisans (3FN)
City.hasMany(Artisan, {
    foreignKey: 'cityId',
    as: 'artisans',
    onDelete: 'RESTRICT',
});
Artisan.belongsTo(City, {
    foreignKey: 'cityId',
    as: 'city',
});

// Artisan 1,n Messages de contact
Artisan.hasMany(ContactMessage, {
    foreignKey: 'artisanId',
    as: 'messages',
    onDelete: 'CASCADE',
});
ContactMessage.belongsTo(Artisan, {
    foreignKey: 'artisanId',
    as: 'artisan',
});

module.exports = {
    sequelize,
    Category,
    Specialty,
    City,
    Artisan,
    ContactMessage,
};
