const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

// register
router.post('/register', [
    body('firstName').notEmpty().withMessage('firstName required'),
    body('tel').notEmpty().isLength({ min: 10, max: 10 }),
    body('password').isLength({ min: 8 })
], authController.register);

// login
router.post('/login', [
    body('tel').notEmpty(),
    body('password').notEmpty()
], authController.login);

module.exports = router;
