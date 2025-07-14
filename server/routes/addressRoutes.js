const express = require('express');
const router = express.Router();
const { Address } = require('../models/addressModel');
const authenticate = require('../middleware/auth');

// 1. Get all addresses for authenticated user
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Get address by ID (user-specific)
router.get('/addresses/:id', authenticate, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!address) return res.status(404).send('Address not found.');
    res.json(address);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 3. Get/set default address
router.get('/addresses/default', authenticate, async (req, res) => {
  try {
    const address = await Address.findOne({
      user: req.user._id,
      isDefault: true
    });
    res.json(address || null);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

router.patch('/addresses/default/:id', authenticate, async (req, res) => {
  try {
    // Reset all other addresses to non-default
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    // Set the selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!address) return res.status(404).send('Address not found.');
    res.json(address);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// (Optional) Create/update/delete addresses
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const address = new Address({ ...req.body, user: req.user._id });
    await address.save();
    res.status(201).json(address);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;