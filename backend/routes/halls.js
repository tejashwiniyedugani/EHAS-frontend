const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/halls - get all halls
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM halls ORDER BY hall_number ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/halls - create hall (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { hall_name, hall_number, capacity, building, floor } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO halls (hall_name, hall_number, capacity, building, floor)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [hall_name, hall_number, capacity, building || null, floor || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/halls/:id - update hall (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { hall_name, hall_number, capacity, building, floor, is_available } = req.body;
  try {
    const result = await pool.query(
      `UPDATE halls SET hall_name=$1, hall_number=$2, capacity=$3, building=$4, floor=$5, is_available=$6
       WHERE id=$7 RETURNING *`,
      [hall_name, hall_number, capacity, building, floor, is_available, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Hall not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/halls/:id - delete hall (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM halls WHERE id=$1', [req.params.id]);
    res.json({ message: 'Hall deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
