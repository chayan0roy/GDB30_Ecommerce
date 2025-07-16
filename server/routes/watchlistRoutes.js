const express = require('express');
const router = express.Router();
const Watchlist = require('../modules/watchlistSchema');
const Product = require('../modules/productSchema');
const passport = require('passport');



// GET /api/watchlist - Get user's watchlist
router.get('/',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: req.user.id })
            .populate('products.product', 'name price images');

        if (!watchlist) {
            // Return empty array if no watchlist exists
            return res.json({ products: [] });
        }

        res.json(watchlist.products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/watchlist/:productId - Add to watchlist
router.post('/:productId',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Check if product exists
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create watchlist for user
        let watchlist = await Watchlist.findOne({ user: req.user.id });

        if (!watchlist) {
            watchlist = new Watchlist({
                user: req.user.id,
                products: []
            });
        }

        // Check if product already in watchlist
        const existingItem = watchlist.products.find(
            item => item.product.toString() === req.params.productId
        );

        if (existingItem) {
            return res.status(400).json({ message: 'Product already in watchlist' });
        }

        // Add product to watchlist
        watchlist.products.push({
            product: req.params.productId,
            addedAt: new Date()
        });

        await watchlist.save();

        res.status(201).json({ message: 'Product added to watchlist' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/watchlist/:productId - Remove from watchlist
router.delete('/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: req.user.id });

        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }

        // Remove product from watchlist
        watchlist.products = watchlist.products.filter(
            item => item.product.toString() !== req.params.productId
        );

        await watchlist.save();

        res.json({ message: 'Product removed from watchlist' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid product ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;