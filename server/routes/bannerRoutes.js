const express = require('express');
const router = express.Router();
const { Banner } = require('../modules/bannerSchema');
const passport = require('passport');

// 1. Get all banners (Admin only)
router.get('/banners', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.post('/banners', passport.authenticate('jwt', { session: false }), async (req, res) => {
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