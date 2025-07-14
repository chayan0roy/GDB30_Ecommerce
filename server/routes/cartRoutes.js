const express = require('express');
const router = express.Router();
const { Cart } = require('../modules/cartSchema');
const { Product } = require('../modules/productSchema');
const passport = require('passport');




// 1. Get user's cart
router.get('/cart', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.status(404).send('Cart not found.');
    res.json(cart);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Add item to cart
router.post('/cart/add', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found.');

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 3. Remove item from cart
router.delete('/cart/remove/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).send('Cart not found.');

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 4. Update cart item quantity
router.patch('/cart/update/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).send('Cart not found.');

    const itemIndex = cart.items.findIndex(item => item.product.toString() === req.params.productId);
    if (itemIndex < 0) return res.status(404).send('Item not found in cart.');

    cart.items[itemIndex].quantity = quantity;

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;