// =============================================
// Test: Auth Routes (Integration)
// Description: Test actual HTTP endpoints
// =============================================

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../../src/app');

chai.use(chaiHttp);

describe('Auth Routes Integration', () => {

  // --- Signup Route ---
  describe('POST /api/v1/auth/signup', () => {
    it('should signup a new user successfully', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Integration Test User',
          email: uniqueEmail,
          password: 'Password123'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.have.property('token');
    });

    it('should fail if email is invalid', async () => {
      const res = await chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: 'Password123'
        });

      expect(res.status).to.equal(422); // Validation error
      expect(res.body.success).to.equal(false);
    });
  });

  // --- Login Route ---
  describe('POST /api/v1/auth/login', () => {
    it('should fail with incorrect credentials', async () => {
      const res = await chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'WrongPassword123'
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
    });
  });
});
