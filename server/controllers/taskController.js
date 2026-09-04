const pool = require('../config/db');

const VALID_STATUSES = ['todo', 'in_progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// 1. GET /api/tasks/stats
exports.getTaskStats = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const role = req.user.role;

    let query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN assigned_to = ? THEN 1 ELSE 0 END) AS assigned_to_me
      FROM tasks
    `;

    const params = [userId];

    if (role === 'member') {
      query += ` WHERE assigned_to = ? OR created_by = ?`;
      params.push(userId, userId);
    }

    const [rows] = await pool.execute(query, params);

    return res.json({
      success: true,
      data: {
        total: Number(rows[0].total) || 0,
        todo: Number(rows[0].todo) || 0,
        in_progress: Number(rows[0].in_progress) || 0,
        completed: Number(rows[0].completed) || 0,
        assigned_to_me: Number(rows[0].assigned_to_me) || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/tasks - (BUG-05 FIX: WHERE 1=1 prevents SQL syntax crash on Admin filters)
exports.getTasks = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const role = req.user.role;
    const { status, priority, search } = req.query;

    let query = `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date,
        t.created_at, t.updated_at,
        u_assigned.id AS assigned_to,
        u_assigned.name AS assigned_to_name,
        u_created.id AS created_by,
        u_created.name AS created_by_name
      FROM tasks t
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      JOIN users u_created ON t.created_by = u_created.id
      WHERE 1=1
    `;

    const params = [];

    if (role === 'member') {
      query += ` AND (t.assigned_to = ? OR t.created_by = ?)`;
      params.push(userId, userId);
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ? OR u_assigned.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.created_at DESC`;

    const [tasks] = await pool.execute(query, params);

    return res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = Number(req.user.id);
    const role = req.user.role;

    const [rows] = await pool.execute(
      `SELECT 
        t.*, 
        u_assigned.name AS assigned_to_name, 
        u_created.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       JOIN users u_created ON t.created_by = u_created.id
       WHERE t.id = ?`,
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = rows[0];

    // BUG-04 FIX: Type-safe comparison with Number()
    if (
      role === 'member' &&
      Number(task.assigned_to) !== userId &&
      Number(task.created_by) !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied to this task.' });
    }

    return res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/tasks
exports.createTask = async (req, res, next) => {
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required.' });
  }

  // BUG-09 FIX: Validate enum inputs with 400 Bad Request
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value. Allowed: ${VALID_STATUSES.join(', ')}`
    });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority value. Allowed: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  if (req.user.role === 'member' && assigned_to !== undefined) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Members are not permitted to assign tasks.'
    });
  }

  try {
    const createdBy = Number(req.user.id);
    const taskStatus = status || 'todo';
    const taskPriority = priority || 'medium';
    const assignedTo = assigned_to || null;
    const dueDate = due_date || null;

    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, taskStatus, taskPriority, assignedTo, createdBy, dueDate]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        title,
        status: taskStatus,
        priority: taskPriority
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5. PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = Number(req.user.id);
  const role = req.user.role;
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  // Validate enums if provided
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value. Allowed: ${VALID_STATUSES.join(', ')}`
    });
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority value. Allowed: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  try {
    const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = tasks[0];

    // BUG-04 FIX: Type-safe comparison
    if (role === 'member') {
      if (Number(task.assigned_to) !== userId && Number(task.created_by) !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify this task.' });
      }

      // BUG-03 FIX: Strict check for undefined instead of truthy
      if (
        title !== undefined ||
        description !== undefined ||
        priority !== undefined ||
        assigned_to !== undefined ||
        due_date !== undefined
      ) {
        return res.status(403).json({ 
          success: false, 
          message: 'Members are only permitted to update task status.' 
        });
      }
    }

    const updatedTitle = title !== undefined ? title : task.title;
    const updatedDesc = description !== undefined ? description : task.description;
    const updatedStatus = status !== undefined ? status : task.status;
    const updatedPriority = priority !== undefined ? priority : task.priority;
    const updatedAssigned = assigned_to !== undefined ? assigned_to : task.assigned_to;
    const updatedDueDate = due_date !== undefined ? due_date : task.due_date;

    await pool.execute(
      `UPDATE tasks 
       SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedStatus, updatedPriority, updatedAssigned, updatedDueDate, taskId]
    );

    // BUG-10 FIX: Return the freshly updated record in `data`
    const [updatedRows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.json({
      success: true,
      data: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  const taskId = req.params.id;

  try {
    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // BUG-11 FIX: Consistent contract returning { success: true, data: { id } }
    return res.json({
      success: true,
      data: { id: Number(taskId) }
    });
  } catch (error) {
    next(error);
  }
};