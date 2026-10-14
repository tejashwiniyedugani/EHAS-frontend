const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/invigilators
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invigilators ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/invigilators
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, phone, department } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO invigilators (name, email, phone, department) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone || null, department || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/invigilators/:id
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, phone, department } = req.body;
  try {
    const result = await pool.query(
      'UPDATE invigilators SET name=$1, email=$2, phone=$3, department=$4 WHERE id=$5 RETURNING *',
      [name, email, phone, department, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Invigilator not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/invigilators/:id
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM invigilators WHERE id=$1', [req.params.id]);
    res.json({ message: 'Invigilator deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/invigilators/assign - assign invigilator to hall for exam
router.post('/assign', authMiddleware, adminMiddleware, async (req, res) => {
  const { schedule_id, hall_id, invigilator_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hall_invigilators (schedule_id, hall_id, invigilator_id) VALUES ($1, $2, $3) RETURNING *',
      [schedule_id, hall_id, invigilator_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/invigilators/assignments/:schedule_id
router.get('/assignments/:schedule_id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hi.*, i.name AS invigilator_name, i.email, h.hall_name, h.hall_number
       FROM hall_invigilators hi
       JOIN invigilators i ON hi.invigilator_id = i.id
       JOIN halls h ON hi.hall_id = h.id
       WHERE hi.schedule_id = $1`,
      [req.params.schedule_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
