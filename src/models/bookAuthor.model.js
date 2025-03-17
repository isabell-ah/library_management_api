module.exports = (sequelize, DataTypes) => {
  const BookAuthor = sequelize.define(
    'BookAuthor',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return BookAuthor;
};
