/**
 * Modèle Sequelize : Spécialité d'artisanat.
 * Une spécialité est rattachée à une seule catégorie.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Specialty = sequelize.define(
    'Specialty',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true,
            validate: { notEmpty: true, len: [2, 80] },
        },
        categoryId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'category_id',
        },
    },
    {
        tableName: 'specialties',
        timestamps: true,
        underscored: true,
    }
);

module.exports = Specialty;
