const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowing.controller');

router.get('/', borrowingController.getAllBorrowings);
router.get('/:id', borrowingController.getBorrowingById);
router.post('/borrow', borrowingController.borrowBook);
router.put('/return/:borrowingId', borrowingController.returnBook);

module.exports = router;
