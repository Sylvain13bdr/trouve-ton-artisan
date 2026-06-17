/**
 * Connexion Sequelize vers la base de données.
 * - En production / développement : MySQL / MariaDB (pool de connexions).
 * - En test : SQLite en mémoire, créée à la volée via `sequelize.sync()`,
 *   pour des tests isolés et reproductibles sans base réelle.
 */
const { Sequelize } = require('sequelize');
const env = require('./env');

const define = {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
};

let sequelize;

if (env.nodeEnv === 'test') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define,
    });
} else {
    sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
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
        define,
        dialectOptions: {
            charset: 'utf8mb4',
            // Forcer l'utilisation de SSL en production pour les BDD hébergées
            ...(env.nodeEnv === 'production'
                ? { ssl: { require: true, rejectUnauthorized: false } }
                : {}),
        },
    });
}

module.exports = sequelize;
