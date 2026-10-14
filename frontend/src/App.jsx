import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Halls from './pages/admin/Halls';
import Subjects from './pages/admin/Subjects';
import Schedule from './pages/admin/Schedule';
import Invigilators from './pages/admin/Invigilators';
import Allocations from './pages/admin/Allocations';
import MyAllocation from './pages/student/MyAllocation';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><Students /></ProtectedRoute>} />
          <Route path="/admin/halls" element={<ProtectedRoute role="admin"><Halls /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute role="admin"><Subjects /></ProtectedRoute>} />
          <Route path="/admin/schedule" element={<ProtectedRoute role="admin"><Schedule /></ProtectedRoute>} />
          <Route path="/admin/invigilators" element={<ProtectedRoute role="admin"><Invigilators /></ProtectedRoute>} />
          <Route path="/admin/allocations" element={<ProtectedRoute role="admin"><Allocations /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student/my-allocation" element={<ProtectedRoute role="student"><MyAllocation /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
