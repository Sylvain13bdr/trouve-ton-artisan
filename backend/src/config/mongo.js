/**
 * Connexion à MongoDB (Mongoose) pour la persistance NoSQL des avis clients.
 * Volontairement séparée de la connexion SQL (Sequelize) : l'application
 * démontre ainsi un accès aux données à la fois SQL (artisans, catégories…)
 * et NoSQL (avis), comme l'exige le référentiel DWWM.
 *
 * La connexion n'est pas bloquante au démarrage : si MongoDB est indisponible,
 * l'API SQL continue de fonctionner et les routes d'avis renvoient un 503.
 */
const mongoose = require('mongoose');
const env = require('./env');

// Les requêtes échouent immédiatement si la connexion n'est pas établie,
// au lieu d'être mises en file d'attente (évite les requêtes qui « pendent »).
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

async function connectMongo() {
    if (!env.mongoUri) {
        throw new Error('MONGODB_URI non défini : persistance NoSQL des avis désactivée.');
    }
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    return mongoose.connection;
}

function isMongoConnected() {
    return mongoose.connection.readyState === 1;
}

async function disconnectMongo() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}

module.exports = { connectMongo, isMongoConnected, disconnectMongo, mongoose };
