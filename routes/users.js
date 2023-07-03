const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

// Utility function to validate the request body
const validateRequestBody = (req, res, next) => {
    // Add your validation logic here
    // For example, you can check if the required fields are present in the request body
  
    // Example validation: Check if 'name' field is present
    if (!req.body.fname) {
      return res.status(400).send("First Name is required");
    }
  
    next(); // If the request body is valid, move to the next middleware/route handler
  };


// Register a new user
router.post('/register', validateRequestBody, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fname, lname, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({ fname, lname, email, password: hashedPassword, role });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login a user
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, 'secret_key');

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Retrieve all users
router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.send(users);
    } catch (error) {
      res.status(500).send({ error: 'Failed to retrieve users' });
    }
});

// Retrieve a specific user
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: 'Failed to retrieve the user' });
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true
      });
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: 'Failed to update the user' });
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.send({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to delete the user' });
    }
});

// Create a new user
router.post("/", validateRequestBody, async (req, res) => {
    try {
      const user = await User.create(req.body);
      res.status(201).send(user);
    } catch (error) {
      res.status(500).send({ error: "Failed to create a user" });
    }
});

module.exports = router;