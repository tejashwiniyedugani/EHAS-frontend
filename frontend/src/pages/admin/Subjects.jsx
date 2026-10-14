import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const empty = { subject_name: '', subject_code: '', department: '', semester: '' };

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = async () => {
    try { const res = await api.get('/subjects'); setSubjects(res.data); }
    catch { toast.error('Failed to load subjects'); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) { await api.put(`/subjects/${editId}`, form); toast.success('Subject updated!'); }
      else { await api.post('/subjects', form); toast.success('Subject added!'); }
      setForm(empty); setEditId(null); setShowForm(false); fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); toast.success('Subject deleted'); fetchSubjects(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📚 Subjects</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
            {showForm ? 'Cancel' : '+ Add Subject'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['subject_name','Subject Name'], ['subject_code','Subject Code'], ['department','Department']].map(([f, l]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update' : 'Add Subject'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-50">
              <tr>{['Code', 'Name', 'Department', 'Semester', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {subjects.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No subjects yet</td></tr>
                : subjects.map(s => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{s.subject_code}</td>
                    <td className="px-4 py-3">{s.subject_name}</td>
                    <td className="px-4 py-3">{s.department || '-'}</td>
                    <td className="px-4 py-3">{s.semester || '-'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={() => { setForm({ ...s, semester: String(s.semester) }); setEditId(s.id); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
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
