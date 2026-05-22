import { isValidEmail, isStrongPassword, truncate } from './validators';

describe('Validators Unit Tests', () => {
  test('isValidEmail', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('isStrongPassword', () => {
    expect(isStrongPassword('Abc12345')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
  });

  test('truncate', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});
