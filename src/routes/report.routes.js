const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/overdue', reportController.getOverdueBooks);

module.exports = router;
