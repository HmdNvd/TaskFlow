const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format should be: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token missing or invalid.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contains: { id, email, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = authenticateToken;