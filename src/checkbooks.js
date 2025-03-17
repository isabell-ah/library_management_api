const { Book } = require('./models');

async function checkBooks() {
  const books = await Book.findAll();
  console.log(books);
}

checkBooks();
