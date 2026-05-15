/**
 * Chargement et validation des variables d'environnement.
 * Une variable manquante provoque un arrêt explicite du serveur,
 * pour éviter de démarrer dans un état non sécurisé.
 */
require('dotenv').config();

const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'API_KEY'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`[config] Variables d'environnement manquantes : ${missing.join(', ')}`);
    process.exit(1);
}

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 4000,

    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },

    corsOrigins: (process.env.CORS_ORIGIN || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),

    apiKey: process.env.API_KEY,

    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM,
    },

    rateLimit: {
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_MAX) || 100,
        contactMax: Number(process.env.CONTACT_RATE_LIMIT_MAX) || 5,
    },
};

module.exports = env;
