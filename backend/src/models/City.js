/**
 * Modèle Sequelize : Ville.
 * Externalisée dans une table dédiée (3FN) pour éviter la redondance
 * du nom de ville sur chaque ligne d'artisan, et permettre de filtrer
 * facilement par ville.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const City = sequelize.define(
    'City',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            validate: { notEmpty: true, len: [2, 120] },
        },
    },
    {
        tableName: 'cities',
        timestamps: true,
        underscored: true,
    }
);

module.exports = City;
