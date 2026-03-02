module.exports = {
  projects: [
    {
      displayName: 'renderer',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/renderer/**/*.test.js']
    },
    {
      displayName: 'sticky',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/sticky/**/*.test.js']
    },
    {
      displayName: 'main',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/main/**/*.test.js']
    }
  ]
};
