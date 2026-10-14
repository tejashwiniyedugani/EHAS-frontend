const express = require('express');
const pool = require('../config/db');
const PDFDocument = require('pdfkit');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/allocations/auto-allocate - Auto allocate students to halls (admin)
router.post('/auto-allocate', authMiddleware, adminMiddleware, async (req, res) => {
  const { schedule_id } = req.body;

  try {
    // Get exam schedule + subject info
    const scheduleResult = await pool.query(
      `SELECT es.*, s.subject_name, s.department, s.semester
       FROM exam_schedule es JOIN subjects s ON es.subject_id = s.id
       WHERE es.id = $1`,
      [schedule_id]
    );
    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    const schedule = scheduleResult.rows[0];

    // Get students for this subject's department & semester
    const studentsResult = await pool.query(
      `SELECT id FROM users WHERE role='student' AND department=$1 AND semester=$2 ORDER BY roll_number ASC`,
      [schedule.department, schedule.semester]
    );
    const students = studentsResult.rows;

    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found for this exam' });
    }

    // Get available halls
    const hallsResult = await pool.query(
      'SELECT * FROM halls WHERE is_available=TRUE ORDER BY capacity DESC'
    );
    const halls = hallsResult.rows;

    if (halls.length === 0) {
      return res.status(400).json({ message: 'No available halls' });
    }

    // Clear existing allocations for this schedule
    await pool.query('DELETE FROM allocations WHERE schedule_id=$1', [schedule_id]);

    // Allocate students to halls
    let studentIndex = 0;
    const allocations = [];

    for (const hall of halls) {
      if (studentIndex >= students.length) break;
      let seatNumber = 1;

      while (seatNumber <= hall.capacity && studentIndex < students.length) {
        const student = students[studentIndex];
        await pool.query(
          'INSERT INTO allocations (schedule_id, student_id, hall_id, seat_number) VALUES ($1, $2, $3, $4)',
          [schedule_id, student.id, hall.id, `${hall.hall_number}-${seatNumber}`]
        );
        allocations.push({
          student_id: student.id,
          hall_id: hall.id,
          hall_number: hall.hall_number,
          seat_number: `${hall.hall_number}-${seatNumber}`,
        });
        seatNumber++;
        studentIndex++;
      }
    }

    res.json({
      message: `Successfully allocated ${allocations.length} students`,
      total_students: students.length,
      allocated: allocations.length,
      unallocated: students.length - allocations.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/allocations/:schedule_id - Get allocations for a schedule
router.get('/:schedule_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS student_name, u.roll_number, u.department, u.semester,
              h.hall_name, h.hall_number, h.building, h.floor,
              es.exam_date, es.start_time, es.end_time,
              s.subject_name, s.subject_code
       FROM allocations a
       JOIN users u ON a.student_id = u.id
       JOIN halls h ON a.hall_id = h.id
       JOIN exam_schedule es ON a.schedule_id = es.id
       JOIN subjects s ON es.subject_id = s.id
       WHERE a.schedule_id = $1
       ORDER BY h.hall_number ASC, a.seat_number ASC`,
      [req.params.schedule_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/allocations/student/my-allocation - Student views their own allocation
router.get('/student/my-allocation', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, h.hall_name, h.hall_number, h.building, h.floor,
              es.exam_date, es.start_time, es.end_time,
              s.subject_name, s.subject_code
       FROM allocations a
       JOIN halls h ON a.hall_id = h.id
       JOIN exam_schedule es ON a.schedule_id = es.id
       JOIN subjects s ON es.subject_id = s.id
       WHERE a.student_id = $1
       ORDER BY es.exam_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/allocations/:schedule_id/pdf - Download seating arrangement as PDF
router.get('/:schedule_id/pdf', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS student_name, u.roll_number,
              h.hall_name, h.hall_number,
              es.exam_date, es.start_time, es.end_time,
              s.subject_name, s.subject_code
       FROM allocations a
       JOIN users u ON a.student_id = u.id
       JOIN halls h ON a.hall_id = h.id
       JOIN exam_schedule es ON a.schedule_id = es.id
       JOIN subjects s ON es.subject_id = s.id
       WHERE a.schedule_id = $1
       ORDER BY h.hall_number ASC, a.seat_number ASC`,
      [req.params.schedule_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No allocations found for this schedule' });
    }

    const rows = result.rows;
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=seating-arrangement-${req.params.schedule_id}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold')
       .text('Examination Hall Allocation System', { align: 'center' });
    doc.moveDown(0.5);

    const first = rows[0];
    doc.fontSize(13).font('Helvetica-Bold')
       .text(`Subject: ${first.subject_name} (${first.subject_code})`, { align: 'center' });
    doc.fontSize(11).font('Helvetica')
       .text(`Date: ${new Date(first.exam_date).toDateString()}   Time: ${first.start_time} - ${first.end_time}`, { align: 'center' });
    doc.moveDown(1);

    // Group by hall
    const hallMap = {};
    rows.forEach(row => {
      if (!hallMap[row.hall_number]) hallMap[row.hall_number] = [];
      hallMap[row.hall_number].push(row);
    });

    Object.entries(hallMap).forEach(([hallNo, students]) => {
      doc.fontSize(13).font('Helvetica-Bold').text(`Hall: ${students[0].hall_name} (${hallNo})`);
      doc.moveDown(0.3);

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Seat No.', 40, doc.y, { width: 80, continued: true });
      doc.text('Roll Number', 120, doc.y, { width: 120, continued: true });
      doc.text('Student Name', 240, doc.y, { width: 200 });
      doc.moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.2);

      students.forEach((s) => {
        doc.fontSize(10).font('Helvetica');
        doc.text(s.seat_number, 40, doc.y, { width: 80, continued: true });
        doc.text(s.roll_number || '-', 120, doc.y, { width: 120, continued: true });
        doc.text(s.student_name, 240, doc.y, { width: 200 });
      });

      doc.moveDown(1);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
