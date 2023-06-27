const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token and authenticate the user
function authenticateUser(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, 'secret_key');
      req.user = decoded;

      next();
    } catch (error) {
        console.log(req.user)
      return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authenticateUser };