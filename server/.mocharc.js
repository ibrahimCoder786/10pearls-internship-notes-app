// =============================================
// Config: Mocha
// Description: Mocha test runner configuration
// =============================================

module.exports = {
  spec: 'tests/**/*.test.js',   // Test files kahan dhoondni hain
  timeout: 10000,               // 10 seconds timeout
  exit: true,                   // Tests ke baad process exit karo
  recursive: true,              // Subfolders mein bhi dhoondo
  reporter: 'spec',             // Readable output format
};
