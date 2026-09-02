const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All task routes require an active token
router.use(authenticateToken);

// Dashboard statistics
router.get('/stats', taskController.getTaskStats);

// Task CRUD
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);

// Delete task: strictly Admin only
router.delete('/:id', authorizeRoles('admin'), taskController.deleteTask);

module.exports = router;