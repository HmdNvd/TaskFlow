const pool = require('../config/db');

// GET /api/users - List users for assignment dropdowns
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users ORDER BY name ASC'
    );
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};