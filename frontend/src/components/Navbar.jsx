import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const adminLinks = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/admin/students', label: '👨‍🎓 Students' },
  { to: '/admin/halls', label: '🏛️ Halls' },
  { to: '/admin/subjects', label: '📚 Subjects' },
  { to: '/admin/schedule', label: '📅 Schedule' },
  { to: '/admin/invigilators', label: '👤 Invigilators' },
  { to: '/admin/allocations', label: '🗺️ Allocations' },
];

const studentLinks = [
  { to: '/student/my-allocation', label: '🗺️ My Allocation' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <span className="font-bold text-lg hidden sm:block">Exam Hall System</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                location.pathname === link.to
                  ? 'bg-blue-600'
                  : 'hover:bg-blue-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-blue-200">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium transition"
          >
            Logout
          </button>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-900 px-4 pb-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 rounded text-sm hover:bg-blue-700"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
