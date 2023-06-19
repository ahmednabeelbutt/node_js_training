/*
 * Routes:
 *
 * POST /users/create - Create a new user
 * PUT /users/edit/:id - Update an existing user
 * DELETE /users/delete/:id - Delete a user
 * GET /users - Get all users
 * GET /users/login - For Login
 * GET /users/dashboard - Welcome User After Login (Protected Route)
 */

const express = require('express')
const fs = require('fs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const usersFile = path.join(__dirname, '../users.json');;

const secretKey = 'test-key';

// Read the existing users from the JSON file
function getUsers() {
    const data = fs.readFileSync(usersFile);
    return JSON.parse(data);
}

// Validate user credentials
function validateUser(email, password) {
    const users = getUsers();
    const user = users.find((user) => user.email === email && user.password === password);
    return user;
}

// Get the count of users
function getUserCount() {
    const users = getUsers();
    return users.length;
}
  
// Write the updated users to the JSON file
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}


// Middleware function to secure public routes
function authenticateToken(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
  
    try {
      // Verify and decode the token
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = decoded.username;
        next();
      });
    } catch (err) {
      res.status(500).json({ message: 'Server Error' });
    }
}

// Middleware function to validate user data
function validateUserData(req, res, next) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    next();
}

// Route to create a new user
router.post('/create', validateUserData, (req, res) => {

    const { name, email, password } = req.body;
  
    // Read existing users
    const users = getUsers();
    
    // Validate if the email already exists
    const userExists = users.some(user => user.email === email);

    if (userExists) {
        return res.status(409).json({ message: 'User already exists' });
    }
    
    // Generate a new user ID
    const userId = (getUserCount() + 1).toString();
  
    // Create a new user object
    const newUser = {
      id: userId,
      name,
      email,
      password
    };
  
    // Add the new user to the existing users
    users.push(newUser);
  
    // Save the updated users to the JSON file
    saveUsers(users);
  
    res.status(201).json(newUser);
});

// Route to authenticate user and generate JWT token
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate user credentials
    const user = validateUser(email, password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, secretKey);

    res.json({ token });
});
  
// Protected route example
router.get('/dashboard', authenticateToken, (req, res) => {
    // Verify JWT token
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, secretKey);

        // Access the username from the decoded token
        const email = decoded.email;

        res.json({ message: `Welcome, ${email}!` });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});
  
router.get('/', (req, res) => {
    // Read existing users
    const users = getUsers();
    res.send(users);
});


// Route to update an existing user
router.put('/edit/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
  
    // Read existing users
    const users = getUsers();
  
    // Find the user to update
    const userToUpdate = users.find(user => user.id === id);
  
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Update the user's name/email/password
    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.password = password || userToUpdate.password;
  
    // Save the updated users to the JSON file
    saveUsers(users);
  
    res.json(userToUpdate);
});
  

// Route to delete an existing user
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
  
    // Read existing users
    const users = getUsers();
  
    // Find the user to delete
    const userIndex = users.findIndex(user => user.id === id);
  
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Remove the user from the array
    const deletedUser = users.splice(userIndex, 1)[0];
  
    // Save the updated users to the JSON file
    saveUsers(users);
  
    res.json(deletedUser);
});

module.exports = router;