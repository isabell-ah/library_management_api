// const express = require('express');
// const router = express.Router();
// const bookController = require('../controllers/book.controller');

// router.get('/', bookController.getAllBooks);
// router.get('/:id', bookController.getBookById);
// router.post('/', bookController.createBook);
// router.put('/:id', bookController.updateBook);
// router.delete('/:id', bookController.deleteBook);

// module.exports = router;

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { validateBook } = require('../middleware/validation.middleware');

// Book routes
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', validateBook, bookController.createBook);
router.put('/:id', validateBook, bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;
