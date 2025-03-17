module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // Title must not be null
      defaultValue: 'TBA',
      validate: {
        notEmpty: true,
      },
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () =>
        `ISBN-${Math.floor(100000000 + Math.random() * 900000000)}`, // Generate a random ISBN
      validate: {
        notEmpty: true,
      },
    },
    publicationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: -3000, // Allow books from ancient history
        max: new Date().getFullYear(),
      },
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://via.placeholder.com/150',
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      // defaultValue: 3, // Default rating
      validate: {
        min: 0,
        max: 5,
      },
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    availableCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
  });

  return Book;
};
