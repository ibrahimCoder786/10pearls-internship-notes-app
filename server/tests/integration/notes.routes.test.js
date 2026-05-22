// =============================================
// Test: Notes Routes (Integration)
// Description: Test actual HTTP endpoints
// =============================================

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../../src/app');

chai.use(chaiHttp);

describe('Notes Routes Integration', () => {

  // --- Authorization Checks ---
  describe('Security Check', () => {
    it('should return 401 if token is missing', async () => {
      const res = await chai.request(app).get('/api/v1/notes');
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Access denied. No token provided');
    });

    it('should return 401 if token is invalid', async () => {
      const res = await chai.request(app)
        .get('/api/v1/notes')
        .set('Authorization', 'Bearer invalid_token_here');
      
      expect(res.status).to.equal(401);
    });
  });

  // --- Note Operations ---
  // Note: For deep integration testing, we would login first to get a token
  // but here we are focusing on the security middleware check.
});
