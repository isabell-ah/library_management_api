const { Book, Author, Borrowing, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all books with pagination
exports.getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search;
    let whereCondition = {};

    if (searchQuery) {
      whereCondition = {
        [Op.or]: [
          { title: { [Op.like]: `%${searchQuery}%` } },
          { isbn: { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }

    const { count, rows } = await Book.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Author,
          through: { attributes: [] },
          ...(searchQuery && {
            where: { name: { [Op.like]: `%${searchQuery}%` } },
            required: false,
          }),
        },
      ],
      distinct: true,
      limit,
      offset,
    });

    return res.status(200).json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      books: rows,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve books', error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [{ model: Author, through: { attributes: [] } }],
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve book', error: error.message });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { title, isbn, publicationYear, authors, image, rating, copies } =
      req.body;
    if (!title || !isbn || !publicationYear || !authors || !copies) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      return res
        .status(409)
        .json({ message: 'Book with this ISBN already exists' });
    }

    const newBook = await Book.create(
      {
        title,
        isbn,
        publicationYear,
        image,
        rating: rating || 0,
        copies: parseInt(copies),
        availableCopies: parseInt(copies),
      },
      { transaction }
    );
    const authorList = Array.isArray(authors) ? authors : [authors];
    for (const authorName of authorList) {
      const [author] = await Author.findOrCreate({
        where: { name: authorName },
        transaction,
      });
      await newBook.addAuthor(author, { transaction });
    }
    await transaction.commit();
    const book = await Book.findByPk(newBook.id, {
      include: [{ model: Author, through: { attributes: [] } }],
    });

    return res.status(201).json(book);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to create book', error: error.message });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, isbn, publicationYear, authors, image, rating, copies } =
      req.body;
    console.log('Received update request:', req.body);
    const bookId = req.params.id;
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    await book.update(
      {
        title: title || book.title,
        isbn: isbn || book.isbn,
        publicationYear: publicationYear || book.publicationYear,
        image: image || book.image,
        rating: rating || book.rating,
        copies: copies ? parseInt(copies) : book.copies,
        availableCopies: copies
          ? book.availableCopies + (parseInt(copies) - book.copies)
          : book.availableCopies,
      },
      { transaction }
    );

    if (authors) {
      const authorList = Array.isArray(authors) ? authors : [authors];
      await book.setAuthors([], { transaction });
      for (const authorName of authorList) {
        const [author] = await Author.findOrCreate({
          where: { name: authorName },
          transaction,
        });
        await book.addAuthor(author, { transaction });
      }
    }
    await transaction.commit();
    const updatedBook = await Book.findByPk(bookId, {
      include: [{ model: Author, through: { attributes: [] } }],
    });
    return res.status(200).json(updatedBook);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to update book', error: error.message });
  }
};
// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book is currently borrowed
    const activeBorrowings = await Borrowing.findOne({
      where: {
        BookId: bookId,
        isReturned: false,
      },
    });

    if (activeBorrowings) {
      return res.status(400).json({
        message: 'Cannot delete book as it is currently borrowed',
      });
    }
    await book.destroy();
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to delete book', error: error.message });
  }
};

// filtering out by author
exports.getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, author } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { isbn: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const authorCondition = author
      ? { name: { [Op.like]: `%${author}%` } }
      : null;

    const { count, rows } = await Book.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Author,
          through: { attributes: [] },
          where: authorCondition || undefined,
          required: !!author,
        },
      ],
      distinct: true,
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      books: rows,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve books', error: error.message });
  }
};
