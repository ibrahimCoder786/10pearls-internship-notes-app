const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { generateToken } = require('../utils/jwtHelper');
const logger = require('../config/logger.config');

const AuthService = {
  /**
   * Register a new user
   */
  signup: async ({ name, email, password }) => {
    // 1. Check if email already exists
    const exists = await UserModel.emailExists(email);
    if (exists) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    // 2. Encrypt password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user in database
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Log the registration
    logger.info({ userId: user.id, event: 'USER_SIGNUP' }, 'New user registered');

    // 5. Generate authentication token
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  },

  /**
   * Log in an existing user
   */
  login: async ({ email, password }) => {
    // 1. Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 3. Update last login timestamp for analytics
    await UserModel.updateLastLogin(user.id);

    // 4. Log the login event
    logger.info({ userId: user.id, event: 'USER_LOGIN' }, 'User logged in');

    // 5. Generate authentication token
    const token = generateToken({ id: user.id, email: user.email });

    // 6. Security: Remove password from response object
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  /**
   * Log out a user (Server-side logging)
   */
  logout: async (userId) => {
    logger.info({ userId, event: 'USER_LOGOUT' }, 'User logged out');
    return { message: 'Logged out successfully' };
  },

  /**
   * Fetch user profile details
   */
  getProfile: async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  /**
   * Update user profile information
   */
  updateProfile: async (userId, { name, avatar_url }) => {
    const updated = await UserModel.updateProfile(userId, { name, avatar_url });
    if (!updated) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    logger.info({ userId, event: 'PROFILE_UPDATED' }, 'User profile updated');
    return updated;
  },
};

module.exports = AuthService;