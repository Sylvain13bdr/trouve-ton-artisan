/**
 * Modèle Sequelize : Catégorie d'artisanat.
 * Une catégorie regroupe plusieurs spécialités.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
    'Category',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: { notEmpty: true, len: [2, 50] },
        },
    },
    {
        tableName: 'categories',
        timestamps: true,
        underscored: true,
    }
);

module.exports = Category;
