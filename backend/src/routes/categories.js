const express = require('express');
const { param } = require('express-validator');
const ctrl = require('../controllers/categoriesController');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', ctrl.listCategories);

router.get(
    '/:id(\\d+)',
    [param('id').isInt({ min: 1 }).withMessage('ID invalide.')],
    validate,
    ctrl.getCategoryWithSpecialties
);

module.exports = router;
