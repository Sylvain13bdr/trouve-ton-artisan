/**
 * Assembleur de routes de l'API REST.
 * Les routes métier sont protégées par la clé d'API ; la route de santé
 * `/health` reste publique pour les sondes des hébergeurs.
 */
const express = require('express');
const apiKey = require('../middlewares/apiKey');
const categories = require('./categories');
const artisans = require('./artisans');

const router = express.Router();

router.get('/health', (req, res) =>
    res.json({ status: 'ok', service: 'trouve-ton-artisan-api', time: new Date().toISOString() })
);

router.use('/categories', apiKey, categories);
router.use('/artisans', apiKey, artisans);

module.exports = router;
