const express = require("express");
const router = express.Router();
const Category = require("../models/category");

const { authenticateUser } = require('../middlewares/authenticateUser');
const { checkAdmin } = require('../middlewares/checkAdmin');

// Create a category
router.post("/add", authenticateUser, checkAdmin, async (req, res) => {
  try {
    const { name, parentName } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }
    
    let parentCategory = null;
    if (parentName) {
      // Find the parent category by name
      parentCategory = await Category.findOne({ name: parentName });
      
      if (!parentCategory) {
        return res.status(404).json({ error: "Parent category not found" });
      }
    }

    // Create a new category
    const category = await Category.create({ name, parentName: parentCategory });

    res.status(201).send(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create a category" });
  }
});

// Get all categories
router.get("/", authenticateUser, checkAdmin, async (req, res) => {
  try {
    const categories = await Category.find();

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get a single category by ID
router.get("/:id", authenticateUser, checkAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the category" });
  }
});

// Update a category
router.put("/:id", authenticateUser, checkAdmin, async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parent: parentId },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to update the category" });
  }
});

// Delete a category
router.delete("/:id", authenticateUser, checkAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the category" });
  }
});

module.exports = router;
