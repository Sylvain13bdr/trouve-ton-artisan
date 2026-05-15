const express = require('express');
const rateLimit = require('express-rate-limit');
const { param, query, body } = require('express-validator');

const artisansCtrl = require('../controllers/artisansController');
const contactCtrl = require('../controllers/contactController');
const validate = require('../middlewares/validate');
const env = require('../config/env');

const router = express.Router();

// Rate limit dédié au formulaire de contact, plus strict que la moyenne.
const contactLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.contactMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'TooManyRequests',
        message: 'Trop de messages envoyés. Merci de réessayer plus tard.',
    },
});

router.get(
    '/',
    [
        query('category').optional().isString().trim().isLength({ max: 50 }),
        query('q').optional().isString().trim().isLength({ max: 80 }),
    ],
    validate,
    artisansCtrl.listArtisans
);

router.get('/top-of-month', artisansCtrl.getTopOfMonth);

router.get(
    '/:id(\\d+)',
    [param('id').isInt({ min: 1 }).withMessage('ID invalide.')],
    validate,
    artisansCtrl.getArtisan
);

router.post(
    '/:id(\\d+)/contact',
    contactLimiter,
    [
        param('id').isInt({ min: 1 }).withMessage('ID invalide.'),
        body('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nom requis (2 à 120 caractères).'),
        body('email').isEmail().withMessage('E-mail invalide.').normalizeEmail(),
        body('subject').isString().trim().isLength({ min: 2, max: 180 }).withMessage('Objet requis (2 à 180 caractères).'),
        body('message').isString().trim().isLength({ min: 10, max: 5000 }).withMessage('Message requis (10 à 5000 caractères).'),
    ],
    validate,
    contactCtrl.postContact
);

module.exports = router;
