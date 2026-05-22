// =============================================
// Helper: Mock Data
// Description: Reusable fake data for tests
// =============================================

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test@1234',
  avatar_url: null,
  is_active: true,
  last_login_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockUserResponse = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: null,
  created_at: new Date(),
};

const mockNote = {
  id: 1,
  user_id: 1,
  title: 'Test Note',
  content: '<p>Test content</p>',
  is_pinned: false,
  is_archived: false,
  color: '#ffffff',
  tags: ['test', 'sample'],
  created_at: new Date(),
  updated_at: new Date(),
};

const mockNoteInput = {
  title: 'Test Note',
  content: '<p>Test content</p>',
  color: '#ffffff',
  tags: ['test'],
};

const mockSignupInput = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test@1234',
};

const mockLoginInput = {
  email: 'test@example.com',
  password: 'Test@1234',
};

module.exports = {
  mockUser,
  mockUserResponse,
  mockNote,
  mockNoteInput,
  mockSignupInput,
  mockLoginInput,
};
