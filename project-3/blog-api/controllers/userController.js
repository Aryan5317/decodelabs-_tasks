const bcrypt = require('bcryptjs');
const { User, Post } = require('../models');

// CREATE - Register a new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }

    // Never store plain-text passwords - hash before saving (Pillar 4: The Shield)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashedPassword });

    // Strip password out of the response
    const { password: _pw, ...safeUser } = user.toJSON();
    res.status(201).json(safeUser);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// READ - Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // never leak password hashes
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ - Get one user by ID (with their posts)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Post }],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE - Update a user's username/email
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { username, email } = req.body;
    await user.update({ username, email });

    const { password: _pw, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE - Delete a user (their posts get deleted too via CASCADE)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
