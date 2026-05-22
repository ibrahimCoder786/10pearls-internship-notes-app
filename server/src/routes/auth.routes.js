const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
  validate,
  signupRules,
  loginRules,
  updateProfileRules,
} = require('../middleware/validate.middleware');

// --- Public Routes ---
router.post('/signup', signupRules, validate, AuthController.signup);
router.post('/login', loginRules, validate, AuthController.login);

// --- Protected Routes ---
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, updateProfileRules, validate, AuthController.updateProfile);

module.exports = router;