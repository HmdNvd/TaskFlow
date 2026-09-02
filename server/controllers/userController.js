const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const VALID_ROLES = ['admin', 'member'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/users - List users for assignment dropdowns
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY name ASC'
    );
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users - Admin provisions a new user
exports.createUser = async (req, res, next) => {
  const { name, email, password, role } = req.body || {};

  // 1. Required fields presence check
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.'
    });
  }

  // 2. Email format validation (BUG-1 Fix)
  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format.'
    });
  }

  // 3. Password length check (BUG-2 Fix)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  // 4. Role validation check (BUG-6 Fix)
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed roles are: ${VALID_ROLES.join(', ')}`
    });
  }

  const assignedRole = role || 'member';
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 5. Unique email check
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // 6. Secure password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Persist user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, assignedRole]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
        role: assignedRole
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id - Admin deletes a user
exports.deleteUser = async (req, res, next) => {
  const targetUserId = Number(req.params.id);
  const currentUserId = Number(req.user.id);

  // 1. Integer ID validation (BUG-3 Fix)
  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID. Must be a positive integer.'
    });
  }

  // 2. Prevent self-deletion
  if (targetUserId === currentUserId) {
    return res.status(400).json({
      success: false,
      message: 'Self-deletion is prohibited. You cannot delete your own account.'
    });
  }

  try {
    // 3. Check if user exists
    const [existing] = await pool.execute('SELECT id, name FROM users WHERE id = ?', [targetUserId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // 4. Check for authored tasks to prevent accidental bulk data destruction (BUG-4 Fix)
    const [createdTasks] = await pool.execute(
      'SELECT COUNT(*) AS count FROM tasks WHERE created_by = ?',
      [targetUserId]
    );
    const authoredCount = Number(createdTasks[0].count);

    if (authoredCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete user: they authored ${authoredCount} task(s). Reassign or delete these tasks before removing the user.`
      });
    }

    // 5. Check affected assigned tasks for caller feedback (BUG-5 Fix)
    const [assignedTasks] = await pool.execute(
      'SELECT COUNT(*) AS count FROM tasks WHERE assigned_to = ?',
      [targetUserId]
    );
    const unassignedCount = Number(assignedTasks[0].count);

    // 6. Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [targetUserId]);

    return res.json({
      success: true,
      data: {
        id: targetUserId,
        tasks_unassigned: unassignedCount
      }
    });
  } catch (error) {
    next(error);
  }
};