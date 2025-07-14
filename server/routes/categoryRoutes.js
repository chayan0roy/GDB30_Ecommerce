const express = require('express');
const router = express.Router();
const { Category } = require('../modules/categorySchema');
const passport = require('passport');

// 1. Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found.');
    res.json(category);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// (Optional) Admin-only category management routes
router.post('/categories', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden.');
  try {
    const { name, image } = req.body;
    const category = new Category({ name, image });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;