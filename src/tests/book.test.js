const request = require('supertest');
const app = require('../app');
const { sequelize, Book, Author } = require('../models');

// Set up test environment
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('Book API', () => {
  let bookId;

  // Test creating a book
  test('Should create a new book', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        title: 'Test Book',
        isbn: '1234567890123',
        publicationYear: 2020,
        authors: ['Test Author'],
        rating: 4.5,
        copies: 5,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Book');
    expect(res.body).toHaveProperty('isbn', '1234567890123');
    expect(res.body.Authors).toHaveLength(1);
    expect(res.body.Authors[0].name).toEqual('Test Author');

    bookId = res.body.id;
  });

  // Test getting all books
  test('Should get all books', async () => {
    const res = await request(app).get('/api/books');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('books');
    expect(res.body.books).toBeInstanceOf(Array);
    expect(res.body.books.length).toBeGreaterThan(0);
  });

  // Test getting a book by ID
  test('Should get a book by ID', async () => {
    const res = await request(app).get(`/api/books/${bookId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Test Book');
    expect(res.body).toHaveProperty('isbn', '1234567890123');
  });

  // Test updating a book
  test('Should update a book', async () => {
    const res = await request(app)
      .put(`/api/books/${bookId}`)
      .send({
        title: 'Updated Test Book',
        isbn: '0987654321', // ✅ Changed from `ISBN` to `isbn`
        publicationYear: 2020,
        authors: ['Updated Author'],
        copies: 3,
        rating: 5.0,
      });

    console.log('Update response:', res.body);

    expect(res.statusCode).toEqual(200);
  });

  // Test book search
  test('Should search books by title', async () => {
    const res = await request(app).get('/api/books?search=Updated');

    expect(res.statusCode).toEqual(200);
    expect(res.body.books).toBeInstanceOf(Array);
    expect(res.body.books.length).toBeGreaterThan(0);
    if (res.body.books.length > 0) {
      expect(res.body.books[0].title).toContain('Updated');
    }
  });

  // Test deleting a book
  test('Should delete a book', async () => {
    const res = await request(app).delete(`/api/books/${bookId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Book deleted successfully');

    // Verify book is deleted
    const getRes = await request(app).get(`/api/books/${bookId}`);
    expect(getRes.statusCode).toEqual(404);
  });
});
