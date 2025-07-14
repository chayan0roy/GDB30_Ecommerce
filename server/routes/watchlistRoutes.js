const express = require('express');
const router = express.Router();
const { Watchlist } = require('../modules/watchlistSchema');
const { Product } = require('../modules/productSchema');
const passport = require('passport');

// 1. Get user's watchlist
router.get('/watchlist', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id })
      .populate('products.product');
    
    if (!watchlist) {
      return res.json({ products: [] }); // Return empty array if no watchlist exists
    }
    res.json(watchlist);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Add product to watchlist
router.post('/watchlist/add/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).send('Product not found.');

    let watchlist = await Watchlist.findOne({ user: req.user._id });
    
    if (!watchlist) {
      watchlist = new Watchlist({ 
        user: req.user._id, 
        products: [{ product: req.params.productId }] 
      });
    } else {
      // Check if product already exists in watchlist
      const exists = watchlist.products.some(
        item => item.product.toString() === req.params.productId
      );
      if (exists) return res.status(400).send('Product already in watchlist.');

      watchlist.products.push({ product: req.params.productId });
    }

    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 3. Remove product from watchlist
router.delete('/watchlist/remove/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) return res.status(404).send('Watchlist not found.');

    watchlist.products = watchlist.products.filter(
      item => item.product.toString() !== req.params.productId
    );

    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;