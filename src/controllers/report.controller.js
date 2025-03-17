const { Book, User, Borrowing } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// Get overdue books report
exports.getOverdueBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Books not returned/ returned late
    const { count, rows } = await Borrowing.findAndCountAll({
      where: {
        [Op.or]: [
          {
            isReturned: false,
            dueDate: { [Op.lt]: new Date() },
          },
          {
            isReturned: true,
            returnDate: { [Op.gt]: sequelize.col('dueDate') },
          },
        ],
      },
      include: [{ model: Book }, { model: User }],
      limit,
      offset,
      order: [['dueDate', 'ASC']],
    });

    // Calculate days overdue
    const overdueBooks = rows.map((borrowing) => {
      const today = new Date();
      const dueDate = new Date(borrowing.dueDate);

      let daysOverdue;
      if (borrowing.isReturned) {
        const returnDate = new Date(borrowing.returnDate);
        daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      } else {
        daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      }

      return {
        ...borrowing.toJSON(),
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
      };
    });

    return res.status(200).json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      overdueBooks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to retrieve overdue books',
      error: error.message,
    });
  }
};
