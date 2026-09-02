const bcrypt = require('bcryptjs');
const pool = require('../config/db');

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

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.'
    });
  }

  const assignedRole = role === 'admin' ? 'admin' : 'member';

  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, assignedRole]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        email,
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

  // Guard 1: Prevent self-deletion
  if (targetUserId === currentUserId) {
    return res.status(400).json({
      success: false,
      message: 'Self-deletion is prohibited. You cannot delete your own account.'
    });
  }

  try {
    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Execute deletion
    await pool.execute('DELETE FROM users WHERE id = ?', [targetUserId]);

    return res.json({
      success: true,
      data: { id: targetUserId }
    });
  } catch (error) {
    next(error);
  }
};