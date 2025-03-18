const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const Book = require('./book.model')(sequelize, DataTypes);
const Author = require('./author.model')(sequelize, DataTypes);
const User = require('./user.model')(sequelize, DataTypes);
const Borrowing = require('./borrowing.model')(sequelize, DataTypes);
const BookAuthor = require('./bookAuthor.model')(sequelize, DataTypes);

Book.belongsToMany(Author, { through: BookAuthor });
Author.belongsToMany(Book, { through: BookAuthor });

Book.hasMany(Borrowing);
Borrowing.belongsTo(Book);

User.hasMany(Borrowing);
Borrowing.belongsTo(User);

module.exports = {
  sequelize,
  Book,
  Author,
  User,
  Borrowing,
  BookAuthor,
};
