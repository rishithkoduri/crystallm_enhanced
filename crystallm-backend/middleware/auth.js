const jwt = require('jsonwebtoken');

// Ensure you have a JWT_SECRET in your .env file (e.g., JWT_SECRET=my_super_secret_key_123)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expects "Bearer <token>"

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attaches the verified user ID to the request
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
};

module.exports = protect;