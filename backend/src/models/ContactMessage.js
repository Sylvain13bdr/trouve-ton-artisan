/**
 * Modèle Sequelize : Message de contact envoyé à un artisan.
 * Conservé en BDD pour la traçabilité (sans modération automatique).
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define(
    'ContactMessage',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        artisanId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'artisan_id',
        },
        senderName: {
            type: DataTypes.STRING(120),
            allowNull: false,
            field: 'sender_name',
            validate: { notEmpty: true, len: [2, 120] },
        },
        senderEmail: {
            type: DataTypes.STRING(180),
            allowNull: false,
            field: 'sender_email',
            validate: { isEmail: true },
        },
        subject: {
            type: DataTypes.STRING(180),
            allowNull: false,
            validate: { notEmpty: true, len: [2, 180] },
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { notEmpty: true, len: [10, 5000] },
        },
    },
    {
        tableName: 'contact_messages',
        timestamps: true,
        updatedAt: false,
        underscored: true,
    }
);

module.exports = ContactMessage;
