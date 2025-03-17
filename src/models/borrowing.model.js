module.exports = (sequelize, DataTypes) => {
  const Borrowing = sequelize.define('Borrowing', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    borrowDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isReturned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isLate: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.isReturned) {
          return this.returnDate > this.dueDate;
        }
        return new Date() > this.dueDate;
      },
    },
    daysOverdue: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.isLate) return 0;

        const compareDate = this.isReturned ? this.returnDate : new Date();
        const timeDiff = compareDate - this.dueDate;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      },
    },
  });

  return Borrowing;
};
