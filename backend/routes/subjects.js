const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/subjects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY subject_code ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/subjects (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { subject_name, subject_code, department, semester } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO subjects (subject_name, subject_code, department, semester) VALUES ($1, $2, $3, $4) RETURNING *',
      [subject_name, subject_code, department || null, semester || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/subjects/:id (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { subject_name, subject_code, department, semester } = req.body;
  try {
    const result = await pool.query(
      'UPDATE subjects SET subject_name=$1, subject_code=$2, department=$3, semester=$4 WHERE id=$5 RETURNING *',
      [subject_name, subject_code, department, semester, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/subjects/:id (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id=$1', [req.params.id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
