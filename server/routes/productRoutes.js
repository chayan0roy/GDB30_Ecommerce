const express = require('express');
const router = express.Router();
const { Product } = require('../modules/productSchema');

// 1. Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).populate('categorie');
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 2. Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categorie');
    if (!product) return res.status(404).send('Product not found.');
    res.json(product);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// 3. Get products by category
router.get('/products/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.find({ categorie: req.params.categoryId });
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

module.exports = router;