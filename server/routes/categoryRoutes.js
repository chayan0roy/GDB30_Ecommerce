const express = require('express');
const router = express.Router();
const Category = require('../modules/categorySchema');
const passport = require('passport');


// POST /api/categories - Create category (admin only)
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { name, image } = req.body;

        // Check if category already exists
        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        category = new Category({
            name,
            image
        });

        await category.save();

        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/categories/:id - Get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { name, image } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, image },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/categories/parent/:parentId - Get child categories
router.get('/parent/:parentId', async (req, res) => {
    try {
        const categories = await Category.find({ parent: req.params.parentId });
        res.json(categories);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid parent ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;