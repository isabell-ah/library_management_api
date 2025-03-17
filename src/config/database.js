const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dbDir, 'library.sqlite'),
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    // Force sync in development/test only, not in production
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

if (require.main === module) {
  testConnection();
}

module.exports = { sequelize, testConnection };
