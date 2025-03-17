// src/tests/setup.js
const { sequelize } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Only close the database in setup.js, not in individual test files
afterAll(async () => {
  await sequelize.close();
});

// Add this to make Jest stop complaining about empty test files
test('setup database', () => {
  expect(true).toBe(true);
});
