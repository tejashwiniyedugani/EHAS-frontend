import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', roll_number: '', department: '', semester: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to fetch students');
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
        toast.success('Student updated!');
      } else {
        await api.post('/auth/register', { ...form, role: 'student' });
        toast.success('Student added!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, email: s.email, password: '', roll_number: s.roll_number || '', department: s.department || '', semester: s.semester || '' });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👨‍🎓 Students</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['name', 'Full Name'], ['email', 'Email'], ['password', 'Password'], ['roll_number', 'Roll Number'], ['department', 'Department']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required={field !== 'password' || !editId}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                {['Name', 'Email', 'Roll No.', 'Department', 'Semester', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No students yet</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.roll_number || '-'}</td>
                  <td className="px-4 py-3">{s.department || '-'}</td>
                  <td className="px-4 py-3">{s.semester || '-'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
