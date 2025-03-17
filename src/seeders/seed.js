const fs = require('fs');
const path = require('path');
const { Book, Author, User, sequelize } = require('../models');

const seedUsers = async () => {
  const users = [];
  console.log('Seeding users...');
  await User.bulkCreate(users);
  console.log('Users seeded successfully.');
};

const seedBooksAndAuthors = async () => {
  console.log('Seeding books and authors...');

  const jsonPath = path.join(__dirname, '../../data/Books.json'); // ✅ Load JSON file

  // Read and parse JSON file
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const booksData = JSON.parse(rawData);

  for (const book of booksData) {
    const newBook = await Book.create({
      title: book.title || 'Unknown Title',
      isbn: book.isbn ? book.isbn.toString() : 'Unknown ISBN',
      publicationYear: book.publication_year || 2000,
      image: book.image_url || null,
      rating: parseFloat(book.average_rating) || 0,
      copies: book.books_count || 1,
      availableCopies: book.books_count || 1,
    });

    // Handle authors
    const authors = book.authors
      ? book.authors.split(',').map((name) => name.trim())
      : ['Unknown Author'];
    for (const authorName of authors) {
      const [author] = await Author.findOrCreate({
        where: { name: authorName },
      });
      await newBook.addAuthor(author);
    }
  }

  console.log('Books and authors seeded successfully.');
};

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    await seedUsers();
    await seedBooksAndAuthors();
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
