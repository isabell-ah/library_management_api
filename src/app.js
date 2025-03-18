const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

// Routes import
const bookRoutes = require('./routes/book.routes');
const borrowingRoutes = require('./routes/borrowing.routes');
const reportRoutes = require('./routes/report.routes');
//
const userRoutes = require('./routes/user.routes');

//

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Library Management API' });
});

module.exports = app; // For testing
