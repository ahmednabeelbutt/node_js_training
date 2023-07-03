const express = require('express');
// const {body, validationResult} = require('express-validator')
const Product = require("../models/product");
const Category = require("../models/category");
const { authenticateUser } = require('../middlewares/authenticateUser');
const { checkAdmin } = require('../middlewares/checkAdmin');
const router = express.Router();

// Utility function to validate the request body
const validateRequestBody = (req, res, next) => {
   
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ error: 'Request body cannot be empty' });
  }
  
  next();
};
  
// Create a new product
router.post("/add", authenticateUser, checkAdmin, validateRequestBody, async (req, res) => {
    try {
      const { title, description, price, quantity, category } = req.body;
      // Check if the product already exists
      const existingProduct = await Product.findOne({ title });

      if (existingProduct) {
        return res.status(400).json({ error: "Product already exists" });
      }

        // Find the category by name
      const existing_category = await Category.findOne({ name: category });
      if (!existing_category) {
        return res.status(404).json({ error: "Category not found" });
      }

      const product = await Product.create({
        title,
        description,
        price,
        quantity,
        category: existing_category._id,
      });
        res.status(201).send(product);
    } catch (error) {
        res.status(500).send({ error: "Failed to create a product" });
    }
});

// Retrieve all products
router.get('/', async (req, res) => {
    try {
      const products = await Product.find();
      res.send(products);
    } catch (error) {
      res.status(500).send({ error: 'Failed to retrieve products' });
    }
});

// Retrieve a specific product
router.get('/:id', authenticateUser, checkAdmin, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).send({ error: 'Product not found' });
      }
      res.send(product);
    } catch (error) {
      res.status(500).send({ error: 'Failed to retrieve the product' });
    }
});

// Update a product 
router.put("/:id", authenticateUser, checkAdmin, async (req, res) => {
  try {
    const { title, description, price, quantity, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;

    if (category) {
      // Find the category by name
      const categoryObj = await Category.findOne({ name: category });
      if (!categoryObj) {
        return res.status(404).json({ error: "Category not found" });
      }
      product.category = categoryObj._id;
    }

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the product" });
  }
});


// Delete a product
router.delete('/:id', authenticateUser, checkAdmin, async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).send({ error: 'Product not found' });
      }
      res.send({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to delete the product' });
    }
});

module.exports = router;