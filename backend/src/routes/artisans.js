const express = require('express');
const rateLimit = require('express-rate-limit');
const { param, query, body } = require('express-validator');

const artisansCtrl = require('../controllers/artisansController');
const contactCtrl = require('../controllers/contactController');
const reviewsCtrl = require('../controllers/reviewsController');
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

// Rate limit dédié au dépôt d'avis (NoSQL), pour limiter le spam.
const reviewLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.reviewMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'TooManyRequests',
        message: 'Trop d’avis envoyés. Merci de réessayer plus tard.',
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

// --- Avis clients (persistance NoSQL / MongoDB) ---

router.get(
    '/:id(\\d+)/reviews',
    [param('id').isInt({ min: 1 }).withMessage('ID invalide.')],
    validate,
    reviewsCtrl.listReviews
);

router.post(
    '/:id(\\d+)/reviews',
    reviewLimiter,
    [
        param('id').isInt({ min: 1 }).withMessage('ID invalide.'),
        body('authorName').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nom requis (2 à 120 caractères).'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Note requise (1 à 5).'),
        body('comment').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Avis requis (10 à 2000 caractères).'),
    ],
    validate,
    reviewsCtrl.postReview
);

module.exports = router;
