// Book validation middleware
exports.validateBook = (req, res, next) => {
  const { title, isbn, publicationYear, authors, copies } = req.body;
  const errors = [];

  if (!title) errors.push('Title is required');
  if (!isbn) errors.push('ISBN is required');
  if (!publicationYear) errors.push('Publication year is required');
  if (!authors || (Array.isArray(authors) && authors.length === 0))
    errors.push('At least one author is required');
  if (!copies) errors.push('Number of copies is required');

  if (
    publicationYear &&
    (isNaN(publicationYear) ||
      publicationYear < 1000 ||
      publicationYear > new Date().getFullYear())
  ) {
    errors.push('Publication year must be a valid year');
  }

  if (copies && (isNaN(copies) || copies < 0)) {
    errors.push('Number of copies must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Borrowing validation middleware
exports.validateBorrowing = (req, res, next) => {
  const { bookId, userId, dueDate } = req.body;
  const errors = [];

  if (!bookId) errors.push('Book ID is required');
  if (!userId) errors.push('User ID is required');

  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const today = new Date();

    if (isNaN(dueDateObj.getTime())) {
      errors.push('Due date must be a valid date');
    } else if (dueDateObj <= today) {
      errors.push('Due date must be in the future');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// User validation middleware
exports.validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name) errors.push('Name is required');
  if (!email) errors.push('Email is required');

  // Basic email validation
  if (email && !email.match(/^\S+@\S+\.\S+$/)) {
    errors.push('Email format is invalid');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
