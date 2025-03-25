# A Library API
## 1.Book Management
○ Add a new book with the following fields:
    ■ Title
    ■ ISBN
    ■ Publication Year
    ■ Author(s)
    ■ Image
    ■ Rating
    ■ Number of copies
    ○ Update book details.
○ Delete a book (only if it’s not currently borrowed).
○ List all books with pagination.
○ Use the following sample books dataset: Books.csv
## 2. Borrowing and Returning Books
○ Borrow a book:
    ■ Check if the book is available.
    ■ Track the borrowing user (use a simple users table).
    ■ Set a due date for returning the book (default 14 days).
○ Return a book:
    ■ Update the book’s availability.
    ■ Track late returns (if returned after the due date).
## 3. Reports
○ List overdue books with user details and days overdue.

# Technical Requirements
## 1. Node.js: Use the latest version of Node.js.
## 2. Express.js: The API must be implemented using Express.js.
## 3. Database ORM: Use an ORM (we recommend Sequelize) to manage your database
interactions.
## 4. Database Seeding: Seed the database with initial data to demonstrate the application’s
functionality.
## 5. Automated Setup: Provide an npm script (e.g., _npm run migrate_) that sets up and
seeds the database with the books.csv sample books.
● Standardized Commands: Ensure that the application can be set up and started with
these commands:

    ○ _npm install_ – to install dependencies.
    ○ _npm run migrate_ – to create and seed the database.
    ○ _npm start_ – to start the API server.
    ○ _npm test_ – to run automated tests.
    
## 6. RESTful Standards: Follow RESTful API standards in your design.
## 7. Valid
