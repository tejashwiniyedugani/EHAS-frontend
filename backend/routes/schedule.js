const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/schedule - get all exam schedules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT es.*, s.subject_name, s.subject_code, s.department, s.semester
       FROM exam_schedule es
       JOIN subjects s ON es.subject_id = s.id
       ORDER BY es.exam_date ASC, es.start_time ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/schedule (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { subject_id, exam_date, start_time, end_time } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO exam_schedule (subject_id, exam_date, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [subject_id, exam_date, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/schedule/:id (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { subject_id, exam_date, start_time, end_time } = req.body;
  try {
    const result = await pool.query(
      'UPDATE exam_schedule SET subject_id=$1, exam_date=$2, start_time=$3, end_time=$4 WHERE id=$5 RETURNING *',
      [subject_id, exam_date, start_time, end_time, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/schedule/:id (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM exam_schedule WHERE id=$1', [req.params.id]);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
