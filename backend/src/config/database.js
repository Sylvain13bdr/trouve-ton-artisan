/**
 * Connexion Sequelize vers la base de données MySQL/MariaDB.
 * Utilise un pool de connexions et désactive les logs SQL en production.
 */
const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    logging: env.nodeEnv === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
    dialectOptions: {
        charset: 'utf8mb4',
        // Forcer l'utilisation de SSL en production pour les BDD hébergées
        ...(env.nodeEnv === 'production'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}),
    },
});

module.exports = sequelize;
