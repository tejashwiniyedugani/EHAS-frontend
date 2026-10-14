const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/students - get all students (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, roll_number, department, semester, created_at FROM users WHERE role='student' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/students/:id - get single student
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, roll_number, department, semester FROM users WHERE id = $1 AND role='student'",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/students/:id - update student (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, roll_number, department, semester } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, email=$2, roll_number=$3, department=$4, semester=$5
       WHERE id=$6 AND role='student' RETURNING id, name, email, roll_number, department, semester`,
      [name, email, roll_number, department, semester, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/students/:id - delete student (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1 AND role='student'", [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
