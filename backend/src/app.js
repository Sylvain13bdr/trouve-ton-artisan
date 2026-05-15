/**
 * Application Express : configuration des middlewares de sécurité,
 * CORS, journalisation, routes et gestionnaire d'erreurs.
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Cache désactivé pour les réponses dynamiques de l'API
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Sécurité : en-têtes HTTP recommandés (Helmet)
app.use(
    helmet({
        contentSecurityPolicy: false, // API JSON pure, pas de page HTML
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// CORS restreint : seules les origines listées (frontend) sont autorisées.
const allowedOrigins = env.corsOrigins;
app.use(
    cors({
        origin(origin, callback) {
            // Autorise les requêtes sans origine (curl, monitoring) seulement hors production.
            if (!origin) {
                return callback(null, env.nodeEnv !== 'production');
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Origine non autorisée par la politique CORS.'));
        },
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'x-api-key'],
        credentials: false,
        maxAge: 86400,
    })
);

// Rate limiting général
app.use(
    rateLimit({
        windowMs: env.rateLimit.windowMs,
        max: env.rateLimit.max,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Parsing JSON avec taille maximale réduite pour limiter les abus
app.use(express.json({ limit: '32kb' }));

// Logs HTTP en dev
if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Routes principales
app.use('/api', routes);

// 404 par défaut pour les routes inconnues
app.use((req, res) => res.status(404).json({ error: 'NotFound', path: req.originalUrl }));

// Gestionnaire d'erreurs final
app.use(errorHandler);

module.exports = app;
