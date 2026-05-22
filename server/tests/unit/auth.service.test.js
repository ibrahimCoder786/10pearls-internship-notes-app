// =============================================
// Test: Auth Service
// Description: Unit tests for auth business logic
// =============================================

const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');

const AuthService = require('../../src/services/auth.service');
const UserModel = require('../../src/models/user.model');
const { generateToken } = require('../../src/utils/jwtHelper');
const { mockUser, mockSignupInput, mockLoginInput, mockUserResponse } = require('../helpers/mockData');

describe('AuthService Unit Tests', () => {

  // Har test ke baad stubs reset karo
  afterEach(() => {
    sinon.restore();
  });

  // --- Signup Tests ---
  describe('signup()', () => {
    it('should create a new user and return token', async () => {
      // Stubbing: Email doesn't exist
      sinon.stub(UserModel, 'emailExists').resolves(false);
      // Stubbing: User is created
      sinon.stub(UserModel, 'create').resolves(mockUserResponse);
      // Stubbing: Bcrypt salt & hash
      sinon.stub(bcrypt, 'genSalt').resolves('salt');
      sinon.stub(bcrypt, 'hash').resolves('hashed_pass');

      const result = await AuthService.signup(mockSignupInput);

      expect(result).to.have.property('user');
      expect(result).to.have.property('token');
      expect(result.user.email).to.equal(mockSignupInput.email);
    });

    it('should throw 409 error if email already exists', async () => {
      sinon.stub(UserModel, 'emailExists').resolves(true);

      try {
        await AuthService.signup(mockSignupInput);
        expect.fail('Should have thrown 409 error');
      } catch (error) {
        expect(error.statusCode).to.equal(409);
        expect(error.message).to.equal('Email already registered');
      }
    });
  });

  // --- Login Tests ---
  describe('login()', () => {
    it('should login user and return token on correct credentials', async () => {
      sinon.stub(UserModel, 'findByEmail').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(UserModel, 'updateLastLogin').resolves();

      const result = await AuthService.login(mockLoginInput);

      expect(result).to.have.property('user');
      expect(result).to.have.property('token');
      expect(result.user).to.not.have.property('password');
    });

    it('should throw 401 if user not found', async () => {
      sinon.stub(UserModel, 'findByEmail').resolves(null);

      try {
        await AuthService.login(mockLoginInput);
        expect.fail('Should have thrown 401');
      } catch (error) {
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Invalid email or password');
      }
    });
  });
});
