const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All user routes require a valid JWT
router.use(authenticateToken);

router.get('/', authorizeRoles('admin'), userController.getUsers);

// Strictly Admin-Only operations
router.post('/', authorizeRoles('admin'), userController.createUser);
router.delete('/:id',  authorizeRoles('admin'), userController.deleteUser);

module.exports = router;