const AuthService = require('../services/auth.service');
const responseHandler = require('../utils/responseHandler');
const logger = require('../config/logger.config');

const AuthController = {
  /**
   * Handle user signup/registration
   */
  signup: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.signup({ name, email, password });

      logger.info(
        { event: 'SIGNUP_SUCCESS', userId: result.user.id },
        'User signed up successfully'
      );

      return responseHandler.created(res, result, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      logger.info(
        { event: 'LOGIN_SUCCESS', userId: result.user.id },
        'User logged in successfully'
      );

      return responseHandler.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user logout (Server-side logging)
   */
  logout: async (req, res, next) => {
    try {
      const result = await AuthService.logout(req.user.id);

      logger.info(
        { event: 'LOGOUT_SUCCESS', userId: req.user.id },
        'User logged out successfully'
      );

      return responseHandler.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch current authenticated user profile
   */
  getProfile: async (req, res, next) => {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return responseHandler.success(res, user, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user profile information
   */
  updateProfile: async (req, res, next) => {
    try {
      const { name, avatar_url } = req.body;
      const updated = await AuthService.updateProfile(req.user.id, {
        name,
        avatar_url,
      });

      logger.info(
        { event: 'PROFILE_UPDATE_SUCCESS', userId: req.user.id },
        'Profile updated successfully'
      );

      return responseHandler.success(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = AuthController;