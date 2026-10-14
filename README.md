# Examination Hall Allocation System

A full-stack web application for managing and automating examination hall allocation for students.

## 🚀 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT

## ✨ Features

- 👤 Admin & Student login
- 👨‍🎓 Student registration & management
- 🏛️ Hall/Room management
- 📚 Subject management
- 📅 Exam schedule management
- ⚡ Auto-allocation of students to halls
- 👤 Invigilator assignment
- 📄 PDF seating arrangement download
- 🗺️ Students can view their own seat allocation

## 🗄️ Database Setup (Neon)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and copy the **connection string**
3. Go to the SQL editor in Neon and run the contents of `backend/config/schema.sql`

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your Neon DATABASE_URL and JWT_SECRET to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 🌐 Deployment

### Backend → Render
1. Push to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set **Root Directory** to `backend`
4. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
5. Build command: `npm install` | Start command: `node server.js`

### Frontend → Vercel
1. Create new project on [vercel.com](https://vercel.com)
2. Connect your GitHub repo, set **Root Directory** to `frontend`
3. Set environment variable: `VITE_API_URL=https://your-render-backend-url/api`

## 🔑 Default Admin Credentials

- **Email**: admin@exam.com
- **Password**: Admin@123
