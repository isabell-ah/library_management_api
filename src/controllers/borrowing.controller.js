const { Book, User, Borrowing } = require('../models');
const moment = require('moment');

// Borrow a book
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, userId, dueDate } = req.body;
    if (!bookId || !userId) {
      return res
        .status(400)
        .json({ message: 'Book ID and User ID are required' });
    }
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res
        .status(400)
        .json({ message: 'Book is not available for borrowing' });
    }
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Calculate due date (default 14 days if not provided)
    const defaultDueDate = moment().add(14, 'days').toDate();
    const borrowingDueDate = dueDate ? new Date(dueDate) : defaultDueDate;

    // Create borrowing record
    const borrowing = await Borrowing.create({
      BookId: bookId,
      UserId: userId,
      borrowDate: new Date(),
      dueDate: borrowingDueDate,
      isReturned: false,
    });

    await book.update({
      availableCopies: book.availableCopies - 1,
    });

    return res.status(201).json({
      message: 'Book borrowed successfully',
      borrowing: {
        ...borrowing.toJSON(),
        book: book.title,
        user: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to borrow book', error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const borrowing = await Borrowing.findByPk(borrowingId, {
      include: [{ model: Book }],
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    if (borrowing.isReturned) {
      return res
        .status(400)
        .json({ message: 'Book has already been returned' });
    }
    await borrowing.update({
      isReturned: true,
      returnDate: new Date(),
    });
    await borrowing.Book.update({
      availableCopies: borrowing.Book.availableCopies + 1,
    });

    return res.status(200).json({
      message: 'Book returned successfully',
      borrowing: {
        ...borrowing.toJSON(),
        isLate: borrowing.isLate,
        daysOverdue: borrowing.daysOverdue,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to return book', error: error.message });
  }
};

// Get all borrowings
exports.getAllBorrowings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Borrowing.findAndCountAll({
      include: [{ model: Book }, { model: User }],
      limit,
      offset,
      order: [['borrowDate', 'DESC']],
    });

    return res.status(200).json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      borrowings: rows,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve borrowings', error: error.message });
  }
};

// Get borrowing by ID
exports.getBorrowingById = async (req, res) => {
  try {
    const borrowing = await Borrowing.findByPk(req.params.id, {
      include: [{ model: Book }, { model: User }],
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    return res.status(200).json(borrowing);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve borrowing', error: error.message });
  }
};
