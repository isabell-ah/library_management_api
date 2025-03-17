const { User, Borrowing, Book } = require('../models');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve users', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve user', error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User with this email already exists' });
    }
    const newUser = await User.create({
      name,
      email,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to create user', error: error.message });
  }
};

// Get user's borrowing history
exports.getUserBorrowings = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const borrowings = await Borrowing.findAll({
      where: { UserId: userId },
      include: [{ model: Book }],
      order: [['borrowDate', 'DESC']],
    });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      borrowings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to retrieve user borrowings',
      error: error.message,
    });
  }
};
