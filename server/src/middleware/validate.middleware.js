const { validationResult, body } = require('express-validator');
const logger = require('../config/logger.config');

/**
 * Validation Result Middleware: Checks for validation errors and sends standardized response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn(
      {
        event: 'VALIDATION_FAILED',
        path: req.path,
        errors: errors.array(),
      },
      'Request validation failed'
    );

    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// --- AUTHENTICATION RULES ---

const signupRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// --- NOTES RULES ---

const createNoteRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),

  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string (key or hex value)'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const updateNoteRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),

  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string (key or hex value)'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

// --- PROFILE RULES ---

const updateProfileRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  createNoteRules,
  updateNoteRules,
  updateProfileRules,
};