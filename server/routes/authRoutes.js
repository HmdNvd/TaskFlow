const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/tempAuth');

// Public route: Login
router.post('/login', authController.login);

// Protected route: Current user session
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;