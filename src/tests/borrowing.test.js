const request = require('supertest');
const app = require('../app');
const { sequelize, Book, User, Borrowing } = require('../models');

// Set up test environment
let user, book, userId, bookId, borrowingId;

// In borrowing.test.js
beforeEach(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    user = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
    });
    console.log('User created successfully:', user.id);

    book = await Book.create({
      title: 'Test Book',
      isbn: `ISBN${Date.now()}`,
      publicationYear: 2020,
      availableCopies: 3,
      copies: 3,
    });
    console.log('Book created successfully:', book.id);

    userId = user.id;
    bookId = book.id;
  } catch (error) {
    console.error('Error in beforeEach:', error.message, error.stack);
    throw error;
  }
});

describe('Borrowing API', () => {
  test('Should borrow a book', async () => {
    try {
      const res = await request(app).post('/api/borrowings/borrow').send({
        bookId,
        userId,
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Book borrowed successfully');
      expect(res.body.borrowing).toHaveProperty('BookId', bookId);
      expect(res.body.borrowing).toHaveProperty('UserId', userId);
      expect(res.body.borrowing).toHaveProperty('isReturned', false);

      borrowingId = res.body.borrowing.id;

      const updatedBook = await Book.findByPk(bookId);
      expect(updatedBook.availableCopies).toEqual(2);
    } catch (error) {
      console.error('Error in borrowing test:', error.message, error.stack);
      throw error;
    }
  });

  test('Should get all borrowings', async () => {
    try {
      const res = await request(app).get('/api/borrowings');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('borrowings');
      expect(res.body.borrowings).toBeInstanceOf(Array);
    } catch (error) {
      console.error(
        'Error in getting all borrowings test:',
        error.message,
        error.stack
      );
      throw error;
    }
  });

  test('Should return a book', async () => {
    try {
      const borrowRes = await request(app).post('/api/borrowings/borrow').send({
        bookId,
        userId,
      });
      borrowingId = borrowRes.body.borrowing.id;

      const res = await request(app).put(
        `/api/borrowings/return/${borrowingId}`
      );
      console.log('Borrowing ID before return:', borrowingId);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Book returned successfully');
      expect(res.body.borrowing).toHaveProperty('isReturned', true);
      expect(res.body.borrowing).toHaveProperty('returnDate');

      const updatedBook = await Book.findByPk(bookId);
      expect(updatedBook.availableCopies).toEqual(3);
    } catch (error) {
      console.error('Error in returning test:', error.message, error.stack);
      throw error;
    }
  });
});
