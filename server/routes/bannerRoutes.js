const express = require('express');
const router = express.Router();
const { Banner } = require('../models/bannerModel');
const authenticate = require('../middleware/auth');

// 1. Get all banners (Admin only)
router.get('/banners', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden.');
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Get active banners (Public)
router.get('/banners/active', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// (Optional) Admin-only banner management
router.post('/banners', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden.');
  try {
    const { title, subtitle, image, link } = req.body;
    const banner = new Banner({ title, subtitle, image, link });
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;