const express = require('express');
const router = express.Router();
const { Order } = require('../modules/orderSchema');
const { Cart } = require('../modules/cartSchema');
const { Product } = require('../modules/productSchema');
const passport = require('passport');

// 1. Get all orders (user-specific or admin)
router.get('/orders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const orders = req.user.role === 'admin' 
      ? await Order.find({}).populate('user items.product shippingAddress')
      : await Order.find({ user: req.user._id }).populate('items.product shippingAddress');
    
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Get order by ID
router.get('/orders/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user items.product shippingAddress');
    
    if (!order) return res.status(404).send('Order not found.');
    
    // Restrict access to owner/admin
    if (order.user._id.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).send('Forbidden.');
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 3. Create new order from cart
router.post('/orders/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { shippingAddressId, paymentMethod } = req.body;
  
  try {
    // Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).send('Cart is empty.');
    }

    // Validate stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.quantity < item.quantity) {
        return res.status(400).send(`Insufficient stock for ${product.name}.`);
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: shippingAddressId,
      paymentMethod,
      subtotal: cart.totalPrice,
      totalAmount: cart.totalPrice // Add shipping fee logic if needed
    });

    // Reduce product quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 4. Cancel order
router.patch('/orders/cancel/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('Order not found.');

    // Validate ownership
    if (order.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).send('Forbidden.');
    }

    // Only allow cancellation for pending/processing orders
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).send('Order cannot be cancelled at this stage.');
    }

    // Restore product quantities
    if (order.orderStatus === 'processing') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { quantity: item.quantity } }
        );
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;