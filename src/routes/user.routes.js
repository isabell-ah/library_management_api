const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validateUser } = require('../middleware/validation.middleware');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateUser, userController.createUser);
router.get('/:id/borrowings', userController.getUserBorrowings);

module.exports = router;
