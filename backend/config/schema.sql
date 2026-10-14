-- ============================================================
-- Examination Hall Allocation System - Database Schema
-- Run this on your Neon PostgreSQL database
-- ============================================================

-- Users table (Admin + Students)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'admin' or 'student'
  roll_number VARCHAR(50) UNIQUE,              -- only for students
  department VARCHAR(100),
  semester INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exam Halls table
CREATE TABLE IF NOT EXISTS halls (
  id SERIAL PRIMARY KEY,
  hall_name VARCHAR(100) NOT NULL,
  hall_number VARCHAR(50) NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  building VARCHAR(100),
  floor INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  subject_name VARCHAR(150) NOT NULL,
  subject_code VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100),
  semester INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exam Schedule table
CREATE TABLE IF NOT EXISTS exam_schedule (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invigilators table
CREATE TABLE IF NOT EXISTS invigilators (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Allocations table (main allocation result)
CREATE TABLE IF NOT EXISTS allocations (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES exam_schedule(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  hall_id INTEGER REFERENCES halls(id) ON DELETE CASCADE,
  seat_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, student_id),
  UNIQUE(schedule_id, hall_id, seat_number)
);

-- Hall-Invigilator assignment table
CREATE TABLE IF NOT EXISTS hall_invigilators (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES exam_schedule(id) ON DELETE CASCADE,
  hall_id INTEGER REFERENCES halls(id) ON DELETE CASCADE,
  invigilator_id INTEGER REFERENCES invigilators(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Default admin user (password: Admin@123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@exam.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;
