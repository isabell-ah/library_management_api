const request = require('supertest');
const app = require('../app');
const { sequelize, Book, User, Borrowing } = require('../models');

// Set up test environment
let user, book, userId, bookId, borrowingId;

// In borrowing.test.js
beforeEach(async () => {
  try {
    // Create user with all required fields
    user = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Ensure unique email
    });
    console.log('User created successfully:', user.id);

    // Create book with all required fields
    book = await Book.create({
      title: 'Test Book',
      isbn: `ISBN${Date.now()}`, // Ensure unique ISBN
      publicationYear: 2020,
      availableCopies: 3,
      copies: 3,
      // If authors is required, add it here
      // authors: []
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
  // Test borrowing a book
  test('Should borrow a book', async () => {
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

    // Check book availability updated
    const updatedBook = await Book.findByPk(bookId);
    expect(updatedBook.availableCopies).toEqual(2);
  });

  // Test getting all borrowings
  test('Should get all borrowings', async () => {
    const res = await request(app).get('/api/borrowings');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('borrowings');
    expect(res.body.borrowings).toBeInstanceOf(Array);
    expect(res.body.borrowings.length).toBeGreaterThan(0);
  });

  // Test returning a book
  test('Should return a book', async () => {
    // First, borrow a book to get a `borrowingId`
    const borrowRes = await request(app).post('/api/borrowings/borrow').send({
      bookId,
      userId,
    });
    borrowingId = borrowRes.body.borrowing.id;

    const res = await request(app).put(`/api/borrowings/return/${borrowingId}`);
    console.log('Borrowing ID before return:', borrowingId);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Book returned successfully');
    expect(res.body.borrowing).toHaveProperty('isReturned', true);
    expect(res.body.borrowing).toHaveProperty('returnDate');

    // Check book availability updated
    const updatedBook = await Book.findByPk(bookId);
    expect(updatedBook.availableCopies).toEqual(3);
  });
});
