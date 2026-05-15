/**
 * Modèle Sequelize : Artisan.
 * Un artisan appartient à une seule spécialité, donc indirectement
 * à une seule catégorie.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artisan = sequelize.define(
    'Artisan',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
            validate: { notEmpty: true, len: [2, 120] },
        },
        rating: {
            type: DataTypes.DECIMAL(2, 1),
            allowNull: false,
            defaultValue: 0,
            validate: { min: 0, max: 5 },
            get() {
                const value = this.getDataValue('rating');
                return value === null ? null : parseFloat(value);
            },
        },
        city: {
            type: DataTypes.STRING(120),
            allowNull: false,
            validate: { notEmpty: true },
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(180),
            allowNull: false,
            validate: { isEmail: true },
        },
        website: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isUrlIfDefined(value) {
                    if (value && !/^https?:\/\/.+/i.test(value)) {
                        throw new Error('Site web : URL invalide.');
                    }
                },
            },
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'image_url',
        },
        specialtyId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'specialty_id',
        },
        isTopOfMonth: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_top_of_month',
        },
    },
    {
        tableName: 'artisans',
        timestamps: true,
        underscored: true,
    }
);

module.exports = Artisan;
