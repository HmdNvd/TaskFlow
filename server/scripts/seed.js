const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedUsers() {
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const memberPassword = await bcrypt.hash('member123', salt);

    // Insert Admin user
    await pool.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      ['Admin User', 'admin@taskflow.com', adminPassword, 'admin']
    );

    // Insert Member user
    await pool.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      ['John Member', 'member@taskflow.com', memberPassword, 'member']
    );

    console.log('Seeding successful: Admin and Member accounts created.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedUsers();