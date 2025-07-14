const express = require('express');
const router = express.Router();
const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token.');
  }
};

// 1. Get all users (Admin only)
router.get('/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden.');
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Get user by ID
router.get('/users/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found.');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 3. Get current user profile
router.get('/users/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('User not found.');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 4. User login
router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 5. User registration
router.post('/users/register', async (req, res) => {
  const { username, email, password, phoneNumber } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).send('Email already exists.');

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 6. Get user addresses
router.get('/users/:id/addresses', authenticate, async (req, res) => {
  if (req.user._id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).send('Forbidden.');
  }
  try {
    const user = await User.findById(req.params.id).populate('addresses');
    if (!user) return res.status(404).send('User not found.');
    res.json(user.addresses);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;